import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Email, password, and full name are required" }, { status: 400 })
    }

    // Get users from localStorage (client will send this)
    const users = JSON.parse(request.headers.get("x-storage-users") || "[]")

    // Check if user exists
    const existingUser = users.find((u: any) => u.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user
    const bcrypt = require("bcryptjs")
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      full_name: fullName,
      created_at: new Date().toISOString(),
    }

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

    users.push(newUser)

    return NextResponse.json({
      success: true,
      user: { id: newUser.id, email: newUser.email, full_name: newUser.full_name },
      profile: newProfile,
      users, // Send back updated users array
    })
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}
