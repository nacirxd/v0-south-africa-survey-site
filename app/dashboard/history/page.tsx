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

  // Fetch all task completions and sum the rewards
  const { data: completions } = await supabase.from("task_completions").select("reward_earned").eq("user_id", user.id)

  const totalEarned = completions?.reduce((sum, completion) => sum + (completion.reward_earned || 0), 0) || 0

  // Fetch completed withdrawals and sum them
  const { data: completedWithdrawals } = await supabase
    .from("withdrawal_requests")
    .select("amount")
    .eq("user_id", user.id)
    .eq("status", "completed")

  const totalWithdrawn = completedWithdrawals?.reduce((sum, withdrawal) => sum + (withdrawal.amount || 0), 0) || 0

  // Calculate available balance
  const availableBalance = totalEarned - totalWithdrawn

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

  console.log("[v0] Server-side balance calculation:", { totalEarned, totalWithdrawn, availableBalance })

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
