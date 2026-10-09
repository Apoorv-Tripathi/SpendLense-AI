import { GoogleGenAI } from '@google/genai'

let client = null

/**
 * Lazily initialise the Gemini client via official @google/genai SDK.
 * Returns null if the API key is not configured (allows graceful fallback).
 */
export function getGeminiClient() {
  if (client) return client

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null
  }

  try {
    client = new GoogleGenAI({ apiKey })
    console.log('[Gemini] Client initialised.')
    return client
  } catch (err) {
    console.warn('[Gemini] Failed to initialise client:', err.message)
    return null
  }
}

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
export const GEMINI_TIMEOUT_MS = 10_000
