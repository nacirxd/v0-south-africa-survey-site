import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import HistoryAndWithdrawals from "@/components/history-withdrawals"

export const dynamic = "force-dynamic"

export default async function HistoryPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Connect Supabase to get started</h1>
      </div>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const availableBalance = profile?.available_balance || 0

  // Fetch earnings history
  const { data: earningsHistory } = await supabase
    .from("earnings_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch withdrawal history
  const { data: withdrawalHistory } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("requested_at", { ascending: false })

  console.log("[v0] Using profile available_balance:", availableBalance)

  return (
    <DashboardLayout user={user} profile={profile}>
      <HistoryAndWithdrawals
        userId={user.id}
        initialBalance={availableBalance}
        initialEarnings={earningsHistory || []}
        initialWithdrawals={withdrawalHistory || []}
      />
    </DashboardLayout>
  )
}
