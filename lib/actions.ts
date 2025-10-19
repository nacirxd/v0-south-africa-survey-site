"use server"

import { createClient } from "@supabase/supabase-js"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

async function createSupabaseClient() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("sb-access-token")?.value

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {},
    },
  })
}

function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      if (error.message.includes("Invalid login credentials") || error.message.includes("invalid_credentials")) {
        return {
          error:
            "Email or password is incorrect. Please check your credentials and try again, or sign up if you don't have an account yet.",
        }
      }

      if (error.message.includes("Email not confirmed")) {
        return { error: "Please verify your email address before logging in." }
      }

      return { error: error.message }
    }

    if (data.session) {
      const cookieStore = await cookies()
      cookieStore.set("sb-access-token", data.session.access_token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })
      cookieStore.set("sb-refresh-token", data.session.refresh_token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })
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

  const cookieStore = await cookies()
  cookieStore.delete("sb-access-token")
  cookieStore.delete("sb-refresh-token")

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
    console.log("[v0] submitTaskCompletion called:", { userId, taskId, rewardAmount, taskTitle })
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
      .maybeSingle()

    if (checkError) {
      console.log("[v0] Error checking existing completion:", checkError)
      return { error: `Failed to verify task status: ${checkError.message}` }
    }

    if (existingCompletion) {
      console.log("[v0] Found existing completion, updating...")
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
        console.log("[v0] Error updating completion:", updateError)
        return { error: `Failed to update task completion: ${updateError.message}` }
      }
    } else {
      console.log("[v0] Creating new completion record...")
      // Create new completion record
      const { error: completionError } = await supabaseAdmin.from("task_completions").insert({
        user_id: userId,
        task_id: taskId,
        answers: answers,
        reward_earned: rewardAmount,
      })

      if (completionError) {
        console.log("[v0] Error creating completion:", completionError)
        return { error: `Failed to record task completion: ${completionError.message}` }
      }
    }

    console.log("[v0] Updating user earnings...")
    // Update user earnings
    const { data: earningsData, error: profileError } = await supabaseAdmin.rpc("update_user_earnings", {
      user_id: userId,
      amount: rewardAmount,
    })

    if (profileError) {
      console.log("[v0] Error updating earnings:", profileError)
      return { error: `Failed to update earnings: ${profileError.message}` }
    }
    console.log("[v0] Earnings updated successfully:", earningsData)

    console.log("[v0] Adding to earnings history...")
    // Add to earnings history
    const { error: historyError } = await supabaseAdmin.from("earnings_history").insert({
      user_id: userId,
      amount: rewardAmount,
      type: "task_completion",
      description: `Completed survey: ${taskTitle}`,
      task_id: taskId,
    })

    if (historyError) {
      console.log("[v0] Error adding to earnings history:", historyError)
      return { error: `Failed to record earnings history: ${historyError.message}` }
    }

    console.log("[v0] Incrementing task completions...")
    // Update task completion count
    const { error: taskError } = await supabaseAdmin.rpc("increment_task_completions", {
      task_id: taskId,
    })

    if (taskError) {
      console.log("[v0] Error incrementing task completions:", taskError)
      return { error: `Failed to update task statistics: ${taskError.message}` }
    }

    console.log("[v0] Task completion successful!")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error in submitTaskCompletion:", error)
    return { error: error instanceof Error ? error.message : "Unknown error occurred" }
  }
}

export async function migrateTasksToNigeria() {
  try {
    console.log("[v0] Starting migration of tasks to Nigeria...")
    const supabaseAdmin = createAdminClient()

    // Update all tasks with South Africa references to Nigeria
    const updates = [
      {
        title: "South African Cities Survey",
        newTitle: "Nigerian Cities Survey",
        newDescription: "Answer 5 questions about major cities in Nigeria including Lagos, Abuja, and Port Harcourt.",
      },
      {
        title: "Local Cuisine Preferences",
        newTitle: "Local Cuisine Preferences",
        newDescription: "Share your thoughts on traditional Nigerian dishes like jollof rice, suya, and pounded yam.",
      },
      {
        title: "Technology Usage Poll",
        newTitle: "Technology Usage Poll",
        newDescription: "Survey about technology adoption and internet usage patterns in Nigeria.",
      },
      {
        title: "Tourism Destinations",
        newTitle: "Tourism Destinations",
        newDescription: "Rate and review popular Nigerian tourist destinations and attractions.",
      },
      {
        title: "Healthcare Access Survey",
        newTitle: "Healthcare Access Survey",
        newDescription: "Questions about healthcare services and accessibility in Nigerian communities.",
      },
      {
        title: "Language Diversity Survey",
        newTitle: "Language Diversity Survey",
        newDescription:
          "Questions about the major languages of Nigeria including Hausa, Yoruba, and Igbo, and language preferences.",
      },
      {
        title: "Transportation Survey",
        newTitle: "Transportation Survey",
        newDescription: "Share your experience with public and private transportation in Nigerian cities.",
      },
      {
        title: "Climate and Weather",
        newTitle: "Climate and Weather",
        newDescription: "Answer questions about Nigerian climate patterns and seasonal preferences.",
      },
      {
        title: "Economic Insights Poll",
        newTitle: "Economic Insights Poll",
        newDescription: "Share your views on Nigerian economy, employment, and business opportunities.",
      },
      {
        title: "Education System Feedback",
        newTitle: "Education System Feedback",
        newDescription: "Provide feedback on the Nigerian education system and learning experiences.",
      },
    ]

    let successCount = 0
    let errorCount = 0

    for (const update of updates) {
      const { error } = await supabaseAdmin
        .from("daily_tasks")
        .update({
          title: update.newTitle,
          description: update.newDescription,
        })
        .eq("title", update.title)

      if (error) {
        console.error(`[v0] Error updating task "${update.title}":`, error)
        errorCount++
      } else {
        console.log(`[v0] Successfully updated task: ${update.title} -> ${update.newTitle}`)
        successCount++
      }
    }

    // Also update any remaining tasks that might have "South Africa" in description
    const { error: bulkError } = await supabaseAdmin.rpc("replace_south_africa_with_nigeria")

    if (bulkError) {
      console.error("[v0] Error in bulk update:", bulkError)
      // This is okay if the function doesn't exist, we'll handle it manually
    }

    console.log(`[v0] Migration complete: ${successCount} successful, ${errorCount} errors`)

    if (errorCount > 0) {
      return {
        success: `Migration partially complete: ${successCount} tasks updated, ${errorCount} errors`,
        successCount,
        errorCount,
      }
    }

    return { success: `Successfully migrated ${successCount} tasks to Nigeria!`, successCount }
  } catch (error) {
    console.error("[v0] Error in migrateTasksToNigeria:", error)
    return { error: error instanceof Error ? error.message : "Unknown error occurred during migration" }
  }
}
