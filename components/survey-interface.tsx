"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, CheckCircle, DollarSign, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

interface SurveyQuestion {
  id: string
  type: "multiple_choice" | "text" | "textarea" | "checkbox" | "rating"
  question: string
  options?: string[]
  required: boolean
}

interface Task {
  id: string
  title: string
  description: string
  reward_amount: number
  category: string
}

interface SurveyInterfaceProps {
  task: Task
  userId: string
}

export default function SurveyInterface({ task, userId }: SurveyInterfaceProps) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: string]: any }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  // Generate questions based on task category
  const generateQuestions = (category: string): SurveyQuestion[] => {
    const baseQuestions: { [key: string]: SurveyQuestion[] } = {
      Geography: [
        {
          id: "q1",
          type: "multiple_choice",
          question: "Which city is the legislative capital of South Africa?",
          options: ["Cape Town", "Johannesburg", "Pretoria", "Durban"],
          required: true,
        },
        {
          id: "q2",
          type: "multiple_choice",
          question: "What is the highest mountain in South Africa?",
          options: ["Table Mountain", "Drakensberg", "Mafadi", "Champagne Castle"],
          required: true,
        },
        {
          id: "q3",
          type: "rating",
          question: "How would you rate Cape Town as a tourist destination? (1-5 stars)",
          required: true,
        },
        {
          id: "q4",
          type: "textarea",
          question: "Describe your favorite South African city and why you like it.",
          required: true,
        },
        {
          id: "q5",
          type: "checkbox",
          question: "Which South African provinces have you visited? (Select all that apply)",
          options: [
            "Western Cape",
            "Eastern Cape",
            "Northern Cape",
            "Free State",
            "KwaZulu-Natal",
            "North West",
            "Gauteng",
            "Mpumalanga",
            "Limpopo",
          ],
          required: true,
        },
      ],
      Culture: [
        {
          id: "q1",
          type: "multiple_choice",
          question: "How many official languages does South Africa have?",
          options: ["9", "11", "13", "15"],
          required: true,
        },
        {
          id: "q2",
          type: "checkbox",
          question: "Which traditional South African foods have you tried? (Select all that apply)",
          options: ["Bobotie", "Biltong", "Boerewors", "Potjiekos", "Koeksisters", "Bunny Chow"],
          required: true,
        },
        {
          id: "q3",
          type: "rating",
          question: "How important is it to preserve South African cultural traditions? (1-5 scale)",
          required: true,
        },
        {
          id: "q4",
          type: "textarea",
          question: "What aspect of South African culture are you most proud of?",
          required: true,
        },
        {
          id: "q5",
          type: "multiple_choice",
          question: "Which is considered South Africa's national animal?",
          options: ["Lion", "Springbok", "Elephant", "Rhino"],
          required: true,
        },
      ],
      Economy: [
        {
          id: "q1",
          type: "multiple_choice",
          question: "What is South Africa's primary currency?",
          options: ["Rand", "Dollar", "Pound", "Euro"],
          required: true,
        },
        {
          id: "q2",
          type: "rating",
          question: "How would you rate the current economic opportunities in South Africa? (1-5 scale)",
          required: true,
        },
        {
          id: "q3",
          type: "checkbox",
          question: "Which industries do you think are most important for South Africa's economy?",
          options: ["Mining", "Agriculture", "Tourism", "Manufacturing", "Technology", "Financial Services"],
          required: true,
        },
        {
          id: "q4",
          type: "textarea",
          question: "What do you think could improve South Africa's economic growth?",
          required: true,
        },
        {
          id: "q5",
          type: "multiple_choice",
          question: "Which city is considered South Africa's economic hub?",
          options: ["Cape Town", "Johannesburg", "Durban", "Pretoria"],
          required: true,
        },
      ],
    }

    return (
      baseQuestions[category] || [
        {
          id: "q1",
          type: "multiple_choice",
          question: "How familiar are you with South African culture?",
          options: ["Very familiar", "Somewhat familiar", "Not very familiar", "Not familiar at all"],
          required: true,
        },
        {
          id: "q2",
          type: "rating",
          question: "How would you rate your overall experience living in or visiting South Africa? (1-5 stars)",
          required: true,
        },
        {
          id: "q3",
          type: "textarea",
          question: "What do you think makes South Africa unique?",
          required: true,
        },
        {
          id: "q4",
          type: "checkbox",
          question: "What aspects of South Africa interest you most?",
          options: ["History", "Culture", "Nature", "Economy", "Sports", "Food"],
          required: true,
        },
        {
          id: "q5",
          type: "text",
          question: "In one word, how would you describe South Africa?",
          required: true,
        },
      ]
    )
  }

  const questions = generateQuestions(task.category)
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      console.log("[v0] Starting survey submission for user:", userId, "task:", task.id)

      console.log("[v0] Checking if task was completed in last 24 hours...")

      // Get current UTC time
      const now = new Date()

      // Calculate South Africa time (UTC+2)
      const saOffset = 2 * 60 // South Africa is UTC+2 (120 minutes)
      const saTime = new Date(now.getTime() + saOffset * 60 * 1000)

      // Calculate 24 hours ago in South Africa time
      const twentyFourHoursAgo = new Date(saTime.getTime() - 24 * 60 * 60 * 1000)

      console.log("[v0] Current UTC time:", now.toISOString())
      console.log("[v0] SA Time:", saTime.toISOString())
      console.log("[v0] 24 hours ago (SA):", twentyFourHoursAgo.toISOString())

      // Check for any existing completion for this user and task (not just recent ones)
      const { data: existingCompletion, error: checkError } = await supabase
        .from("task_completions")
        .select("id, completed_at")
        .eq("user_id", userId)
        .eq("task_id", task.id)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        console.log("[v0] Error checking completion:", checkError)
        throw new Error(`Failed to verify task status: ${checkError.message}`)
      }

      if (existingCompletion) {
        // Check if the existing completion is within the last 24 hours
        const completionTime = new Date(existingCompletion.completed_at)
        const timeDiff = saTime.getTime() - completionTime.getTime()
        const hoursDiff = timeDiff / (1000 * 60 * 60)

        console.log("[v0] Found existing completion at:", existingCompletion.completed_at)
        console.log("[v0] Hours since completion:", hoursDiff.toFixed(2))

        if (hoursDiff < 24) {
          console.log("[v0] Task completed within last 24 hours, blocking submission")
          alert("This survey has already been completed within the last 24 hours. Please wait before attempting again.")
          router.push("/dashboard/tasks")
          return
        } else {
          console.log(
            "[v0] Task was completed more than 24 hours ago, but cannot create duplicate. Updating existing record...",
          )

          // Update the existing completion record instead of creating a new one
          const { error: updateError } = await supabase
            .from("task_completions")
            .update({
              answers: answers,
              reward_earned: task.reward_amount,
              completed_at: now.toISOString(),
            })
            .eq("id", existingCompletion.id)

          if (updateError) {
            console.log("[v0] Update completion error:", updateError)
            throw new Error(`Failed to update task completion: ${updateError.message}`)
          }

          console.log("[v0] Updated existing task completion record")
        }
      } else {
        console.log("[v0] No existing completion found, creating new record...")

        // Submit new task completion
        const { error: completionError } = await supabase.from("task_completions").insert({
          user_id: userId,
          task_id: task.id,
          answers: answers,
          reward_earned: task.reward_amount,
        })

        if (completionError) {
          console.log("[v0] Task completion error:", completionError)
          throw new Error(`Failed to record task completion: ${completionError.message}`)
        }

        console.log("[v0] Created new task completion record")
      }

      // Update user profile earnings
      console.log("[v0] Updating user earnings...")
      const { error: profileError } = await supabase.rpc("update_user_earnings", {
        user_id: userId,
        amount: task.reward_amount,
      })

      if (profileError) {
        console.log("[v0] Profile update error:", profileError)
        throw new Error(`Failed to update earnings: ${profileError.message}`)
      }

      // Add to earnings history
      console.log("[v0] Adding to earnings history...")
      const { error: historyError } = await supabase.from("earnings_history").insert({
        user_id: userId,
        amount: task.reward_amount,
        type: "task_completion",
        description: `Completed survey: ${task.title}`,
        task_id: task.id,
      })

      if (historyError) {
        console.log("[v0] History error:", historyError)
        throw new Error(`Failed to record earnings history: ${historyError.message}`)
      }

      // Update task completion count
      console.log("[v0] Incrementing task completions...")
      const { error: taskError } = await supabase.rpc("increment_task_completions", {
        task_id: task.id,
      })

      if (taskError) {
        console.log("[v0] Task increment error:", taskError)
        throw new Error(`Failed to update task statistics: ${taskError.message}`)
      }

      console.log("[v0] Survey submission completed successfully!")
      setIsCompleted(true)
    } catch (error) {
      console.error("[v0] Error submitting survey:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Error submitting survey: ${errorMessage}. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderQuestion = (question: SurveyQuestion) => {
    const currentAnswer = answers[question.id]

    switch (question.type) {
      case "multiple_choice":
        return (
          <RadioGroup value={currentAnswer || ""} onValueChange={(value) => handleAnswerChange(question.id, value)}>
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`} className="text-blue-900">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "checkbox":
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={currentAnswer?.includes(option) || false}
                  onCheckedChange={(checked) => {
                    const newAnswer = currentAnswer || []
                    if (checked) {
                      handleAnswerChange(question.id, [...newAnswer, option])
                    } else {
                      handleAnswerChange(
                        question.id,
                        newAnswer.filter((item: string) => item !== option),
                      )
                    }
                  }}
                />
                <Label htmlFor={`${question.id}-${index}`} className="text-blue-900">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      case "rating":
        return (
          <RadioGroup value={currentAnswer || ""} onValueChange={(value) => handleAnswerChange(question.id, value)}>
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <RadioGroupItem value={rating.toString()} id={`${question.id}-${rating}`} />
                  <Label htmlFor={`${question.id}-${rating}`} className="text-blue-900">
                    {rating}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )

      case "text":
        return (
          <Input
            value={currentAnswer || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter your answer..."
          />
        )

      case "textarea":
        return (
          <Textarea
            value={currentAnswer || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
            placeholder="Enter your detailed answer..."
          />
        )

      default:
        return null
    }
  }

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">Thank You!</h2>
            <p className="text-green-700 mb-2">Your survey has been completed successfully.</p>
            <p className="text-green-600 font-medium mb-4">
              We appreciate your valuable contribution to South African research!
            </p>
            <div className="flex items-center justify-center space-x-2 mb-6">
              <DollarSign className="w-6 h-6 text-green-600" />
              <span className="text-2xl font-bold text-green-600">Reward Earned: ${task.reward_amount.toFixed(2)}</span>
            </div>
            <Button
              onClick={() => router.push("/dashboard/tasks")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Continue to More Tasks
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const isAnswered = answers[currentQ.id] !== undefined && answers[currentQ.id] !== ""

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-2 mb-2">
          <MapPin className="w-5 h-5" />
          <span className="text-blue-100">{task.category} Survey</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">{task.title}</h1>
        <p className="text-blue-100">{task.description}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-blue-100">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span className="font-bold">${task.reward_amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-blue-600">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">{currentQ.question}</CardTitle>
          {currentQ.required && (
            <CardDescription className="text-blue-700">* This question is required</CardDescription>
          )}
        </CardHeader>
        <CardContent>{renderQuestion(currentQ)}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {currentQuestion === questions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={!isAnswered || isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting ? "Submitting..." : "Submit Survey"}
            <CheckCircle className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!isAnswered} className="bg-blue-600 hover:bg-blue-700 text-white">
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
