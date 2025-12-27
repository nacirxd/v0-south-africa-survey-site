"use server"

import { cookies } from "next/headers"
import { createClient } from "./supabase/server"
import bcrypt from "bcryptjs"

const SALT_ROUNDS = 10
const SESSION_COOKIE_NAME = "session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export interface User {
  id: string
  email: string
  full_name: string | null
}

// Get current user from session
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    return null
  }

  const supabase = createClient()
  const { data: user, error } = await supabase.from("users").select("id, email, full_name").eq("id", sessionId).single()

  if (error || !user) {
    return null
  }

  return user
}

// Sign up new user
export async function signUp(email: string, password: string, fullName: string) {
  try {
    const supabase = createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

    if (existingUser) {
      return { error: "User with this email already exists" }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    // Create user
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        email,
        password_hash: passwordHash,
        full_name: fullName,
      })
      .select("id, email, full_name")
      .single()

    if (userError || !newUser) {
      return { error: userError?.message || "Failed to create user" }
    }

    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      country: "South Africa",
    })

    if (profileError) {
      // Rollback user creation if profile creation fails
      await supabase.from("users").delete().eq("id", newUser.id)
      return { error: "Failed to create user profile" }
    }

    // Create session
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
    })

    return { user: newUser }
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return { error: "An unexpected error occurred during signup" }
  }
}

// Sign in existing user
export async function signIn(email: string, password: string) {
  try {
    const supabase = createClient()

    // Get user by email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, full_name, password_hash")
      .eq("email", email)
      .single()

    if (userError || !user) {
      return { error: "Invalid email or password" }
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return { error: "Invalid email or password" }
    }

    // Create session
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
    }
  } catch (error) {
    console.error("[v0] Login error:", error)
    return { error: "An unexpected error occurred during login" }
  }
}

// Sign out user
export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
