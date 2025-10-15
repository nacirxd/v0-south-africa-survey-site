import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import DashboardOverview from "@/components/dashboard-overview"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardPage() {
  try {
    const supabase = await createClient()

    if (!supabase) {
      redirect("/auth/login")
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/login")
    }

    // Get user profile and stats
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    const southAfricaTime = new Date().toLocaleString("en-US", { timeZone: "Africa/Johannesburg" })
    const today = new Date(southAfricaTime)
    const todayString = today.toISOString().split("T")[0]

    // Get today's completed tasks count
    const { count: todayTasksCount } = await supabase
      .from("task_completions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("completed_at", `${todayString}T00:00:00.000Z`)
      .lte("completed_at", `${todayString}T23:59:59.999Z`)

    const { data: allTasks } = await supabase.from("daily_tasks").select("*").eq("is_active", true).order("id")

    const twentyFourHoursAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString()
    const { data: recentCompletions } = await supabase
      .from("task_completions")
      .select("task_id")
      .eq("user_id", user.id)
      .gte("completed_at", twentyFourHoursAgo)

    const recentTaskIds = new Set(recentCompletions?.map((c) => c.task_id) || [])

    let availableTasksCount = 0
    if (allTasks && allTasks.length > 0) {
      const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
      const tasksPerDay = 10
      const totalTasks = allTasks.length

      // Generate today's task selection using same algorithm
      const todayTasks = []
      for (let i = 0; i < tasksPerDay; i++) {
        const taskIndex = (dayOfWeek * tasksPerDay + i) % totalTasks
        const task = allTasks[taskIndex]
        if (task && !recentTaskIds.has(task.id)) {
          todayTasks.push(task)
        }
      }
      availableTasksCount = todayTasks.length
    }

    const stats = {
      totalEarnings: profile?.total_earnings || 0,
      availableBalance: profile?.available_balance || 0,
      todayTasksCompleted: todayTasksCount || 0,
      availableTasks: availableTasksCount,
    }

    return (
      <DashboardLayout user={user} profile={profile}>
        <DashboardOverview stats={stats} />
      </DashboardLayout>
    )
  } catch (error) {
    console.error("[v0] Dashboard error:", error)
    redirect("/auth/login")
  }
}
