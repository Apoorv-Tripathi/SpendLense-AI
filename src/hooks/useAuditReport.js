import { useState, useCallback } from 'react'
import { runAudit } from '../engine/auditEngine.js'
import { api } from '../utils/api.js'
import { useCurrency } from '../context/CurrencyContext.jsx'

const SESSION_KEY    = 'spendlens_last_report'
const PUBLIC_ID_KEY  = 'spendlens_public_id'

function loadCachedReport() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    parsed.generatedAt = new Date(parsed.generatedAt)
    return parsed
  } catch {
    return null
  }
}

export function useAuditReport() {
  const [report, setReport]       = useState(loadCachedReport)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [publicId, setPublicId]   = useState(() => sessionStorage.getItem(PUBLIC_ID_KEY))
  const [savedToDb, setSavedToDb] = useState(false)
  const { currency } = useCurrency()

  const generate = useCallback(async (formState) => {
    setLoading(true)
    setError(null)

    try {
      // 1. Run local engine instantly — never blocked by network
      const result = runAudit(formState)
      result.generatedAt = new Date(result.generatedAt)

      // 2. Cache locally so results page shows immediately
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(result))
      setReport(result)

      // 3. Save to backend in background (non-blocking)
      api.saveAudit({ ...result, currency: currency.code })
        .then(saved => {
          sessionStorage.setItem(PUBLIC_ID_KEY, saved.publicId)
          setPublicId(saved.publicId)
          setSavedToDb(true)

          // 4. Merge AI summary back into local report
          if (saved.aiSummary?.text) {
            const updated = {
              ...result,
              aiSummary: saved.aiSummary,
              publicId:  saved.publicId,
            }
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated))
            setReport(updated)
          }
        })
        .catch(err => {
          console.warn('[API] Backend save failed (results still available locally):', err.message)
        })

    } catch (err) {
      setError(err.message || 'Audit failed')
    } finally {
      setLoading(false)
    }
  }, [currency])

  const clearReport = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(PUBLIC_ID_KEY)
    setReport(null)
    setPublicId(null)
    setSavedToDb(false)
    setError(null)
  }, [])

  return { report, loading, error, generate, clearReport, publicId, savedToDb }
}