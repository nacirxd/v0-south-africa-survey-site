import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import { cookies } from "next/headers"

const SESSION_COOKIE_NAME = "session_id"
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export interface User {
  id: string
  email: string
  full_name: string | null
  country: string
}

function generateId() {
  return randomBytes(16).toString("hex")
}

async function getDbAdapter() {
  try {
    const { getDb } = await import("./db")
    return {
      type: "sqlite" as const,
      db: getDb(),
    }
  } catch (error) {
    console.log("[v0] Using fallback localStorage database")
    const { fallbackDb, initializeFallbackDb } = await import("./db-fallback")
    initializeFallbackDb()
    return {
      type: "fallback" as const,
      db: fallbackDb,
    }
  }
}

export async function createSession(userId: string) {
  const adapter = await getDbAdapter()
  const sessionId = generateId()
  const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString()

  if (adapter.type === "sqlite") {
    adapter.db
      .prepare(
        `
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (?, ?, ?)
  `,
      )
      .run(sessionId, userId, expiresAt)
  } else {
    adapter.db.sessions.create(sessionId, userId, expiresAt)
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  })

  return sessionId
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) return null

  const adapter = await getDbAdapter()

  if (adapter.type === "sqlite") {
    adapter.db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(new Date().toISOString())

    const session = adapter.db
      .prepare(
        `
      SELECT s.user_id, u.email, u.full_name, u.country
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ? AND s.expires_at > ?
    `,
      )
      .get(sessionId, new Date().toISOString()) as any

    if (!session) return null

    return {
      id: session.user_id,
      email: session.email,
      full_name: session.full_name,
      country: session.country,
    }
  } else {
    const session = adapter.db.sessions.findById(sessionId)
    if (!session) return null

    const user = adapter.db.users.findById(session.user_id)
    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      country: user.country,
    }
  }
}

export async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  console.log("[v0] SignIn attempt for:", email)
  const adapter = await getDbAdapter()
  console.log("[v0] Using adapter type:", adapter.type)

  let user: any

  if (adapter.type === "sqlite") {
    user = adapter.db.prepare("SELECT * FROM users WHERE email = ?").get(email)
  } else {
    user = adapter.db.users.findByEmail(email)
    console.log("[v0] Found user in fallback:", user ? "yes" : "no")
  }

  if (!user) {
    console.log("[v0] User not found")
    return { success: false, error: "Invalid email or password" }
  }

  console.log("[v0] Comparing passwords...")
  const isValid = await bcrypt.compare(password, user.password_hash)
  console.log("[v0] Password valid:", isValid)

  if (!isValid) {
    return { success: false, error: "Invalid email or password" }
  }

  await createSession(user.id)
  console.log("[v0] Session created successfully")

  return { success: true }
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
): Promise<{ success: boolean; error?: string }> {
  console.log("[v0] SignUp attempt for:", email)
  const adapter = await getDbAdapter()
  console.log("[v0] Using adapter type:", adapter.type)

  let existing: any

  if (adapter.type === "sqlite") {
    existing = adapter.db.prepare("SELECT id FROM users WHERE email = ?").get(email)
  } else {
    existing = adapter.db.users.findByEmail(email)
  }

  if (existing) {
    console.log("[v0] Email already exists")
    return { success: false, error: "Email already registered" }
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const userId = generateId()
  console.log("[v0] Creating user with ID:", userId)

  try {
    if (adapter.type === "sqlite") {
      adapter.db
        .prepare(
          `
        INSERT INTO users (id, email, password_hash, full_name)
        VALUES (?, ?, ?, ?)
      `,
        )
        .run(userId, email, passwordHash, fullName)

      adapter.db
        .prepare(
          `
        INSERT INTO profiles (user_id)
        VALUES (?)
      `,
        )
        .run(userId)
    } else {
      adapter.db.users.create({
        id: userId,
        email,
        password_hash: passwordHash,
        full_name: fullName,
        country: "South Africa",
        created_at: new Date().toISOString(),
      })
      console.log("[v0] User created in fallback DB")

      adapter.db.profiles.create({
        user_id: userId,
        total_earnings: 0,
        available_balance: 0,
        withdrawn_amount: 0,
        updated_at: new Date().toISOString(),
      })
      console.log("[v0] Profile created in fallback DB")
    }

    await createSession(userId)
    console.log("[v0] Session created, signup complete")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error during signup:", error)
    return { success: false, error: "Registration failed" }
  }
}

export async function signOut() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sessionId) {
    const adapter = await getDbAdapter()

    if (adapter.type === "sqlite") {
      adapter.db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId)
    } else {
      adapter.db.sessions.delete(sessionId)
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME)
}
