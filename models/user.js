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
      theme: "default",
    },
    tutorialCompleted: false,
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

export async function unlockAchievement(userId, achievementId) {
  const { db } = await connectToDatabase()

  // Check if already unlocked
  const existing = await db.collection("user_achievements").findOne({
    userId: new ObjectId(userId),
    achievementId: new ObjectId(achievementId),
  })

  if (!existing) {
    await db.collection("user_achievements").insertOne({
      userId: new ObjectId(userId),
      achievementId: new ObjectId(achievementId),
      unlockedAt: new Date(),
    })
    return true
  }

  return false
}

export async function getUserAchievements(userId) {
  const { db } = await connectToDatabase()

  const userAchievements = await db
    .collection("user_achievements")
    .aggregate([
      { $match: { userId: new ObjectId(userId) } },
      {
        $lookup: {
          from: "achievements",
          localField: "achievementId",
          foreignField: "_id",
          as: "achievement",
        },
      },
      { $unwind: "$achievement" },
      {
        $project: {
          _id: 1,
          name: "$achievement.name",
          description: "$achievement.description",
          icon: "$achievement.icon",
          unlockedAt: 1,
        },
      },
    ])
    .toArray()

  return userAchievements
}

export async function getAllAchievements() {
  const { db } = await connectToDatabase()
  return db.collection("achievements").find({}).toArray()
}

export async function checkAndUnlockAchievements(userId) {
  const { db } = await connectToDatabase()

  // Get user stats
  const user = await getUserById(userId)
  if (!user) return []

  const stats = user.stats || {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    cardsPlayed: 0,
    fastestWin: null,
    favoriteHero: null,
  }

  // Get all achievements
  const achievements = await getAllAchievements()

  // Get user's unlocked achievements
  const userAchievements = await db
    .collection("user_achievements")
    .find({ userId: new ObjectId(userId) })
    .toArray()

  const unlockedIds = userAchievements.map((a) => a.achievementId.toString())

  const newlyUnlocked = []

  // Check each achievement
  for (const achievement of achievements) {
    if (unlockedIds.includes(achievement._id.toString())) {
      continue
    }

    let unlocked = false

    switch (achievement.requirementType) {
      case "wins":
        unlocked = stats.wins >= achievement.requirementValue
        break
      case "games_played":
        unlocked = stats.gamesPlayed >= achievement.requirementValue
        break
      case "cards_played":
        unlocked = stats.cardsPlayed >= achievement.requirementValue
        break
      case "fast_win":
        unlocked = stats.fastestWin && stats.fastestWin <= achievement.requirementValue
        break
      // Other achievement types would be handled here
    }

    if (unlocked) {
      await unlockAchievement(userId, achievement._id)
      newlyUnlocked.push(achievement)
    }
  }

  return newlyUnlocked
}
