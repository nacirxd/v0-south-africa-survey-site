import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import SurveyInterface from "@/components/survey-interface"

interface TaskPageProps {
  params: {
    taskId: string
  }
}

export default async function TaskPage({ params }: TaskPageProps) {
  console.log("[v0] Task page accessed with taskId:", params.taskId)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] User authenticated:", user ? user.id : "No user")

  if (!user) {
    console.log("[v0] No user found, redirecting to login")
    redirect("/auth/login")
  }

  // Get task details
  console.log("[v0] Fetching task with ID:", params.taskId)
  const { data: task, error: taskError } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("id", params.taskId)
    .maybeSingle()

  console.log("[v0] Task query result:", { task: task ? task.id : null, error: taskError })

  if (!task) {
    console.log("[v0] Task not found, redirecting to tasks list")
    redirect("/dashboard/tasks")
  }

  const now = new Date()
  const nigeriaOffset = 1 * 60 * 60 * 1000 // UTC+1 in milliseconds
  const nigeriaTime = new Date(now.getTime() + nigeriaOffset)
  const twentyFourHoursAgo = new Date(nigeriaTime.getTime() - 24 * 60 * 60 * 1000).toISOString()

  console.log("[v0] Checking for recent completion after:", twentyFourHoursAgo)

  const { data: recentCompletion, error: completionError } = await supabase
    .from("task_completions")
    .select("*")
    .eq("user_id", user.id)
    .eq("task_id", params.taskId)
    .gte("completed_at", twentyFourHoursAgo)
    .maybeSingle()

  console.log("[v0] Recent completion check:", {
    hasCompletion: !!recentCompletion,
    error: completionError,
  })

  if (recentCompletion) {
    console.log("[v0] Task already completed recently, redirecting to tasks list")
    redirect("/dashboard/tasks")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  console.log("[v0] Rendering survey interface for task:", task.title)

  return (
    <DashboardLayout user={user} profile={profile}>
      <SurveyInterface task={task} userId={user.id} />
    </DashboardLayout>
  )
}
