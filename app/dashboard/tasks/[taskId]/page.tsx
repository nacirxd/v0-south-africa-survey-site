import { getCurrentUser } from "@/lib/auth-local"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import SurveyInterface from "@/components/survey-interface"
import { getUserProfile, getTaskById, hasUserCompletedTask } from "@/lib/db-queries"

interface TaskPageProps {
  params: {
    taskId: string
  }
}

export default async function TaskPage({ params }: TaskPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get task details
  const task = getTaskById(params.taskId)

  if (!task) {
    redirect("/dashboard/tasks")
  }

  // Check if user already completed this task in the last 24 hours
  const hasCompleted = hasUserCompletedTask(user.id, params.taskId)

  if (hasCompleted) {
    redirect("/dashboard/tasks")
  }

  const profile = getUserProfile(user.id)

  return (
    <DashboardLayout user={user} profile={profile}>
      <SurveyInterface task={task} userId={user.id} />
    </DashboardLayout>
  )
}
