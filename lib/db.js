import { Pool } from "pg"

// Create a connection pool using the Neon environment variables
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

// Helper function to execute SQL queries
export async function query(text, params) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("Executed query", { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("Error executing query", { text, error })
    throw error
  }
}

// Initialize database tables
export async function initDatabase() {
  try {
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar_id INTEGER,
        custom_avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        settings JSONB DEFAULT '{"soundEnabled": true, "animationsEnabled": true, "theme": "default"}',
        tutorial_completed BOOLEAN DEFAULT FALSE
      )
    `)

    // Create stats table
    await query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        games_played INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        cards_played INTEGER DEFAULT 0,
        fastest_win INTEGER,
        favorite_hero VARCHAR(255)
      )
    `)

    // Create card designs table
    await query(`
      CREATE TABLE IF NOT EXISTS card_designs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        design JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create games table
    await query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        room_name VARCHAR(255) NOT NULL,
        winner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        winner_name VARCHAR(255),
        winning_hero VARCHAR(255),
        duration INTEGER,
        players JSONB NOT NULL,
        spectators JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create achievements table
    await query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(255) NOT NULL,
        requirement_type VARCHAR(50) NOT NULL,
        requirement_value INTEGER NOT NULL
      )
    `)

    // Create user achievements table
    await query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, achievement_id)
      )
    `)

    // Create private rooms table
    await query(`
      CREATE TABLE IF NOT EXISTS private_rooms (
        room_id VARCHAR(255) PRIMARY KEY,
        password VARCHAR(255) NOT NULL,
        creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Insert default achievements if they don't exist
    const achievementsExist = await query("SELECT COUNT(*) FROM achievements")
    if (achievementsExist.rows[0].count === "0") {
      await query(`
        INSERT INTO achievements (name, description, icon, requirement_type, requirement_value) VALUES
        ('First Victory', 'Win your first game', 'trophy', 'wins', 1),
        ('Veteran', 'Play 10 games', 'gamepad', 'games_played', 10),
        ('Card Master', 'Play 100 cards', 'cards', 'cards_played', 100),
        ('Champion', 'Win 5 games', 'medal', 'wins', 5),
        ('Superhero Fan', 'Win with each superhero', 'star', 'hero_variety', 4),
        ('Speed Demon', 'Win a game in under 60 seconds', 'clock', 'fast_win', 60),
        ('Dedicated Player', 'Play 25 games', 'calendar', 'games_played', 25),
        ('Collector', 'Collect all 4 cards of each hero at least once', 'collection', 'collection', 4)
      `)
    }

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}
