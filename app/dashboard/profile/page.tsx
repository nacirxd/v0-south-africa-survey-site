import { getCurrentUser } from "@/lib/auth-local"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import ProfileManagement from "@/components/profile-management"
import { getUserProfile } from "@/lib/db-queries"

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const profile = getUserProfile(user.id)

  return (
    <DashboardLayout user={user} profile={profile}>
      <ProfileManagement user={user} profile={profile} />
    </DashboardLayout>
  )
}
