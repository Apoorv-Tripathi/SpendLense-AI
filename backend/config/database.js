import mongoose from 'mongoose'

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 2000

export const isDbConnected = () => mongoose.connection.readyState === 1

/**
 * Connect to MongoDB with retry logic.
 * Gracefully falls back to in-memory mode if MONGODB_URI is not configured,
 * allowing local evaluation and offline dev without crashing the process.
 */
export async function connectDB(retries = MAX_RETRIES) {
  const uri = process.env.MONGODB_URI

  if (!uri || uri === 'your_mongodb_uri_here') {
    console.log('[DB] MONGODB_URI not configured. Operating in in-memory mode for audits and leads.')
    return false
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      socketTimeoutMS: 45000,
    })

    const { host, name } = mongoose.connection
    console.log(`[DB] Connected to MongoDB Atlas → ${host}/${name}`)

    mongoose.connection.on('error', (err) => {
      console.error('[DB] Connection error:', err.message)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('[DB] Disconnected from MongoDB — fallback active')
    })

    return true

  } catch (err) {
    console.warn(`[DB] Connection attempt failed (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}):`, err.message)

    if (retries > 1) {
      console.log(`[DB] Retrying in ${RETRY_DELAY_MS / 1000}s…`)
      await new Promise(res => setTimeout(res, RETRY_DELAY_MS))
      return connectDB(retries - 1)
    }

    console.warn('[DB] MongoDB unavailable. Falling back to in-memory mode.')
    return false
  }
}

/**
 * Gracefully close the DB connection on server shutdown.
 */
export async function disconnectDB() {
  if (!isDbConnected()) return
  try {
    await mongoose.connection.close()
    console.log('[DB] Connection closed gracefully.')
  } catch (err) {
    console.error('[DB] Error during disconnect:', err.message)
  }
}
