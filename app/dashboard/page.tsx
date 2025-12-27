import { getCurrentUser } from "@/lib/auth-local"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import DashboardOverview from "@/components/dashboard-overview"
import { getUserProfile, getAllActiveTasks, getTaskCompletionsToday, getRecentCompletions } from "@/lib/db-queries"

export default async function DashboardPage() {
  // Get the user from local auth
  const user = await getCurrentUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile and stats from local database
  const profile = getUserProfile(user.id)
  const todayTasksCount = getTaskCompletionsToday(user.id)
  const allTasks = getAllActiveTasks()
  const recentCompletions = getRecentCompletions(user.id, 24)

  const recentTaskIds = new Set(recentCompletions.map((c: any) => c.task_id))

  let availableTasksCount = 0
  if (allTasks && allTasks.length > 0) {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const tasksPerDay = 10
    const totalTasks = allTasks.length

    const todayTasks = []
    for (let i = 0; i < tasksPerDay; i++) {
      const taskIndex = (dayOfWeek * tasksPerDay + i) % totalTasks
      const task = allTasks[taskIndex]
      if (task && !recentTaskIds.has((task as any).id)) {
        todayTasks.push(task)
      }
    }
    availableTasksCount = todayTasks.length
  }

  const stats = {
    totalEarnings: (profile as any)?.total_earnings || 0,
    availableBalance: (profile as any)?.available_balance || 0,
    todayTasksCompleted: todayTasksCount || 0,
    availableTasks: availableTasksCount,
  }

  return (
    <DashboardLayout user={user} profile={profile}>
      <DashboardOverview stats={stats} />
    </DashboardLayout>
  )
}
