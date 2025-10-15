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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get task details
  const { data: task } = await supabase.from("daily_tasks").select("*").eq("id", params.taskId).single()

  if (!task) {
    redirect("/dashboard/tasks")
  }

  const now = new Date()
  const saOffset = 2 * 60 * 60 * 1000 // UTC+2 in milliseconds
  const saTime = new Date(now.getTime() + saOffset)
  const twentyFourHoursAgo = new Date(saTime.getTime() - 24 * 60 * 60 * 1000).toISOString()

  const { data: recentCompletion } = await supabase
    .from("task_completions")
    .select("*")
    .eq("user_id", user.id)
    .eq("task_id", params.taskId)
    .gte("completed_at", twentyFourHoursAgo)
    .single()

  if (recentCompletion) {
    redirect("/dashboard/tasks")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <DashboardLayout user={user} profile={profile}>
      <SurveyInterface task={task} userId={user.id} />
    </DashboardLayout>
  )
}
