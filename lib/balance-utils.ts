export function calculateUserBalance(userId: string): {
  availableBalance: number
  totalEarnings: number
  completedTasksCount: number
} {
  const completionsJson = localStorage.getItem("survey_completions") || "[]"
  const completions = JSON.parse(completionsJson)

  const userCompletions = completions.filter((c: any) => c.userId === userId)

  const totalEarnings = userCompletions.reduce((sum: number, c: any) => sum + (c.rewardAmount || 0), 0)

  return {
    availableBalance: totalEarnings,
    totalEarnings,
    completedTasksCount: userCompletions.length,
  }
}

export function updateUserBalance(userId: string): void {
  const { availableBalance, totalEarnings } = calculateUserBalance(userId)

  const currentUserJson = localStorage.getItem("survey_current_user")
  if (currentUserJson) {
    const currentUser = JSON.parse(currentUserJson)
    if (currentUser.id === userId) {
      currentUser.available_balance = availableBalance
      currentUser.total_earned = totalEarnings
      localStorage.setItem("survey_current_user", JSON.stringify(currentUser))
    }
  }
}

export function isTaskCompletedToday(userId: string, taskId: string): boolean {
  const completionsJson = localStorage.getItem("survey_completions") || "[]"
  const completions = JSON.parse(completionsJson)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTimestamp = today.getTime()

  const completedToday = completions.find((c: any) => {
    if (c.userId !== userId || c.taskId !== taskId) return false

    const completionDate = new Date(c.completedAt)
    completionDate.setHours(0, 0, 0, 0)
    const completionTimestamp = completionDate.getTime()

    return completionTimestamp === todayTimestamp
  })

  return !!completedToday
}

export function getTasksCompletedToday(userId: string): string[] {
  const completionsJson = localStorage.getItem("survey_completions") || "[]"
  const completions = JSON.parse(completionsJson)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTimestamp = today.getTime()

  const todayCompletions = completions.filter((c: any) => {
    if (c.userId !== userId) return false

    const completionDate = new Date(c.completedAt)
    completionDate.setHours(0, 0, 0, 0)
    const completionTimestamp = completionDate.getTime()

    return completionTimestamp === todayTimestamp
  })

  return todayCompletions.map((c: any) => c.taskId)
}
