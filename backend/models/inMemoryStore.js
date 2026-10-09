/**
 * inMemoryStore.js
 * In-memory persistence fallback for audits and leads when MongoDB is not connected.
 * Ensures the application runs locally and during evaluations without requiring external database setup.
 */

const audits = new Map()
const leads  = new Map()

export const inMemoryStore = {
  // ── Audits ──
  saveAudit(auditData) {
    const doc = {
      ...auditData,
      _id: `mem_audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: auditData.createdAt || new Date(),
      updatedAt: new Date(),
      viewCount: auditData.viewCount || 0,
      incrementViews: async function() {
        this.viewCount += 1
      },
      toPublic() {
        const copy = { ...this }
        delete copy.__v
        delete copy.isDeleted
        delete copy.leadId
        return copy
      },
    }
    audits.set(doc.publicId, doc)
    return doc
  },

  findAuditByPublicId(publicId) {
    return audits.get(publicId) || null
  },

  updateAudit(publicId, updates) {
    const existing = audits.get(publicId)
    if (!existing) return null
    const updated = { ...existing, ...updates, updatedAt: new Date() }
    audits.set(publicId, updated)
    return updated
  },

  // ── Leads ──
  saveLead(leadData) {
    const doc = {
      ...leadData,
      _id: `mem_lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      emailStatus: { sent: false, sentAt: null, resendId: null, error: null },
      markEmailSent: async function(resendId) {
        this.emailStatus = { sent: true, sentAt: new Date(), resendId, error: null }
      },
      markEmailFailed: async function(error) {
        this.emailStatus = { sent: false, sentAt: null, resendId: null, error }
      },
    }
    leads.set(doc._id, doc)
    return doc
  },

  findLeadByEmailAndAudit(email, auditId) {
    const cleanEmail = email.toLowerCase().trim()
    for (const lead of leads.values()) {
      if (lead.email.toLowerCase() === cleanEmail && String(lead.auditId) === String(auditId)) {
        return lead
      }
    }
    return null
  },

  // Stats
  getStats() {
    return {
      auditCount: audits.size,
      leadCount:  leads.size,
    }
  },
}
