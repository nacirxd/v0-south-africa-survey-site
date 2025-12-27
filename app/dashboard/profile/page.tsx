"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import ProfileManagement from "@/components/profile-management"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUserJson = localStorage.getItem("survey_current_user")

    console.log("[v0] Profile page - checking auth:", currentUserJson)

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
      <ProfileManagement user={user} profile={profile} />
    </DashboardLayout>
  )
}
