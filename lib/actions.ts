"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

async function createSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server Component - cookies will be set by middleware
        }
      },
    },
  })
}

function createAdminClient() {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {},
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
  const supabaseAdmin = createAdminClient()

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

export async function submitTaskCompletion(
  userId: string,
  taskId: string,
  answers: any,
  rewardAmount: number,
  taskTitle: string,
) {
  try {
    const supabaseAdmin = createAdminClient()

    // Get current UTC time
    const now = new Date()

    // Calculate Nigeria time (UTC+1)
    const nigeriaOffset = 1 * 60
    const nigeriaTime = new Date(now.getTime() + nigeriaOffset * 60 * 1000)

    // Calculate 24 hours ago in Nigeria time
    const twentyFourHoursAgo = new Date(nigeriaTime.getTime() - 24 * 60 * 60 * 1000)

    // Check for existing completion
    const { data: existingCompletion, error: checkError } = await supabaseAdmin
      .from("task_completions")
      .select("id, completed_at")
      .eq("user_id", userId)
      .eq("task_id", taskId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      return { error: `Failed to verify task status: ${checkError.message}` }
    }

    if (existingCompletion) {
      const completionTime = new Date(existingCompletion.completed_at)
      const timeDiff = nigeriaTime.getTime() - completionTime.getTime()
      const hoursDiff = timeDiff / (1000 * 60 * 60)

      if (hoursDiff < 24) {
        return {
          error:
            "This survey has already been completed within the last 24 hours. Please wait before attempting again.",
        }
      }

      // Update existing record
      const { error: updateError } = await supabaseAdmin
        .from("task_completions")
        .update({
          answers: answers,
          reward_earned: rewardAmount,
          completed_at: now.toISOString(),
        })
        .eq("id", existingCompletion.id)

      if (updateError) {
        return { error: `Failed to update task completion: ${updateError.message}` }
      }
    } else {
      // Create new completion record
      const { error: completionError } = await supabaseAdmin.from("task_completions").insert({
        user_id: userId,
        task_id: taskId,
        answers: answers,
        reward_earned: rewardAmount,
      })

      if (completionError) {
        return { error: `Failed to record task completion: ${completionError.message}` }
      }
    }

    // Update user earnings
    const { error: profileError } = await supabaseAdmin.rpc("update_user_earnings", {
      user_id: userId,
      amount: rewardAmount,
    })

    if (profileError) {
      return { error: `Failed to update earnings: ${profileError.message}` }
    }

    // Add to earnings history
    const { error: historyError } = await supabaseAdmin.from("earnings_history").insert({
      user_id: userId,
      amount: rewardAmount,
      type: "task_completion",
      description: `Completed survey: ${taskTitle}`,
      task_id: taskId,
    })

    if (historyError) {
      return { error: `Failed to record earnings history: ${historyError.message}` }
    }

    // Update task completion count
    const { error: taskError } = await supabaseAdmin.rpc("increment_task_completions", {
      task_id: taskId,
    })

    if (taskError) {
      return { error: `Failed to update task statistics: ${taskError.message}` }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in submitTaskCompletion:", error)
    return { error: error instanceof Error ? error.message : "Unknown error occurred" }
  }
}
