import { MongoClient } from "mongodb"

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "-"
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
  // const opts = {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  // }

  // Connect to cluster
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db(MONGODB_DB)

  // Set cache
  cachedClient = client
  cachedDb = db

  return { client, db }
}
