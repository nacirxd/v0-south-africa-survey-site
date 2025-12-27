"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import DailyTasksList from "@/components/daily-tasks-list"
import { calculateUserBalance } from "@/lib/balance-utils"

export default function TasksPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUserJson = localStorage.getItem("survey_current_user")

    console.log("[v0] Tasks page - checking auth:", currentUserJson)

    if (!currentUserJson) {
      console.log("[v0] No current user found, redirecting to login")
      router.push("/auth/login")
      return
    }

    const currentUser = JSON.parse(currentUserJson)

    console.log("[v0] Current user found:", currentUser.id)

    const { availableBalance, totalEarnings } = calculateUserBalance(currentUser.id)

    setUser(currentUser)

    const userProfile = {
      user_id: currentUser.id,
      full_name: currentUser.full_name,
      available_balance: availableBalance,
      total_earned: totalEarnings,
    }

    setProfile(userProfile)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-blue-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout user={user} profile={profile}>
      <DailyTasksList userId={user.id} />
    </DashboardLayout>
  )
}
