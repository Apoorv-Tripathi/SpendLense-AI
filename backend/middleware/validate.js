import { param, body, validationResult } from 'express-validator'
import { badRequest } from '../utils/response.js'

export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const details = errors.array().map(e => `${e.path}: ${e.msg}`)
    return badRequest(res, 'Validation failed', details)
  }
  next()
}

// ─── Audit — accept everything, no strict rules ───────────────────────────────
export const validateCreateAudit = [validate]

// ─── Public ID ────────────────────────────────────────────────────────────────
export const validatePublicId = [
  param('publicId')
    .isString()
    .isLength({ min: 4, max: 20 })
    .withMessage('Invalid audit ID format'),
  validate,
]

// ─── Lead validation ──────────────────────────────────────────────────────────
export const validateCreateLead = [
  body('email')
    .isEmail().withMessage('A valid email address is required')
    .normalizeEmail(),
  body('auditPublicId')
    .isString().notEmpty().withMessage('auditPublicId is required')
    .isLength({ min: 4, max: 20 }).withMessage('Invalid audit ID'),
  body('companyName').optional().isString().isLength({ max: 120 }).trim(),
  body('role').optional().isString().isLength({ max: 80 }).trim(),
  body('teamSize').optional().isInt({ min: 1, max: 100_000 }),
  body('source').optional().isIn(['audit_results', 'landing_page', 'direct', 'referral']),
  validate,
]
