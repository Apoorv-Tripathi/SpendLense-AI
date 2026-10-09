import Audit from '../models/Audit.js'
import { isDbConnected } from '../config/database.js'
import { inMemoryStore } from '../models/inMemoryStore.js'
import { generatePublicId } from '../utils/generatePublicId.js'
import { generateAuditSummary } from '../services/geminiService.js'
import * as res from '../utils/response.js'

// ─── POST /api/audits ─────────────────────────────────────────────────────────

export async function createAudit(req, resp) {
  try {
    const { context, tools, findings, metrics, verdict, currency } = req.body

    if (!context || !metrics || !verdict) {
      return res.badRequest(resp, 'Missing required fields: context, metrics, verdict')
    }

    const toolsArray = Array.isArray(tools) ? tools : []
    const currencyCode = currency || 'USD'

    const publicId = await generatePublicId()

    const auditDataForAI = {
      context,
      tools: toolsArray,
      findings: findings ?? [],
      metrics,
      verdict,
    }

    // Generate AI executive summary (Gemini -> Groq -> fallback)
    const summaryResult = await generateAuditSummary(auditDataForAI, currencyCode)

    const normalizedTools = toolsArray.map(t => ({
      ...t,
      toolId:       t.toolId   || t.toolName || '',
      toolName:     t.toolName || t.toolId   || '',
      monthlySpend: parseFloat(t.monthlySpend) || 0,
      seats:        parseInt(t.seats)          || 1,
    }))

    const auditPayload = {
      publicId,
      context: {
        teamSize:       parseInt(context.teamSize) || 1,
        primaryUseCase: context.primaryUseCase || 'mixed',
        teamBucket:     context.teamBucket || 'small',
      },
      tools:    normalizedTools,
      findings: findings ?? [],
      metrics,
      verdict,
      aiSummary: {
        text:        summaryResult.text,
        generatedAt: new Date(),
        model:       summaryResult.model,
        isFallback:  summaryResult.isFallback,
        provider:    summaryResult.provider,
        reason:      summaryResult.reason,
      },
    }

    let publicAudit = null

    if (isDbConnected()) {
      try {
        const audit = new Audit(auditPayload)
        await audit.save()
        publicAudit = audit.toPublic()
      } catch (dbErr) {
        console.warn('[Audit] MongoDB save failed, falling back to in-memory store:', dbErr.message)
        const memAudit = inMemoryStore.saveAudit(auditPayload)
        publicAudit = memAudit.toPublic()
      }
    } else {
      const memAudit = inMemoryStore.saveAudit(auditPayload)
      publicAudit = memAudit.toPublic()
    }

    console.log(`[Audit] Created → publicId: ${publicId}, model: ${summaryResult.model} (${summaryResult.provider || 'unknown'})`)

    return res.created(resp, publicAudit)

  } catch (err) {
    console.error('[Audit] Save error:', err.message)
    if (err.name === 'ValidationError') {
      const details = Object.values(err.errors).map(e => e.message)
      return res.badRequest(resp, 'Audit validation failed', details)
    }
    return res.serverError(resp, err, 'createAudit')
  }
}

// ─── GET /api/audits/:publicId ────────────────────────────────────────────────

export async function getAuditByPublicId(req, resp) {
  try {
    const { publicId } = req.params
    if (!publicId || publicId.length < 4) {
      return res.badRequest(resp, 'Invalid audit ID')
    }

    let audit = null

    if (isDbConnected()) {
      try {
        audit = await Audit.findByPublicId(publicId)
      } catch (err) {
        console.warn('[Audit] DB lookup error:', err.message)
      }
    }

    if (!audit) {
      audit = inMemoryStore.findAuditByPublicId(publicId)
    }

    if (!audit) {
      return res.notFound(resp, `No audit found with ID: ${publicId}`)
    }

    if (typeof audit.incrementViews === 'function') {
      audit.incrementViews().catch(() => {})
    }

    return res.ok(resp, typeof audit.toPublic === 'function' ? audit.toPublic() : audit)

  } catch (err) {
    return res.serverError(resp, err, 'getAuditByPublicId')
  }
}

// ─── POST /api/audits/:publicId/regenerate-summary ───────────────────────────

export async function regenerateSummary(req, resp) {
  try {
    const { publicId } = req.params

    let audit = null
    if (isDbConnected()) {
      try {
        audit = await Audit.findByPublicId(publicId)
      } catch (err) {
        console.warn('[Audit] DB lookup error:', err.message)
      }
    }
    if (!audit) {
      audit = inMemoryStore.findAuditByPublicId(publicId)
    }

    if (!audit) return res.notFound(resp, 'Audit not found')

    const auditData = {
      context: audit.context,
      tools: audit.tools,
      findings: audit.findings,
      metrics: audit.metrics,
      verdict: audit.verdict,
    }

    const summaryResult = await generateAuditSummary(auditData)

    const updatedSummary = {
      text:        summaryResult.text,
      generatedAt: new Date(),
      model:       summaryResult.model,
      isFallback:  summaryResult.isFallback,
      provider:    summaryResult.provider,
      reason:      summaryResult.reason,
    }

    audit.aiSummary = updatedSummary

    if (isDbConnected() && typeof audit.save === 'function') {
      try {
        await audit.save()
      } catch (saveErr) {
        inMemoryStore.updateAudit(publicId, { aiSummary: updatedSummary })
      }
    } else {
      inMemoryStore.updateAudit(publicId, { aiSummary: updatedSummary })
    }

    return res.ok(resp, { summary: updatedSummary })

  } catch (err) {
    return res.serverError(resp, err, 'regenerateSummary')
  }
}

// ─── POST /api/audits/summary ─────────────────────────────────────────────────

export async function generateSummaryOnly(req, resp) {
  try {
    const { context, tools, findings, metrics, verdict, currency } = req.body
    if (!context || !metrics || !verdict) {
      return res.badRequest(resp, 'Missing required fields: context, metrics, verdict')
    }

    const summaryResult = await generateAuditSummary({
      context,
      tools: tools ?? [],
      findings: findings ?? [],
      metrics,
      verdict,
    }, currency || 'USD')

    return res.ok(resp, summaryResult)
  } catch (err) {
    return res.serverError(resp, err, 'generateSummaryOnly')
  }
}