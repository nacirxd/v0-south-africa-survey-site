import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import HistoryAndWithdrawals from "@/components/history-withdrawals"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function HistoryPage() {
  try {
    const supabase = await createClient()

    if (!supabase) {
      redirect("/auth/login")
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/login")
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    return (
      <DashboardLayout user={user} profile={profile}>
        <HistoryAndWithdrawals userId={user.id} />
      </DashboardLayout>
    )
  } catch (error) {
    console.error("[v0] History page error:", error)
    redirect("/auth/login")
  }
}
