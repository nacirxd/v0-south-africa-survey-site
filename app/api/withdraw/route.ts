import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-local"
import { createWithdrawalRequest } from "@/lib/db-queries"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { amount, paymentMethod, paymentDetails } = body

    const result = createWithdrawalRequest(user.id, amount, paymentMethod, paymentDetails)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error creating withdrawal:", error)
    return NextResponse.json({ error: "Failed to create withdrawal request" }, { status: 500 })
  }
}
