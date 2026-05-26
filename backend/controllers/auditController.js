import Audit from '../models/Audit.js'
import { generatePublicId } from '../utils/generatePublicId.js'
import { generateAuditSummary } from '../services/geminiService.js'
import * as res from '../utils/response.js'

// ─── POST /api/audits ─────────────────────────────────────────────────────────

export async function createAudit(req, resp) {
  try {
    const { context, tools, findings, metrics, verdict, currency } = req.body

    // Debug log — remove after confirming working
    console.log('[Audit] Received body keys:', Object.keys(req.body))
    console.log('[Audit] context:', JSON.stringify(context))
    console.log('[Audit] tools count:', tools?.length)
    console.log('[Audit] metrics keys:', metrics ? Object.keys(metrics) : 'missing')

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
    const summaryResult = await generateAuditSummary(auditDataForAI, currencyCode)

    // Normalise tools — accept toolName or toolId
    const normalizedTools = toolsArray.map(t => ({
      ...t,
      toolId:       t.toolId   || t.toolName || '',
      toolName:     t.toolName || t.toolId   || '',
      monthlySpend: parseFloat(t.monthlySpend) || 0,
      seats:        parseInt(t.seats)          || 1,
    }))

    const audit = new Audit({
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
      },
    })

    await audit.save()

    console.log(`[Audit] Saved → publicId: ${publicId}, savings: ${currencyCode} ${metrics.potentialMonthlySavings}/mo`)

    return res.created(resp, audit.toPublic())

  } catch (err) {
    console.error('[Audit] Save error:', err.message)
    if (err.name === 'ValidationError') {
      const details = Object.values(err.errors).map(e => e.message)
      console.error('[Audit] Mongoose validation details:', details)
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
    const audit = await Audit.findByPublicId(publicId)
    if (!audit) return res.notFound(resp, `No audit found with ID: ${publicId}`)
    audit.incrementViews().catch(e => console.warn('[Audit] Failed to increment views:', e.message))
    return res.ok(resp, audit.toPublic())
  } catch (err) {
    return res.serverError(resp, err, 'getAuditByPublicId')
  }
}

// ─── POST /api/audits/:publicId/regenerate-summary ───────────────────────────

export async function regenerateSummary(req, resp) {
  try {
    const { publicId } = req.params
    const audit = await Audit.findByPublicId(publicId)
    if (!audit) return res.notFound(resp, 'Audit not found')
    if (audit.aiSummary?.text && !audit.aiSummary?.isFallback) {
      return res.ok(resp, { summary: audit.aiSummary })
    }
    const auditData = {
      context: audit.context, tools: audit.tools,
      findings: audit.findings, metrics: audit.metrics, verdict: audit.verdict,
    }
    const summaryResult = await generateAuditSummary(auditData)
    audit.aiSummary = {
      text: summaryResult.text, generatedAt: new Date(),
      model: summaryResult.model, isFallback: summaryResult.isFallback,
    }
    await audit.save()
    return res.ok(resp, { summary: audit.aiSummary })
  } catch (err) {
    return res.serverError(resp, err, 'regenerateSummary')
  }
}

// ─── POST /api/audits/summary ─────────────────────────────────────────────────

export async function generateSummaryOnly(req, resp) {
  try {
    const { context, findings, metrics, verdict, currency } = req.body
    if (!context || !metrics || !verdict) {
      return res.badRequest(resp, 'Missing required fields')
    }
    const summaryResult = await generateAuditSummary({
      context, tools: [], findings: findings ?? [], metrics, verdict,
    }, currency || 'USD')
    return res.ok(resp, summaryResult)
  } catch (err) {
    return res.serverError(resp, err, 'generateSummaryOnly')
  }
}