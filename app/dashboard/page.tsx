"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import DashboardOverview from "@/components/dashboard-overview"
import { Loader2 } from "lucide-react"
import { initializeTasks } from "@/lib/seed-data"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    todayTasksCompleted: 0,
    availableTasks: 10,
  })

  useEffect(() => {
    const currentUserJson = localStorage.getItem("survey_current_user")

    if (!currentUserJson) {
      console.log("[v0] No user session found, redirecting to login")
      router.push("/auth/login")
      return
    }

    try {
      const currentUser = JSON.parse(currentUserJson)
      console.log("[v0] User session found:", currentUser.email)
      setUser(currentUser)

      initializeTasks()

      // Get user profile from localStorage
      const profilesJson = localStorage.getItem("survey_profiles") || "[]"
      const profiles = JSON.parse(profilesJson)
      const profile = profiles.find((p: any) => p.user_id === currentUser.id)

      const tasksJson = localStorage.getItem("survey_tasks") || "[]"
      const tasks = JSON.parse(tasksJson)
      const completionsJson = localStorage.getItem("survey_completions") || "[]"
      const completions = JSON.parse(completionsJson)
      const userCompletions = completions.filter((c: any) => c.user_id === currentUser.id)

      if (profile) {
        setStats({
          totalEarnings: profile.total_earned || 0,
          availableBalance: profile.available_balance || 0,
          todayTasksCompleted: userCompletions.length,
          availableTasks: tasks.filter((t: any) => t.is_active).length,
        })
      }

      setLoading(false)
    } catch (err) {
      console.error("[v0] Error loading user session:", err)
      router.push("/auth/login")
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-blue-900">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const profile = { full_name: user.full_name }

  return (
    <DashboardLayout user={user} profile={profile}>
      <DashboardOverview stats={stats} />
    </DashboardLayout>
  )
}
