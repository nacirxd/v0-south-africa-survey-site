"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Clock, DollarSign, MapPin, Play } from "lucide-react"
import Link from "next/link"
import { getTasksCompletedToday } from "@/lib/balance-utils"

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
}

export default function DailyTasksList({ userId }: DailyTasksListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [userId])

  const fetchTasks = async () => {
    try {
      setLoading(true)

      const tasksJson = localStorage.getItem("survey_tasks") || "[]"
      const allTasks = JSON.parse(tasksJson)

      console.log("[v0] Loaded tasks from localStorage:", allTasks.length)

      const todayTaskIds = getTasksCompletedToday(userId)
      console.log("[v0] Tasks completed today:", todayTaskIds.length)

      const activeTasks = allTasks.filter((task: Task) => task.is_active)

      setTasks(activeTasks)
      setCompletedToday(new Set(todayTaskIds))
    } catch (error) {
      console.error("[v0] Error fetching tasks:", error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

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
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Daily Tasks</h1>
        <p className="text-blue-100">Complete surveys about South Africa. New tasks rotate daily.</p>
        <Button
          onClick={fetchTasks}
          variant="outline"
          size="sm"
          className="mt-2 text-blue-600 border-blue-300 hover:bg-blue-50 bg-transparent"
        >
          Refresh Tasks
        </Button>
      </div>

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
            const isCompletedToday = completedToday.has(task.id)

            return (
              <Card key={task.id} className={`border-blue-200 ${isCompletedToday ? "opacity-60" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <Badge className={getCategoryColor(task.category)}>{task.category}</Badge>
                        {isCompletedToday && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckSquare className="w-3 h-3 mr-1" />
                            Completed Today
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
                      {isCompletedToday ? (
                        <span className="text-orange-600 font-medium">Available again tomorrow</span>
                      ) : (
                        <>
                          <span>Daily rotation • Fresh tasks every day</span>
                          <span>5 questions • ~3 minutes</span>
                        </>
                      )}
                    </div>
                    {isCompletedToday ? (
                      <Button disabled className="bg-gray-400 cursor-not-allowed">
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Completed Today
                      </Button>
                    ) : (
                      <Link href={`/dashboard/tasks/${task.id}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Play className="w-4 h-4 mr-2" />
                          Start Survey
                        </Button>
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
