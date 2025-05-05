import { NextResponse } from "next/server"
import { getAllAchievements } from "@/models/user"

export async function GET() {
  try {
    const achievements = await getAllAchievements()
    return NextResponse.json({ achievements })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
