import Groq from 'groq-sdk'

let client = null

/**
 * Lazily initialise the Groq client.
 * Returns null if the API key is not configured (allows graceful fallback).
 */
export function getGroqClient() {
  if (client) return client

  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return null
  }

  try {
    client = new Groq({ apiKey })
    console.log('[Groq] Client initialised.')
    return client
  } catch (err) {
    console.warn('[Groq] Failed to initialise client:', err.message)
    return null
  }
}

export const GROQ_MODEL      = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
export const GROQ_TIMEOUT_MS = 10_000
