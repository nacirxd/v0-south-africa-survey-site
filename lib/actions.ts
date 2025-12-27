"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies, headers } from "next/headers"
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

  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )

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

  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )

  const headersList = headers()
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

    const { error } = await supabase.auth.signUp({
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
      if (error.message.includes("email rate limit exceeded") || error.message.includes("Email rate limit exceeded")) {
        return { error: "Too many signup attempts. Please try again in a few minutes." }
      }

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

    return { success: "Account created successfully! You can now log in." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Sign out action
export async function signOut() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )

  await supabase.auth.signOut()
  redirect("/auth/login")
}
