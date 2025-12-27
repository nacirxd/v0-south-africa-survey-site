import Database from "better-sqlite3"
import { join } from "path"

let db: Database.Database | null = null

export function getDb() {
  if (!db) {
    const dbPath = join(process.cwd(), "data", "survey.db")
    db = new Database(dbPath)
    db.pragma("journal_mode = WAL")
    initializeDatabase()
  }
  return db
}

function initializeDatabase() {
  if (!db) return

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      country TEXT DEFAULT 'South Africa',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS profiles (
      user_id TEXT PRIMARY KEY,
      total_earnings REAL DEFAULT 0.00,
      available_balance REAL DEFAULT 0.00,
      withdrawn_amount REAL DEFAULT 0.00,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS daily_tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      reward_amount REAL NOT NULL CHECK (reward_amount >= 0.60 AND reward_amount <= 1.00),
      category TEXT NOT NULL DEFAULT 'South Africa Survey',
      is_active INTEGER DEFAULT 1,
      max_completions INTEGER DEFAULT 100,
      current_completions INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT
    );

    CREATE TABLE IF NOT EXISTS task_completions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      task_id TEXT NOT NULL,
      answers TEXT,
      reward_earned REAL NOT NULL,
      completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (task_id) REFERENCES daily_tasks(id) ON DELETE CASCADE,
      UNIQUE(user_id, task_id)
    );

    CREATE TABLE IF NOT EXISTS withdrawal_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL CHECK (amount > 0),
      payment_method TEXT NOT NULL,
      payment_details TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
      requested_at TEXT DEFAULT CURRENT_TIMESTAMP,
      processed_at TEXT,
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS earnings_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('task_completion', 'bonus', 'withdrawal', 'adjustment')),
      description TEXT NOT NULL,
      task_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (task_id) REFERENCES daily_tasks(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_task_completions_user_id ON task_completions(user_id);
    CREATE INDEX IF NOT EXISTS idx_earnings_history_user_id ON earnings_history(user_id);
  `)

  const taskCount = db.prepare("SELECT COUNT(*) as count FROM daily_tasks").get() as { count: number }

  if (taskCount.count === 0) {
    const tasks = [
      [
        "South African Cities Survey",
        "Answer 5 questions about major cities in South Africa including Cape Town, Johannesburg, and Durban.",
        0.85,
        "Geography",
      ],
      [
        "Local Cuisine Preferences",
        "Share your thoughts on traditional South African dishes like bobotie, biltong, and boerewors.",
        0.75,
        "Culture",
      ],
      [
        "Wildlife Knowledge Quiz",
        "Test your knowledge about South African wildlife including the Big Five animals.",
        0.9,
        "Nature",
      ],
      [
        "Language Diversity Survey",
        "Questions about the 11 official languages of South Africa and language preferences.",
        0.8,
        "Culture",
      ],
      [
        "Economic Insights Poll",
        "Share your views on South African economy, employment, and business opportunities.",
        0.95,
        "Economy",
      ],
      [
        "Tourism Destinations",
        "Rate and review popular South African tourist destinations and attractions.",
        0.7,
        "Tourism",
      ],
      [
        "Sports and Recreation",
        "Questions about popular sports in South Africa including rugby, cricket, and soccer.",
        0.65,
        "Sports",
      ],
      [
        "Education System Feedback",
        "Provide feedback on the South African education system and learning experiences.",
        0.85,
        "Education",
      ],
      [
        "Transportation Survey",
        "Share your experience with public and private transportation in South African cities.",
        0.75,
        "Infrastructure",
      ],
      [
        "Climate and Weather",
        "Answer questions about South African climate patterns and seasonal preferences.",
        0.6,
        "Environment",
      ],
      [
        "Technology Usage Poll",
        "Survey about technology adoption and internet usage patterns in South Africa.",
        0.9,
        "Technology",
      ],
      [
        "Healthcare Access Survey",
        "Questions about healthcare services and accessibility in South African communities.",
        0.95,
        "Healthcare",
      ],
    ]

    const insert = db.prepare(`
      INSERT INTO daily_tasks (id, title, description, reward_amount, category)
      VALUES (?, ?, ?, ?, ?)
    `)

    for (const [title, description, reward, category] of tasks) {
      const id = `task_${Math.random().toString(36).substr(2, 9)}`
      insert.run(id, title, description, reward, category)
    }
  }
}

export function closeDb() {
  if (db) {
    db.close()
    db = null
  }
}
