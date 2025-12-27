"use server"

import { signIn as localSignIn, signUp as localSignUp, signOut as localSignOut } from "./auth"
import { redirect } from "next/navigation"

// Sign in action
export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const result = await localSignIn(email.toString(), password.toString())

  if (result.error) {
    return { error: result.error }
  }

  return { success: true }
}

// Sign up action
export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const fullName = formData.get("fullName")

  if (!email || !password || !fullName) {
    return { error: "All fields are required" }
  }

  // Validate password length
  if (password.toString().length < 6) {
    return { error: "Password must be at least 6 characters" }
  }

  const result = await localSignUp(email.toString(), password.toString(), fullName.toString())

  if (result.error) {
    return { error: result.error }
  }

  return { success: "Account created successfully! Redirecting to dashboard..." }
}

// Sign out action
export async function signOut() {
  await localSignOut()
  redirect("/auth/login")
}
