import { connectToDatabase } from "@/lib/mongodb"

export async function saveGameResult(gameData) {
  const { db } = await connectToDatabase()

  const result = await db.collection("games").insertOne({
    ...gameData,
    createdAt: new Date(),
  })

  return result.insertedId
}

export async function getRecentGames(limit = 10) {
  const { db } = await connectToDatabase()
  return db.collection("games").find({}).sort({ createdAt: -1 }).limit(limit).toArray()
}

export async function getUserGames(userId, limit = 10) {
  const { db } = await connectToDatabase()
  return db
    .collection("games")
    .find({
      $or: [{ "players.id": userId }, { "spectators.id": userId }],
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
}
