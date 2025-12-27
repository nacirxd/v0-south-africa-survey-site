import { getDb } from "./db"

export function getUserProfile(userId: string) {
  const db = getDb()

  const user = db
    .prepare(`
    SELECT u.*, p.total_earnings, p.available_balance, p.withdrawn_amount
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE u.id = ?
  `)
    .get(userId)

  return user
}

export function getAllActiveTasks() {
  const db = getDb()

  const tasks = db
    .prepare(`
    SELECT * FROM daily_tasks 
    WHERE is_active = 1 
    ORDER BY id
  `)
    .all()

  return tasks
}

export function getTaskCompletionsToday(userId: string) {
  const db = getDb()
  const today = new Date().toISOString().split("T")[0]

  const completions = db
    .prepare(`
    SELECT COUNT(*) as count
    FROM task_completions
    WHERE user_id = ? 
    AND DATE(completed_at) = DATE(?)
  `)
    .get(userId, today) as { count: number }

  return completions.count
}

export function getRecentCompletions(userId: string, hoursAgo = 24) {
  const db = getDb()
  const timeAgo = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()

  const completions = db
    .prepare(`
    SELECT task_id
    FROM task_completions
    WHERE user_id = ? AND completed_at >= ?
  `)
    .all(userId, timeAgo)

  return completions
}

export function getTaskById(taskId: string) {
  const db = getDb()

  const task = db
    .prepare(`
    SELECT * FROM daily_tasks WHERE id = ?
  `)
    .get(taskId)

  return task
}

export function hasUserCompletedTask(userId: string, taskId: string) {
  const db = getDb()

  const completion = db
    .prepare(`
    SELECT id FROM task_completions 
    WHERE user_id = ? AND task_id = ?
  `)
    .get(userId, taskId)

  return !!completion
}

export function completeTask(userId: string, taskId: string, answers: any, rewardAmount: number) {
  const db = getDb()
  const completionId = `comp_${Math.random().toString(36).substr(2, 9)}`
  const historyId = `hist_${Math.random().toString(36).substr(2, 9)}`

  try {
    db.exec("BEGIN TRANSACTION")

    // Inserir task completion
    db.prepare(`
      INSERT INTO task_completions (id, user_id, task_id, answers, reward_earned)
      VALUES (?, ?, ?, ?, ?)
    `).run(completionId, userId, taskId, JSON.stringify(answers), rewardAmount)

    // Atualizar perfil do usuário
    db.prepare(`
      UPDATE profiles 
      SET total_earnings = total_earnings + ?,
          available_balance = available_balance + ?
      WHERE user_id = ?
    `).run(rewardAmount, rewardAmount, userId)

    // Adicionar ao histórico de ganhos
    db.prepare(`
      INSERT INTO earnings_history (id, user_id, amount, type, description, task_id)
      VALUES (?, ?, ?, 'task_completion', 'Task completion reward', ?)
    `).run(historyId, userId, rewardAmount, taskId)

    // Incrementar contador de conclusões da tarefa
    db.prepare(`
      UPDATE daily_tasks 
      SET current_completions = current_completions + 1
      WHERE id = ?
    `).run(taskId)

    db.exec("COMMIT")

    return { success: true }
  } catch (error) {
    db.exec("ROLLBACK")
    console.error("[v0] Error completing task:", error)
    return { success: false, error: "Failed to complete task" }
  }
}

export function getEarningsHistory(userId: string) {
  const db = getDb()

  const history = db
    .prepare(`
    SELECT * FROM earnings_history
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `)
    .all(userId)

  return history
}

export function getWithdrawalRequests(userId: string) {
  const db = getDb()

  const withdrawals = db
    .prepare(`
    SELECT * FROM withdrawal_requests
    WHERE user_id = ?
    ORDER BY requested_at DESC
  `)
    .all(userId)

  return withdrawals
}

export function createWithdrawalRequest(userId: string, amount: number, paymentMethod: string, paymentDetails: any) {
  const db = getDb()
  const requestId = `withdraw_${Math.random().toString(36).substr(2, 9)}`

  try {
    db.exec("BEGIN TRANSACTION")

    // Verificar saldo disponível
    const profile = db
      .prepare(`
      SELECT available_balance FROM profiles WHERE user_id = ?
    `)
      .get(userId) as any

    if (!profile || profile.available_balance < amount) {
      db.exec("ROLLBACK")
      return { success: false, error: "Insufficient balance" }
    }

    // Criar solicitação de saque
    db.prepare(`
      INSERT INTO withdrawal_requests (id, user_id, amount, payment_method, payment_details)
      VALUES (?, ?, ?, ?, ?)
    `).run(requestId, userId, amount, paymentMethod, JSON.stringify(paymentDetails))

    // Atualizar perfil (deduzir do saldo disponível)
    db.prepare(`
      UPDATE profiles 
      SET available_balance = available_balance - ?
      WHERE user_id = ?
    `).run(amount, userId)

    db.exec("COMMIT")

    return { success: true }
  } catch (error) {
    db.exec("ROLLBACK")
    console.error("[v0] Error creating withdrawal:", error)
    return { success: false, error: "Failed to create withdrawal request" }
  }
}

export function updateUserProfile(userId: string, updates: any) {
  const db = getDb()

  try {
    db.prepare(`
      UPDATE users 
      SET full_name = ?, country = ?
      WHERE id = ?
    `).run(updates.full_name, updates.country, userId)

    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating profile:", error)
    return { success: false, error: "Failed to update profile" }
  }
}
