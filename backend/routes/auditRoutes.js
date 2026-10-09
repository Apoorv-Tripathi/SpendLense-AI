import { Router } from 'express'
import { createAudit, getAuditByPublicId, regenerateSummary, generateSummaryOnly } from '../controllers/auditController.js'
import { validateCreateAudit, validatePublicId } from '../middleware/validate.js'
import { writeLimiter } from '../middleware/rateLimiter.js'

const router = Router()

// POST /api/audits/summary — generate summary without creating full audit
router.post('/summary', writeLimiter, generateSummaryOnly)

// POST /api/audits — save a new audit
router.post('/', writeLimiter, validateCreateAudit, createAudit)

// GET /api/audits/:publicId — fetch audit by public ID
router.get('/:publicId', validatePublicId, getAuditByPublicId)

// POST /api/audits/:publicId/regenerate-summary — regenerate AI summary
router.post('/:publicId/regenerate-summary', validatePublicId, regenerateSummary)
router.post('/:publicId/regenerate', validatePublicId, regenerateSummary)

export default router
