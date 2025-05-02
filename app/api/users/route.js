import { NextResponse } from "next/server"
import { createUser, getUserByEmail, getLeaderboard } from "@/models/user"

export async function POST(request) {
  try {
    const body = await request.json()
    const { username, email, avatarId, password } = body

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const userId = await createUser({ username, email, avatarId, password })

    return NextResponse.json({ userId })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    // Get leaderboard
    if (searchParams.get("leaderboard") === "true") {
      const limit = Number.parseInt(searchParams.get("limit") || "10")
      const leaderboard = await getLeaderboard(limit)
      return NextResponse.json({ leaderboard })
    }

    // Get user by email
    const email = searchParams.get("email")
    if (email) {
      const user = await getUserByEmail(email)
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      return NextResponse.json({ user })
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
