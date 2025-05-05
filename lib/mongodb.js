import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/superhero-game"
const MONGODB_DB = process.env.MONGODB_DB || "superhero-game"

// Check the MongoDB URI
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

// Check the MongoDB DB
if (!MONGODB_DB) {
  throw new Error("Please define the MONGODB_DB environment variable")
}

let cachedClient = null
let cachedDb = null

export async function connectToDatabase() {
  // If we have cached values, use them
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  // Set the connection options
  const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }

  // Connect to cluster
  const client = new MongoClient(MONGODB_URI, opts)
  await client.connect()
  const db = client.db(MONGODB_DB)

  // Set cache
  cachedClient = client
  cachedDb = db

  return { client, db }
}

// Initialize database with required collections and indexes
export async function initDatabase() {
  const { db } = await connectToDatabase()

  // Create collections if they don't exist
  const collections = await db.listCollections().toArray()
  const collectionNames = collections.map((c) => c.name)

  // Users collection
  if (!collectionNames.includes("users")) {
    await db.createCollection("users")
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
  }

  // Games collection
  if (!collectionNames.includes("games")) {
    await db.createCollection("games")
    await db.collection("games").createIndex({ createdAt: -1 })
  }

  // Achievements collection
  if (!collectionNames.includes("achievements")) {
    await db.createCollection("achievements")

    // Insert default achievements if collection is empty
    const count = await db.collection("achievements").countDocuments()
    if (count === 0) {
      await db.collection("achievements").insertMany([
        {
          name: "First Victory",
          description: "Win your first game",
          icon: "trophy",
          requirementType: "wins",
          requirementValue: 1,
        },
        {
          name: "Veteran",
          description: "Play 10 games",
          icon: "gamepad",
          requirementType: "games_played",
          requirementValue: 10,
        },
        {
          name: "Card Master",
          description: "Play 100 cards",
          icon: "cards",
          requirementType: "cards_played",
          requirementValue: 100,
        },
        {
          name: "Champion",
          description: "Win 5 games",
          icon: "medal",
          requirementType: "wins",
          requirementValue: 5,
        },
        {
          name: "Superhero Fan",
          description: "Win with each superhero",
          icon: "star",
          requirementType: "hero_variety",
          requirementValue: 4,
        },
        {
          name: "Speed Demon",
          description: "Win a game in under 60 seconds",
          icon: "clock",
          requirementType: "fast_win",
          requirementValue: 60,
        },
        {
          name: "Dedicated Player",
          description: "Play 25 games",
          icon: "calendar",
          requirementType: "games_played",
          requirementValue: 25,
        },
        {
          name: "Collector",
          description: "Collect all 4 cards of each hero at least once",
          icon: "collection",
          requirementType: "collection",
          requirementValue: 4,
        },
      ])
    }
  }

  // User achievements collection
  if (!collectionNames.includes("user_achievements")) {
    await db.createCollection("user_achievements")
    await db.collection("user_achievements").createIndex({ userId: 1, achievementId: 1 }, { unique: true })
  }

  // Private rooms collection
  if (!collectionNames.includes("private_rooms")) {
    await db.createCollection("private_rooms")
    await db.collection("private_rooms").createIndex({ roomId: 1 }, { unique: true })
  }

  console.log("Database initialized successfully")
  return true
}
