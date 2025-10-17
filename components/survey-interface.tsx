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
import { submitTaskCompletion } from "@/lib/actions"

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
          question: "What is the capital city of Nigeria?",
          options: ["Lagos", "Abuja", "Kano", "Port Harcourt"],
          required: true,
        },
        {
          id: "q2",
          type: "multiple_choice",
          question: "Which is the longest river in Nigeria?",
          options: ["Niger River", "Benue River", "Cross River", "Kaduna River"],
          required: true,
        },
        {
          id: "q3",
          type: "rating",
          question: "How would you rate Lagos as a tourist destination? (1-5 stars)",
          required: true,
        },
        {
          id: "q4",
          type: "textarea",
          question: "Describe your favorite Nigerian city and why you like it.",
          required: true,
        },
        {
          id: "q5",
          type: "checkbox",
          question: "Which Nigerian states have you visited? (Select all that apply)",
          options: ["Lagos", "Abuja", "Kano", "Rivers", "Oyo", "Kaduna", "Enugu", "Delta", "Anambra"],
          required: true,
        },
      ],
      Culture: [
        {
          id: "q1",
          type: "multiple_choice",
          question: "How many major ethnic groups does Nigeria have?",
          options: ["2", "3", "4", "Over 250"],
          required: true,
        },
        {
          id: "q2",
          type: "checkbox",
          question: "Which traditional Nigerian foods have you tried? (Select all that apply)",
          options: ["Jollof Rice", "Suya", "Pounded Yam", "Egusi Soup", "Akara", "Moi Moi"],
          required: true,
        },
        {
          id: "q3",
          type: "rating",
          question: "How important is it to preserve Nigerian cultural traditions? (1-5 scale)",
          required: true,
        },
        {
          id: "q4",
          type: "textarea",
          question: "What aspect of Nigerian culture are you most proud of?",
          required: true,
        },
        {
          id: "q5",
          type: "multiple_choice",
          question: "Which music genre originated in Nigeria?",
          options: ["Afrobeats", "Reggae", "Salsa", "Jazz"],
          required: true,
        },
      ],
      Economy: [
        {
          id: "q1",
          type: "multiple_choice",
          question: "What is Nigeria's primary currency?",
          options: ["Naira", "Dollar", "Pound", "Cedi"],
          required: true,
        },
        {
          id: "q2",
          type: "rating",
          question: "How would you rate the current economic opportunities in Nigeria? (1-5 scale)",
          required: true,
        },
        {
          id: "q3",
          type: "checkbox",
          question: "Which industries do you think are most important for Nigeria's economy?",
          options: ["Oil & Gas", "Agriculture", "Technology", "Manufacturing", "Entertainment", "Financial Services"],
          required: true,
        },
        {
          id: "q4",
          type: "textarea",
          question: "What do you think could improve Nigeria's economic growth?",
          required: true,
        },
        {
          id: "q5",
          type: "multiple_choice",
          question: "Which city is considered Nigeria's economic hub?",
          options: ["Lagos", "Abuja", "Port Harcourt", "Kano"],
          required: true,
        },
      ],
    }

    return (
      baseQuestions[category] || [
        {
          id: "q1",
          type: "multiple_choice",
          question: "How familiar are you with Nigerian culture?",
          options: ["Very familiar", "Somewhat familiar", "Not very familiar", "Not familiar at all"],
          required: true,
        },
        {
          id: "q2",
          type: "rating",
          question: "How would you rate your overall experience living in or visiting Nigeria? (1-5 stars)",
          required: true,
        },
        {
          id: "q3",
          type: "textarea",
          question: "What do you think makes Nigeria unique?",
          required: true,
        },
        {
          id: "q4",
          type: "checkbox",
          question: "What aspects of Nigeria interest you most?",
          options: ["History", "Culture", "Nature", "Economy", "Sports", "Food"],
          required: true,
        },
        {
          id: "q5",
          type: "text",
          question: "In one word, how would you describe Nigeria?",
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

      const result = await submitTaskCompletion(userId, task.id, answers, task.reward_amount, task.title)

      if (result.error) {
        throw new Error(result.error)
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
              We appreciate your valuable contribution to Nigerian research!
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
