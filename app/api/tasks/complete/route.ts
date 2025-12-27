import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-local"
import { completeTask, hasUserCompletedTask } from "@/lib/db-queries"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { taskId, answers, rewardAmount } = body

    // Check if already completed
    const hasCompleted = hasUserCompletedTask(user.id, taskId)

    if (hasCompleted) {
      return NextResponse.json({ error: "Task already completed in the last 24 hours" }, { status: 400 })
    }

    const result = completeTask(user.id, taskId, answers, rewardAmount)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error completing task:", error)
    return NextResponse.json({ error: "Failed to complete task" }, { status: 500 })
  }
}
