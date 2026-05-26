import { Router } from 'express'
import { createAudit, getAuditByPublicId, regenerateSummary } from '../controllers/auditController.js'
import { validateCreateAudit, validatePublicId } from '../middleware/validate.js'
import { writeLimiter } from '../middleware/rateLimiter.js'

const router = Router()

// POST /api/audits — save a new audit
router.post('/', writeLimiter, validateCreateAudit, createAudit)

// GET /api/audits/:publicId — fetch audit by public ID
router.get('/:publicId', validatePublicId, getAuditByPublicId)

// POST /api/audits/:publicId/regenerate-summary — regenerate AI summary
router.post('/:publicId/regenerate-summary', validatePublicId, regenerateSummary)

export default router
