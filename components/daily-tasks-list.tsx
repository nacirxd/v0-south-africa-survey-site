"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Clock, DollarSign, MapPin, Play } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Task {
  id: string
  title: string
  description: string
  reward_amount: number
  category: string
  is_active: boolean
  expires_at: string
}

interface DailyTasksListProps {
  userId: string
  initialCompletedTaskIds: string[]
}

export default function DailyTasksList({ userId, initialCompletedTaskIds }: DailyTasksListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set(initialCompletedTaskIds))
  const [loading, setLoading] = useState(true)
  const [currentDay, setCurrentDay] = useState<number>(-1)

  useEffect(() => {
    fetchTasks()

    const interval = setInterval(() => {
      const nigeriaTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" }))
      const dayOfWeek = nigeriaTime.getDay()

      if (currentDay !== -1 && currentDay !== dayOfWeek) {
        console.log("[v0] Day changed from", currentDay, "to", dayOfWeek, "- refreshing tasks")
        fetchTasks()
        window.location.reload()
      }
      setCurrentDay(dayOfWeek)
    }, 60000)

    return () => clearInterval(interval)
  }, [userId, currentDay])

  const fetchTasks = async () => {
    try {
      console.log("[v0] Fetching daily tasks with rotation logic...")

      const supabase = createClient()

      const today = new Date()
      const nigeriaTime = new Date(today.toLocaleString("en-US", { timeZone: "Africa/Lagos" }))
      const dayOfWeek = nigeriaTime.getDay()

      setTasks([])
      setLoading(true)

      const { data: allTasks, error } = await supabase
        .from("daily_tasks")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true })

      if (error) throw error

      console.log("[v0] Found", allTasks?.length || 0, "total tasks")

      if (allTasks && allTasks.length > 0) {
        const tasksPerDay = 10
        const totalTasks = allTasks.length
        const startIndex = (dayOfWeek * tasksPerDay) % totalTasks

        const rotatedTasks = []
        for (let i = 0; i < tasksPerDay && i < totalTasks; i++) {
          const taskIndex = (startIndex + i) % totalTasks
          rotatedTasks.push(allTasks[taskIndex])
        }

        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        console.log("[v0] Nigeria time:", nigeriaTime.toLocaleString("en-ZA", { timeZone: "Africa/Lagos" }))
        console.log("[v0] Selected", rotatedTasks.length, "tasks for", dayNames[dayOfWeek], "(weekday", dayOfWeek, ")")
        console.log("[v0] Task IDs for today:", rotatedTasks.map((t) => t.id.slice(0, 8)).join(", "))

        const sortedTasks = rotatedTasks.sort((a, b) => {
          const aCompleted = completedTasks.has(a.id)
          const bCompleted = completedTasks.has(b.id)
          if (aCompleted === bCompleted) return 0
          return aCompleted ? 1 : -1
        })

        setTasks(sortedTasks)
        setCurrentDay(dayOfWeek)
      } else {
        setTasks([])
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        window.location.reload()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [userId])

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Geography: "bg-blue-100 text-blue-800",
      Culture: "bg-green-100 text-green-800",
      Nature: "bg-emerald-100 text-emerald-800",
      Economy: "bg-purple-100 text-purple-800",
      Tourism: "bg-orange-100 text-orange-800",
      Sports: "bg-red-100 text-red-800",
      Education: "bg-indigo-100 text-indigo-800",
      Infrastructure: "bg-gray-100 text-gray-800",
      Environment: "bg-teal-100 text-teal-800",
      Technology: "bg-cyan-100 text-cyan-800",
      Healthcare: "bg-pink-100 text-pink-800",
    }
    return colors[category] || "bg-blue-100 text-blue-800"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Daily Tasks</h1>
          <p className="text-blue-100">Loading available surveys...</p>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Daily Tasks</h1>
        <p className="text-blue-100">Complete surveys about Nigeria. New tasks rotate weekly based on Nigerian time.</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
          className="mt-2 text-blue-600 border-blue-300 hover:bg-blue-50"
        >
          Refresh Tasks
        </Button>
      </div>

      {/* Tasks Grid */}
      <div className="grid gap-6">
        {tasks.length === 0 ? (
          <Card className="border-blue-200">
            <CardContent className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">No Tasks Available</h3>
              <p className="text-blue-600">New tasks will be available soon. Check back later!</p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => {
            const isCompleted = completedTasks.has(task.id)

            return (
              <Card key={task.id} className={`border-blue-200 transition-opacity ${isCompleted ? "opacity-50" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <Badge className={getCategoryColor(task.category)}>{task.category}</Badge>
                        {isCompleted && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckSquare className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-blue-900">{task.title}</CardTitle>
                      <CardDescription className="text-blue-700 mt-2">{task.description}</CardDescription>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center space-x-1 text-green-600 font-bold text-lg">
                        <DollarSign className="w-5 h-5" />
                        <span>{task.reward_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-blue-600">
                      <span>Daily rotation • Fresh tasks every day</span>
                      <span>5 questions • ~3 minutes</span>
                    </div>
                    {isCompleted ? (
                      <Button
                        disabled
                        className="bg-transparent border border-gray-300 text-gray-400 cursor-not-allowed opacity-50"
                      >
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Completed
                      </Button>
                    ) : (
                      <Link
                        href={`/dashboard/tasks/${task.id}`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Survey
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
