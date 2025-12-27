import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-local"
import { getAllActiveTasks, getRecentCompletions } from "@/lib/db-queries"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const allTasks = getAllActiveTasks()
    const recentCompletions = getRecentCompletions(user.id, 24)
    const recentTaskIds = new Set(recentCompletions.map((c: any) => c.task_id))

    // Rotate tasks based on day of week
    const today = new Date()
    const dayOfWeek = today.getDay()
    const tasksPerDay = 10
    const totalTasks = allTasks.length

    const rotatedTasks = []
    for (let i = 0; i < tasksPerDay && i < totalTasks; i++) {
      const taskIndex = (dayOfWeek * tasksPerDay + i) % totalTasks
      const task = allTasks[taskIndex]
      if (task && !recentTaskIds.has((task as any).id)) {
        rotatedTasks.push(task)
      }
    }

    return NextResponse.json({ tasks: rotatedTasks, completedTaskIds: Array.from(recentTaskIds) })
  } catch (error) {
    console.error("[v0] Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}
