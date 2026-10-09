import Lead from '../models/Lead.js'
import Audit from '../models/Audit.js'
import { isDbConnected } from '../config/database.js'
import { inMemoryStore } from '../models/inMemoryStore.js'
import { sendAuditConfirmationEmail } from '../services/emailService.js'
import * as res from '../utils/response.js'

// ─── POST /api/leads ──────────────────────────────────────────────────────────

export async function createLead(req, resp) {
  try {
    const {
      email,
      companyName = '',
      role        = '',
      teamSize,
      auditPublicId,
      source      = 'audit_results',
    } = req.body

    // ── 1. Find audit ──
    let audit = null
    if (isDbConnected()) {
      try {
        audit = await Audit.findByPublicId(auditPublicId)
      } catch (err) {
        console.warn('[Lead] DB lookup error:', err.message)
      }
    }
    if (!audit) {
      audit = inMemoryStore.findAuditByPublicId(auditPublicId)
    }

    if (!audit) {
      return res.notFound(resp, `No audit found with ID: ${auditPublicId}`)
    }

    // ── 2. Deduplicate ──
    if (isDbConnected()) {
      try {
        const existing = await Lead.alreadyExists(email, audit._id)
        if (existing) {
          return res.ok(resp, {
            lead: { id: existing._id, email: existing.email },
            duplicate: true,
            message: 'You already submitted your details for this audit.',
          })
        }
      } catch {}
    } else {
      const existingMem = inMemoryStore.findLeadByEmailAndAudit(email, audit._id)
      if (existingMem) {
        return res.ok(resp, {
          lead: { id: existingMem._id, email: existingMem.email },
          duplicate: true,
          message: 'You already submitted your details for this audit.',
        })
      }
    }

    // ── 3. Save Lead ──
    const leadData = {
      email,
      companyName,
      role,
      teamSize:      teamSize ? parseInt(teamSize) : audit.context.teamSize,
      auditId:       audit._id,
      auditPublicId: audit.publicId,
      savingsSnapshot: {
        monthly: audit.metrics.potentialMonthlySavings,
        annual:  audit.metrics.potentialAnnualSavings,
      },
      source,
    }

    let createdLead = null
    if (isDbConnected()) {
      try {
        const lead = new Lead(leadData)
        await lead.save()
        createdLead = lead
        await Audit.findByIdAndUpdate(audit._id, { leadId: lead._id }).catch(() => {})
      } catch (err) {
        createdLead = inMemoryStore.saveLead(leadData)
      }
    } else {
      createdLead = inMemoryStore.saveLead(leadData)
      inMemoryStore.updateAudit(auditPublicId, { leadId: createdLead._id })
    }

    console.log(`[Lead] Captured → ${email}, audit: ${auditPublicId}`)

    // ── 4. Confirmation Email (fire-and-forget) ──
    sendAuditConfirmationEmail({
      toEmail:       email,
      leadName:      companyName || '',
      auditPublicId: audit.publicId,
      metrics:       audit.metrics,
      context:       audit.context,
      aiSummary:     audit.aiSummary?.text ?? '',
    })
      .then(result => {
        if (result.success && typeof createdLead.markEmailSent === 'function') {
          createdLead.markEmailSent(result.messageId).catch(() => {})
        } else if (typeof createdLead.markEmailFailed === 'function') {
          createdLead.markEmailFailed(result.error).catch(() => {})
        }
      })
      .catch(err => {
        console.error('[Lead] Email failed:', err.message)
      })

    return res.created(resp, {
      lead: {
        id:    createdLead._id,
        email: createdLead.email,
      },
      message: 'Your audit report has been saved. Check your email for a summary.',
    })

  } catch (err) {
    if (err.name === 'ValidationError') {
      const details = Object.values(err.errors).map(e => e.message)
      return res.badRequest(resp, 'Lead validation failed', details)
    }
    return res.serverError(resp, err, 'createLead')
  }
}
