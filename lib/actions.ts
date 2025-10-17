"use server"

import { createClient } from "@supabase/supabase-js"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

async function createSupabaseClient() {
  const cookieStore = await cookies()

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      storage: {
        getItem: (key: string) => {
          return cookieStore.get(key)?.value
        },
        setItem: (key: string, value: string) => {
          try {
            cookieStore.set(key, value, {
              path: "/",
              maxAge: 60 * 60 * 24 * 7, // 7 days
            })
          } catch {
            // Server Component - cookies will be set by middleware
          }
        },
        removeItem: (key: string) => {
          try {
            cookieStore.delete(key)
          } catch {
            // Server Component - cookies will be removed by middleware
          }
        },
      },
    },
  })
}

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

  const supabase = await createSupabaseClient()

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
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

  const supabase = await createSupabaseClient()

  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "http"
  const origin = `${protocol}://${host}`

  try {
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.toString())
      .single()

    if (existingUser) {
      return { error: "This email is already registered. Try logging in or use another email." }
    }

    // If checkError is not "PGRST116" (no rows found), it's a real error
    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing user:", checkError)
    }

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        data: {
          full_name: fullName.toString(),
        },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      if (
        error.message.includes("User already registered") ||
        error.message.includes("already been registered") ||
        error.message.includes("email address is already registered")
      ) {
        return { error: "This email is already registered. Try logging in or use another email." }
      }

      if (error.message.includes("Password should be at least")) {
        return { error: "Password must be at least 6 characters." }
      }

      if (error.message.includes("Invalid email")) {
        return { error: "Please enter a valid email address." }
      }

      return { error: error.message }
    }

    if (signUpData.user) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(signUpData.user.id, {
          email_confirm: true,
        })
      } catch (confirmError) {
        console.error("Error confirming email:", confirmError)
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.toString(),
        password: password.toString(),
      })

      if (signInError) {
        return { success: "Account created successfully! Please log in." }
      }

      return { success: "Account created successfully! Redirecting...", redirect: "/dashboard" }
    }

    return { success: "Account created successfully! You can now log in." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Sign out action
export async function signOut() {
  const supabase = await createSupabaseClient()

  await supabase.auth.signOut()
  redirect("/auth/login")
}
