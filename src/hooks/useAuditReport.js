import { useState, useCallback } from 'react'
import { runAudit } from '../engine/auditEngine.js'
import { api } from '../utils/api.js'
import { useCurrency } from '../context/CurrencyContext.jsx'

const SESSION_KEY   = 'spendlens_last_report'
const PUBLIC_ID_KEY = 'spendlens_public_id'

function buildLocalFallbackSummary(report, currencySymbol = '$') {
  const { metrics, context, verdict } = report
  const monthly  = metrics?.potentialMonthlySavings?.toFixed(0) ?? '0'
  const annual   = metrics?.potentialAnnualSavings?.toFixed(0) ?? '0'
  const team     = context?.teamSize ?? 1
  const useCase  = context?.primaryUseCase ?? 'team'
  const tools    = metrics?.toolCount ?? (report?.tools?.length ?? 1)
  const score    = metrics?.wasteScore ?? 100
  const findings = metrics?.totalFindings ?? 0

  if (!metrics?.totalMonthlySpend || metrics.totalMonthlySpend === 0) {
    return 'Your SpendLens audit is complete. No spend data was provided, so no savings opportunities could be identified. Enter monthly spend amounts for your AI tools to see savings recommendations.'
  }

  if (findings === 0) {
    return `SpendLens evaluated ${tools} AI tool${tools !== 1 ? 's' : ''} for your ${team}-person ${useCase} team. No redundant subscriptions or pricing inefficiencies were found. Your AI stack has an optimal waste score of ${score}/100.`
  }

  const urgency = verdict?.mood === 'critical' || verdict?.mood === 'concerning'
    ? 'immediate consolidation and plan rightsizing are recommended'
    : 'a few targeted plan adjustments could meaningfully optimize recurring costs'

  return `SpendLens identified ${currencySymbol}${monthly}/month (${currencySymbol}${annual}/year) in potential savings across ${tools} AI tool${tools !== 1 ? 's' : ''} for your ${team}-person ${useCase} team. With ${findings} actionable finding${findings !== 1 ? 's' : ''} and a waste score of ${score}/100, ${urgency}. Review the prioritized breakdown below to begin reclaiming budget.`
}

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
  const [report, setReport]           = useState(loadCachedReport)
  const [loading, setLoading]         = useState(false)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [error, setError]             = useState(null)
  const [publicId, setPublicId]       = useState(() => sessionStorage.getItem(PUBLIC_ID_KEY))
  const [savedToDb, setSavedToDb]     = useState(false)
  const { currency }                  = useCurrency()

  const generate = useCallback(async (formState) => {
    setLoading(true)
    setError(null)
    setIsAiLoading(true)

    try {
      // 1. Run local deterministic engine instantly — never blocked by network
      const result = runAudit(formState)
      result.generatedAt = new Date(result.generatedAt)

      // 2. Attach immediate heuristic AI summary so results page has instant content
      result.aiSummary = {
        text: buildLocalFallbackSummary(result, currency.symbol),
        isFallback: true,
        model: 'Rule-Based Engine',
        provider: 'Deterministic Heuristics',
        generatedAt: new Date(),
      }

      // 3. Cache locally so results page renders immediately
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(result))
      setReport(result)

      // 4. Save to backend asynchronously for DB persistence and live LLM generation
      api.saveAudit({ ...result, currency: currency.code })
        .then(saved => {
          if (saved?.publicId) {
            sessionStorage.setItem(PUBLIC_ID_KEY, saved.publicId)
            setPublicId(saved.publicId)
            setSavedToDb(true)
          }

          if (saved?.aiSummary?.text) {
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
          console.warn('[API] Backend save or AI generation skipped (local results preserved):', err.message)
        })
        .finally(() => {
          setIsAiLoading(false)
        })

    } catch (err) {
      setError(err.message || 'Audit failed')
      setIsAiLoading(false)
    } finally {
      setLoading(false)
    }
  }, [currency])

  const regenerateAi = useCallback(async () => {
    if (!report) return
    setIsAiLoading(true)

    try {
      if (publicId) {
        const data = await api.regenerateSummary(publicId)
        if (data?.summary) {
          const updated = {
            ...report,
            aiSummary: data.summary,
          }
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated))
          setReport(updated)
        }
      } else {
        const saved = await api.saveAudit({ ...report, currency: currency.code })
        if (saved?.publicId) {
          sessionStorage.setItem(PUBLIC_ID_KEY, saved.publicId)
          setPublicId(saved.publicId)
          setSavedToDb(true)
        }
        if (saved?.aiSummary?.text) {
          const updated = {
            ...report,
            aiSummary: saved.aiSummary,
            publicId: saved.publicId || report.publicId,
          }
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated))
          setReport(updated)
        }
      }
    } catch (err) {
      console.warn('[AI] Summary regeneration failed:', err.message)
    } finally {
      setIsAiLoading(false)
    }
  }, [report, publicId, currency])

  const clearReport = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(PUBLIC_ID_KEY)
    setReport(null)
    setPublicId(null)
    setSavedToDb(false)
    setError(null)
    setIsAiLoading(false)
  }, [])

  return {
    report,
    loading,
    isAiLoading,
    error,
    generate,
    regenerateAi,
    clearReport,
    publicId,
    savedToDb,
  }
}