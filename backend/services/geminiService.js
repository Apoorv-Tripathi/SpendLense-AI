/**
 * geminiService.js
 * Multi-provider AI summary generator supporting Google Gemini and Groq,
 * with deterministic fallback when API keys are unconfigured or rate-limited.
 */

import { getGeminiClient, GEMINI_MODEL, GEMINI_TIMEOUT_MS } from '../config/gemini.js'
import { getGroqClient, GROQ_MODEL, GROQ_TIMEOUT_MS } from '../config/groq.js'

// ─── Fallback summary (deterministic, based on exact user audit data) ───────

export function buildFallbackSummary(auditData, currencyCode = 'USD') {
  const { metrics, context, verdict } = auditData
  const monthly  = metrics.potentialMonthlySavings?.toFixed(0) ?? '0'
  const annual   = metrics.potentialAnnualSavings?.toFixed(0) ?? '0'
  const team     = context.teamSize ?? 1
  const useCase  = context.primaryUseCase ?? 'team'
  const tools    = metrics.toolCount ?? (auditData.tools?.length ?? 1)
  const score    = metrics.wasteScore ?? 100
  const findings = metrics.totalFindings ?? 0
  const c        = currencyCode

  if (!metrics.totalMonthlySpend || metrics.totalMonthlySpend === 0) {
    return `Your SpendLens audit is complete. No spend data was provided, so no savings opportunities could be identified. Re-run the audit with monthly spend amounts for each AI tool your team uses.`
  }

  if (findings === 0) {
    return `Your SpendLens audit reviewed ${tools} AI tool${tools !== 1 ? 's' : ''} for your ${team}-person ${useCase} team and found no significant waste. Your AI tooling budget is well-optimised with a healthy waste score of ${score}/100. Continue monitoring quarterly as team size and pricing tiers evolve.`
  }

  const urgencyText = verdict?.mood === 'critical' || verdict?.mood === 'concerning'
    ? 'immediate consolidation and plan rightsizing are recommended'
    : 'a few targeted plan adjustments could meaningfully reduce recurring expenses'

  return `Your SpendLens audit identified ${c} ${monthly}/month (${c} ${annual}/year) in potential savings across ${tools} AI tool${tools !== 1 ? 's' : ''} for your ${team}-person ${useCase} team. With ${findings} actionable finding${findings !== 1 ? 's' : ''} and a waste score of ${score}/100, ${urgencyText}. Review the prioritized recommendations in your report to start recovering budget.`
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

export function buildPrompt(auditData, currencyCode = 'USD') {
  const { metrics, context, findings, verdict } = auditData
  const c = currencyCode

  const topFindings = (findings || [])
    .filter(f => f.type !== 'healthy' && f.monthlySavings > 0)
    .slice(0, 3)
    .map(f => `- ${f.title} (save ${c} ${f.monthlySavings.toFixed(0)}/mo)`)
    .join('\n')

  return `You are a financial advisor specialising in AI tooling costs for engineering teams. Write a professional, personalised executive audit summary in EXACTLY 100 words. Be specific, honest, and actionable. Plain paragraph only — do NOT use markdown, bullet points, headers, or quotes. Use ${c} as the currency symbol for all monetary figures.

AUDIT DATA:
- Team: ${context.teamSize} people, primary use case: ${context.primaryUseCase}
- Total monthly AI spend: ${c} ${metrics.totalMonthlySpend?.toFixed(0) ?? 0}
- Potential monthly savings: ${c} ${metrics.potentialMonthlySavings?.toFixed(0) ?? 0}
- Potential annual savings: ${c} ${metrics.potentialAnnualSavings?.toFixed(0) ?? 0}
- Waste score: ${metrics.wasteScore ?? 0}/100 (100 = perfect, lower = more waste)
- Total findings: ${metrics.totalFindings ?? 0} (${metrics.criticalCount ?? 0} critical, ${metrics.highCount ?? 0} high)
- Overall verdict: ${verdict?.mood ?? 'good'}

KEY FINDINGS:
${topFindings || '- No major issues found'}

Write the 100-word summary now:`
}

// ─── Main Generator ───────────────────────────────────────────────────────────

export async function generateAuditSummary(auditData, currencyCode = 'USD') {
  const prompt = buildPrompt(auditData, currencyCode)

  // 1. Try Gemini first if key is available
  const gemini = getGeminiClient()
  if (gemini) {
    try {
      console.log(`[Gemini] Requesting summary with model ${GEMINI_MODEL}…`)
      const response = await Promise.race([
        gemini.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API request timed out')), GEMINI_TIMEOUT_MS)
        ),
      ])

      const text = response?.text?.trim()
      if (text && text.length >= 50) {
        console.log(`[Gemini] Summary generated successfully (${text.split(/\s+/).length} words)`)
        return {
          text,
          isFallback: false,
          model: GEMINI_MODEL,
          provider: 'gemini',
        }
      }
      throw new Error('Gemini returned an empty or insufficient response')
    } catch (err) {
      console.warn('[Gemini] Request failed:', err.message)
      // Fall through to try Groq
    }
  }

  // 2. Try Groq if Gemini is not configured or failed
  const groq = getGroqClient()
  if (groq) {
    try {
      console.log(`[Groq] Requesting summary with model ${GROQ_MODEL}…`)
      const completion = await Promise.race([
        groq.chat.completions.create({
          model: GROQ_MODEL,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 220,
          temperature: 0.7,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Groq API request timed out')), GROQ_TIMEOUT_MS)
        ),
      ])

      const text = completion.choices[0]?.message?.content?.trim()
      if (text && text.length >= 50) {
        console.log(`[Groq] Summary generated successfully (${text.split(/\s+/).length} words)`)
        return {
          text,
          isFallback: false,
          model: GROQ_MODEL,
          provider: 'groq',
        }
      }
      throw new Error('Groq returned an empty response')
    } catch (err) {
      console.warn('[Groq] Request failed:', err.message)
      // Fall through to fallback
    }
  }

  // 3. Fallback when keys are missing or requests fail
  const reason = !gemini && !groq
    ? 'AI API key not configured (set GEMINI_API_KEY or GROQ_API_KEY in backend/.env)'
    : 'AI provider request failed or timed out'

  console.log(`[AI] Using deterministic fallback summary (${reason})`)
  return {
    text: buildFallbackSummary(auditData, currencyCode),
    isFallback: true,
    model: 'rule-based',
    provider: 'fallback',
    reason,
  }
}