import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import { cookies } from "next/headers"
import { getDb } from "./db"

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

export async function createSession(userId: string) {
  const db = getDb()
  const sessionId = generateId()
  const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString()

  db.prepare(`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (?, ?, ?)
  `).run(sessionId, userId, expiresAt)

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

  const db = getDb()

  // Limpar sessões expiradas
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(new Date().toISOString())

  const session = db
    .prepare(`
    SELECT s.user_id, u.email, u.full_name, u.country
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > ?
  `)
    .get(sessionId, new Date().toISOString()) as any

  if (!session) return null

  return {
    id: session.user_id,
    email: session.email,
    full_name: session.full_name,
    country: session.country,
  }
}

export async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const db = getDb()

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any

  if (!user) {
    return { success: false, error: "Invalid email or password" }
  }

  const isValid = await bcrypt.compare(password, user.password_hash)

  if (!isValid) {
    return { success: false, error: "Invalid email or password" }
  }

  await createSession(user.id)

  return { success: true }
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
): Promise<{ success: boolean; error?: string }> {
  const db = getDb()

  // Verificar se email já existe
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email)

  if (existing) {
    return { success: false, error: "Email already registered" }
  }

  // Hash da senha
  const passwordHash = await bcrypt.hash(password, 10)
  const userId = generateId()

  try {
    // Criar usuário
    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name)
      VALUES (?, ?, ?, ?)
    `).run(userId, email, passwordHash, fullName)

    // Criar perfil
    db.prepare(`
      INSERT INTO profiles (user_id)
      VALUES (?)
    `).run(userId)

    // Criar sessão
    await createSession(userId)

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
    const db = getDb()
    db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId)
  }

  cookieStore.delete(SESSION_COOKIE_NAME)
}
