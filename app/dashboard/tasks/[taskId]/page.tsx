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
    const currentUserJson = localStorage.getItem("survey_current_user")

    console.log("[v0] Task detail page - checking auth:", currentUserJson)

    if (!currentUserJson) {
      console.log("[v0] No current user found, redirecting to login")
      router.push("/auth/login")
      return
    }

    const currentUser = JSON.parse(currentUserJson)
    console.log("[v0] Current user found:", currentUser.id)

    setUser(currentUser)

    // Load profile
    const profiles = JSON.parse(localStorage.getItem("survey_profiles") || "[]")
    const userProfile = profiles.find((p: any) => p.user_id === currentUser.id) || {
      user_id: currentUser.id,
      full_name: currentUser.full_name,
      available_balance: 0,
      total_earned: 0,
    }
    setProfile(userProfile)

    // Load task
    const tasks = JSON.parse(localStorage.getItem("survey_tasks") || "[]")
    const foundTask = tasks.find((t: any) => t.id === params.taskId)

    console.log("[v0] Looking for task:", params.taskId)
    console.log("[v0] Found task:", foundTask)

    if (!foundTask) {
      console.log("[v0] Task not found, redirecting to tasks list")
      router.push("/dashboard/tasks")
      return
    }

    // Check if user already completed this task in the last 24 hours
    const completions = JSON.parse(localStorage.getItem("survey_completions") || "[]")
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000
    const hasCompleted = completions.some(
      (c: any) =>
        c.user_id === currentUser.id &&
        c.task_id === params.taskId &&
        new Date(c.completed_at).getTime() > twentyFourHoursAgo,
    )

    console.log("[v0] User has completed this task:", hasCompleted)

    if (hasCompleted) {
      console.log("[v0] Task already completed, redirecting to tasks list")
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
