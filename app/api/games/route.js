import { NextResponse } from "next/server"
import { saveGameResult, getRecentGames, getUserGames } from "@/models/game"

export async function POST(request) {
  try {
    const gameData = await request.json()

    const gameId = await saveGameResult(gameData)

    return NextResponse.json({ gameId })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (userId) {
      const games = await getUserGames(userId, limit)
      return NextResponse.json({ games })
    } else {
      const games = await getRecentGames(limit)
      return NextResponse.json({ games })
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
