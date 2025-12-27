import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get users from localStorage (client will send this)
    const users = JSON.parse(request.headers.get("x-storage-users") || "[]")

    console.log("[v0] Login attempt for:", email)
    console.log("[v0] Available users:", users.length)

    // Find user
    const user = users.find((u: any) => u.email === email)
    if (!user) {
      console.log("[v0] User not found")
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const bcrypt = require("bcryptjs")
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      console.log("[v0] Invalid password")
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    console.log("[v0] Login successful")
    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, full_name: user.full_name },
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 })
  }
}
