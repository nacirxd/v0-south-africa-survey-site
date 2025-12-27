import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-local"
import { getEarningsHistory, getWithdrawalRequests } from "@/lib/db-queries"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const earnings = getEarningsHistory(user.id)
    const withdrawals = getWithdrawalRequests(user.id)

    return NextResponse.json({ earnings, withdrawals })
  } catch (error) {
    console.error("[v0] Error fetching history:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
