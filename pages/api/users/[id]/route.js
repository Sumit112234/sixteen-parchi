import { NextResponse } from "next/server"
import { getUserById, updateUserStats, saveCustomCardDesign, updateUserProfile } from "@/models/user"

export async function GET(request, { params }) {
  try {
    const { id } = params
    const user = await getUserById(id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()

    // Update user profile
    if (body.profile) {
      await updateUserProfile(id, body.profile)
    }

    // Update user stats
    if (body.stats) {
      await updateUserStats(id, body.stats)
    }

    // Save custom card design
    if (body.cardDesign) {
      const { name, design } = body.cardDesign
      await saveCustomCardDesign(id, name, design)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
