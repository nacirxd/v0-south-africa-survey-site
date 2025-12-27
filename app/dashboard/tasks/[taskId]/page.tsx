"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import SurveyInterface from "@/components/survey-interface"

interface TaskPageProps {
  params: {
    taskId: string
  }
}

export default function TaskPage({ params }: TaskPageProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUserId = localStorage.getItem("currentUserId")

    if (!currentUserId) {
      router.push("/auth/login")
      return
    }

    const users = JSON.parse(localStorage.getItem("survey_users") || "[]")
    const foundUser = users.find((u: any) => u.id === currentUserId)

    if (!foundUser) {
      router.push("/auth/login")
      return
    }

    setUser(foundUser)

    // Load profile
    const profiles = JSON.parse(localStorage.getItem("survey_profiles") || "[]")
    const userProfile = profiles.find((p: any) => p.user_id === foundUser.id) || {
      user_id: foundUser.id,
      full_name: foundUser.email.split("@")[0],
      available_balance: 0,
      total_earned: 0,
    }
    setProfile(userProfile)

    // Load task
    const tasks = JSON.parse(localStorage.getItem("daily_tasks") || "[]")
    const foundTask = tasks.find((t: any) => t.id === params.taskId)

    if (!foundTask) {
      router.push("/dashboard/tasks")
      return
    }

    // Check if user already completed this task in the last 24 hours
    const completions = JSON.parse(localStorage.getItem("task_completions") || "[]")
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000
    const hasCompleted = completions.some(
      (c: any) =>
        c.user_id === foundUser.id &&
        c.task_id === params.taskId &&
        new Date(c.completed_at).getTime() > twentyFourHoursAgo,
    )

    if (hasCompleted) {
      router.push("/dashboard/tasks")
      return
    }

    setTask(foundTask)
    setLoading(false)
  }, [router, params.taskId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-blue-600">Loading...</div>
      </div>
    )
  }

  if (!user || !task) {
    return null
  }

  return (
    <DashboardLayout user={user} profile={profile}>
      <SurveyInterface task={task} userId={user.id} />
    </DashboardLayout>
  )
}
