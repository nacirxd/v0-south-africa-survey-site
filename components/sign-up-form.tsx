"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, MapPin, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { simpleHash } from "@/utils/hash"

export default function SignUpForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string

    console.log("[v0] Signup attempt:", { email, fullName })

    try {
      // Validate
      if (!email || !password || !fullName) {
        setError("All fields are required")
        setIsLoading(false)
        return
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters")
        setIsLoading(false)
        return
      }

      // Get existing users from localStorage
      const usersJson = localStorage.getItem("survey_users") || "[]"
      const users = JSON.parse(usersJson)

      console.log("[v0] Existing users:", users.length)

      // Check if user exists
      if (users.find((u: any) => u.email === email)) {
        setError("User already exists")
        setIsLoading(false)
        return
      }

      const hashedPassword = await simpleHash(password)

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email,
        password: hashedPassword,
        full_name: fullName,
        created_at: new Date().toISOString(),
      }

      // Create profile
      const newProfile = {
        id: Date.now().toString(),
        user_id: newUser.id,
        full_name: fullName,
        email,
        available_balance: 0,
        total_earned: 0,
        surveys_completed: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Save user
      users.push(newUser)
      localStorage.setItem("survey_users", JSON.stringify(users))

      // Save profile
      const profilesJson = localStorage.getItem("survey_profiles") || "[]"
      const profiles = JSON.parse(profilesJson)
      profiles.push(newProfile)
      localStorage.setItem("survey_profiles", JSON.stringify(profiles))

      // Set current user session
      localStorage.setItem(
        "survey_current_user",
        JSON.stringify({ id: newUser.id, email: newUser.email, full_name: newUser.full_name }),
      )

      console.log("[v0] User created successfully:", newUser.id)
      setSuccess("Account created successfully! Redirecting...")

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (err: any) {
      console.error("[v0] Signup error:", err)
      setError(err.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <Card className="border-blue-200 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-900">SA Survey Rewards</span>
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900">Join SA Survey Rewards</CardTitle>
          <CardDescription className="text-blue-700">
            Start earning $8-12 daily with South African surveys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-blue-900">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Your full name"
                  required
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-blue-900">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-blue-900">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password (min 6 characters)"
                    required
                    minLength={6}
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-600 hover:text-blue-800"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-medium rounded-lg h-[60px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <div className="text-center text-blue-700">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                Sign in here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
