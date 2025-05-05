import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function saveGameResult(gameData) {
  const { db } = await connectToDatabase()

  const result = await db.collection("games").insertOne({
    roomName: gameData.roomName,
    winner: gameData.winner,
    duration: gameData.duration,
    players: gameData.players,
    spectators: gameData.spectators || [],
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

  // Find games where the user was a player or spectator
  return db
    .collection("games")
    .find({
      $or: [{ "players.userId": userId }, { "spectators.userId": userId }],
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
}

export async function createPrivateRoom(roomId, password, creatorId) {
  const { db } = await connectToDatabase()

  await db.collection("private_rooms").insertOne({
    roomId,
    password,
    creatorId: new ObjectId(creatorId),
    createdAt: new Date(),
  })

  return true
}

export async function validatePrivateRoom(roomId, password) {
  const { db } = await connectToDatabase()

  const room = await db.collection("private_rooms").findOne({
    roomId,
    password,
  })

  return !!room
}

export async function deletePrivateRoom(roomId) {
  const { db } = await connectToDatabase()

  await db.collection("private_rooms").deleteOne({ roomId })

  return true
}
