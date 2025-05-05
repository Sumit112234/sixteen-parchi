import { NextResponse } from "next/server"
import { getUserAchievements, checkAndUnlockAchievements } from "@/models/user"

export async function GET(request, { params }) {
  try {
    const { id } = params
    const achievements = await getUserAchievements(id)
    return NextResponse.json({ achievements })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params
    const newAchievements = await checkAndUnlockAchievements(id)
    return NextResponse.json({ newAchievements })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
