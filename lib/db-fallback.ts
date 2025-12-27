// Fallback database using localStorage for v0 preview environment
// This is used when better-sqlite3 is not available

export interface User {
  id: string
  email: string
  password_hash: string
  full_name: string
  country: string
  created_at: string
}

export interface Profile {
  user_id: string
  total_earnings: number
  available_balance: number
  withdrawn_amount: number
  updated_at: string
}

export interface DailyTask {
  id: string
  title: string
  description: string
  reward_amount: number
  category: string
  is_active: number
  max_completions: number
  current_completions: number
  created_at: string
  expires_at: string | null
}

const STORAGE_KEYS = {
  users: "sa_survey_users",
  profiles: "sa_survey_profiles",
  tasks: "sa_survey_tasks",
  completions: "sa_survey_completions",
  sessions: "sa_survey_sessions",
  history: "sa_survey_history",
  withdrawals: "sa_survey_withdrawals",
}

function getFromStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

function saveToStorage<T>(key: string, data: T[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
}

export function initializeFallbackDb() {
  // Initialize tasks if empty
  const tasks = getFromStorage<DailyTask>(STORAGE_KEYS.tasks)
  if (tasks.length === 0) {
    const defaultTasks: DailyTask[] = [
      {
        id: "task_1",
        title: "South African Cities Survey",
        description: "Answer 5 questions about major cities in South Africa.",
        reward_amount: 0.85,
        category: "Geography",
        is_active: 1,
        max_completions: 100,
        current_completions: 0,
        created_at: new Date().toISOString(),
        expires_at: null,
      },
      {
        id: "task_2",
        title: "Local Cuisine Preferences",
        description: "Share your thoughts on traditional South African dishes.",
        reward_amount: 0.75,
        category: "Culture",
        is_active: 1,
        max_completions: 100,
        current_completions: 0,
        created_at: new Date().toISOString(),
        expires_at: null,
      },
    ]
    saveToStorage(STORAGE_KEYS.tasks, defaultTasks)
  }
}

export const fallbackDb = {
  users: {
    create: (user: User) => {
      const users = getFromStorage<User>(STORAGE_KEYS.users)
      users.push(user)
      saveToStorage(STORAGE_KEYS.users, users)
    },
    findByEmail: (email: string) => {
      const users = getFromStorage<User>(STORAGE_KEYS.users)
      return users.find((u) => u.email === email)
    },
    findById: (id: string) => {
      const users = getFromStorage<User>(STORAGE_KEYS.users)
      return users.find((u) => u.id === id)
    },
  },
  profiles: {
    create: (profile: Profile) => {
      const profiles = getFromStorage<Profile>(STORAGE_KEYS.profiles)
      profiles.push(profile)
      saveToStorage(STORAGE_KEYS.profiles, profiles)
    },
    findByUserId: (userId: string) => {
      const profiles = getFromStorage<Profile>(STORAGE_KEYS.profiles)
      return profiles.find((p) => p.user_id === userId)
    },
    update: (userId: string, updates: Partial<Profile>) => {
      const profiles = getFromStorage<Profile>(STORAGE_KEYS.profiles)
      const index = profiles.findIndex((p) => p.user_id === userId)
      if (index !== -1) {
        profiles[index] = { ...profiles[index], ...updates }
        saveToStorage(STORAGE_KEYS.profiles, profiles)
      }
    },
  },
  tasks: {
    getAll: () => getFromStorage<DailyTask>(STORAGE_KEYS.tasks),
    findById: (id: string) => {
      const tasks = getFromStorage<DailyTask>(STORAGE_KEYS.tasks)
      return tasks.find((t) => t.id === id)
    },
  },
  sessions: {
    create: (sessionId: string, userId: string, expiresAt: string) => {
      const sessions = getFromStorage<any>(STORAGE_KEYS.sessions)
      sessions.push({ id: sessionId, user_id: userId, expires_at: expiresAt })
      saveToStorage(STORAGE_KEYS.sessions, sessions)
    },
    findById: (sessionId: string) => {
      const sessions = getFromStorage<any>(STORAGE_KEYS.sessions)
      return sessions.find((s) => s.id === sessionId && new Date(s.expires_at) > new Date())
    },
    delete: (sessionId: string) => {
      const sessions = getFromStorage<any>(STORAGE_KEYS.sessions)
      const filtered = sessions.filter((s) => s.id !== sessionId)
      saveToStorage(STORAGE_KEYS.sessions, filtered)
    },
  },
}
