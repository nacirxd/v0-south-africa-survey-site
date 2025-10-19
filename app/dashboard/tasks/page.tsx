import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import DailyTasksList from "@/components/daily-tasks-list"
import MigrateTasksButton from "@/components/migrate-tasks-button"

export const dynamic = "force-dynamic"

export default async function TasksPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Connect Supabase to get started</h1>
      </div>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const nigeriaTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" }))
  const twentyFourHoursAgo = new Date(nigeriaTime.getTime() - 24 * 60 * 60 * 1000)

  const { data: completions } = await supabase
    .from("task_completions")
    .select("task_id, completed_at")
    .eq("user_id", user.id)
    .gte("completed_at", twentyFourHoursAgo.toISOString())

  const completedTaskIds = completions?.map((c) => c.task_id) || []

  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="mb-4">
        <MigrateTasksButton />
      </div>
      <DailyTasksList userId={user.id} initialCompletedTaskIds={completedTaskIds} />
    </DashboardLayout>
  )
}
