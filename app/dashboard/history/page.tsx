import { getCurrentUser } from "@/lib/auth-local"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import HistoryAndWithdrawals from "@/components/history-withdrawals"
import { getUserProfile } from "@/lib/db-queries"

export default async function HistoryPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const profile = getUserProfile(user.id)

  return (
    <DashboardLayout user={user} profile={profile}>
      <HistoryAndWithdrawals userId={user.id} />
    </DashboardLayout>
  )
}
