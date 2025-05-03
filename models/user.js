import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function createUser({ username, email, avatarId, password, customAvatar }) {
  const { db } = await connectToDatabase()

  // Check if user already exists
  const existingUser = await db.collection("users").findOne({ email })
  if (existingUser) {
    throw new Error("User already exists")
  }

  // Create new user
  const result = await db.collection("users").insertOne({
    username,
    email,
    avatarId: avatarId || 1,
    customAvatar, // Store custom avatar URL if provided
    password, // In a real app, this should be hashed
    createdAt: new Date(),
    stats: {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      cardsPlayed: 0,
      fastestWin: null,
      favoriteHero: null,
    },
    customCardDesigns: {},
    settings: {
      soundEnabled: true,
      animationsEnabled: true,
    },
  })

  return result.insertedId
}

export async function getUserById(id) {
  const { db } = await connectToDatabase()
  return db.collection("users").findOne({ _id: new ObjectId(id) })
}

export async function getUserByEmail(email) {
  const { db } = await connectToDatabase()
  return db.collection("users").findOne({ email })
}

export async function updateUserStats(userId, stats) {
  const { db } = await connectToDatabase()
  return db.collection("users").updateOne({ _id: new ObjectId(userId) }, { $set: { stats } })
}

export async function updateUserProfile(userId, profileData) {
  const { db } = await connectToDatabase()
  return db.collection("users").updateOne({ _id: new ObjectId(userId) }, { $set: profileData })
}

export async function saveCustomCardDesign(userId, designName, design) {
  const { db } = await connectToDatabase()
  return db
    .collection("users")
    .updateOne({ _id: new ObjectId(userId) }, { $set: { [`customCardDesigns.${designName}`]: design } })
}

export async function getLeaderboard(limit = 10) {
  const { db } = await connectToDatabase()
  return db
    .collection("users")
    .find({})
    .project({ username: 1, avatarId: 1, customAvatar: 1, "stats.wins": 1, "stats.gamesPlayed": 1 })
    .sort({ "stats.wins": -1 })
    .limit(limit)
    .toArray()
}
