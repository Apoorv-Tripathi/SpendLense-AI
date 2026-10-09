import { nanoid } from 'nanoid'
import Audit from '../models/Audit.js'
import { isDbConnected } from '../config/database.js'
import { inMemoryStore } from '../models/inMemoryStore.js'

const ID_LENGTH = 8

/**
 * Generate a unique public audit ID with collision avoidance.
 * Checks MongoDB when connected, or the in-memory store otherwise.
 *
 * @returns {Promise<string>}
 */
export async function generatePublicId() {
  const MAX_ATTEMPTS = 5

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const id = nanoid(ID_LENGTH)

    if (isDbConnected()) {
      try {
        const existing = await Audit.findOne({ publicId: id })
        if (!existing) return id
      } catch {
        // Fall back to memory check if DB query errors
        if (!inMemoryStore.findAuditByPublicId(id)) return id
      }
    } else {
      if (!inMemoryStore.findAuditByPublicId(id)) return id
    }
  }

  return nanoid(ID_LENGTH + 4)
}
