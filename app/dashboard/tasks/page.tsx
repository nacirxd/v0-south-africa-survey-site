import { getCurrentUser } from "@/lib/auth-local"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import DailyTasksList from "@/components/daily-tasks-list"
import { getUserProfile } from "@/lib/db-queries"

export default async function TasksPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const profile = getUserProfile(user.id)

  return (
    <DashboardLayout user={user} profile={profile}>
      <DailyTasksList userId={user.id} />
    </DashboardLayout>
  )
}
