# SpendLens — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     BROWSER (React)                      │
│                                                         │
│  LandingPage → AuditPage → ResultsPage → SharedAudit   │
│                    │              │                      │
│           useAuditForm     useAuditReport               │
│                    │              │                      │
│              localStorage   sessionStorage              │
│                                  │                      │
│              auditEngine.js (local, instant)            │
└──────────────────────┬──────────────────────────────────┘
                       │ fetch (background, non-blocking)
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  EXPRESS BACKEND                         │
│                                                         │
│  POST /api/audits   → auditController → Audit model    │
│  POST /api/leads    → leadController  → Lead model     │
│  GET  /api/audits/:id → fetch by publicId              │
│  GET  /og/audit/:id   → OG meta HTML for crawlers      │
│                                                         │
│  Services: geminiService → Groq/Gemini AI              │
│            emailService  → Resend                      │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
    ┌────▼────┐                 ┌────▼────┐
    │ MongoDB │                 │ Resend  │
    │ Atlas   │                 │ Email   │
    └─────────┘                 └─────────┘
```

## Key Design Principles

### 1. Local-first audit engine
The audit engine (`src/engine/`) runs entirely in the browser using pure JS with no network calls. Results appear instantly. The backend save is additive — if it fails, the user still sees their results.

### 2. Non-blocking backend operations
- `api.saveAudit()` is called without `await` after the local engine runs
- Email sending is fire-and-forget inside the lead controller
- AI summary generation races against a 10-second timeout with a fallback

### 3. Rule-based audit engine
12 independent rule functions in `auditRules.js`. Each takes `(toolEntry, context)` or `(allTools, context)` and returns a `Finding | null`. Adding a rule = one function + one line in the registry.

## Frontend Architecture

```
src/
├── engine/           Pure JS audit rules — no React, no network
│   ├── auditKnowledge.js   Tool pricing database
│   ├── auditHelpers.js     Pure utility functions
│   ├── auditRules.js       12 independent rule functions
│   └── auditEngine.js      Orchestrator: runAudit()
│
├── hooks/
│   ├── useAuditForm.js     Form state + localStorage (500ms debounce)
│   └── useAuditReport.js   Engine runner + backend sync
│
├── pages/
│   ├── LandingPage.jsx     Marketing page
│   ├── AuditPage.jsx       Form entry
│   ├── ResultsPage.jsx     Private results (session-only)
│   └── SharedAuditPage.jsx Public shareable URL /shared/:publicId
│
├── components/
│   ├── seo/SEOMeta.jsx     react-helmet-async wrapper
│   ├── layout/             Navbar, Footer, Layout
│   ├── landing/            Hero, Stats, HowItWorks, Testimonials, CTA
│   ├── form/               ToolCard, SpendSummary, FormProgress
│   ├── results/            ResultsHero, FindingCard, ToolResultCard,
│   │                       SavingsBreakdown, ResultsCTA, LeadCaptureForm
│   └── ui/                 Input, Select, Badge, Tooltip
│
└── utils/
    ├── index.js            formatCurrency, formatLastSaved, etc.
    └── api.js              Typed fetch wrapper → Express
```

## Backend Architecture

```
backend/
├── server.js             Entry point, graceful shutdown
├── config/               DB + AI + email client init (lazy, singleton)
├── models/               Mongoose schemas with methods + statics
│   ├── Audit.js          publicId index, toPublic(), incrementViews()
│   └── Lead.js           Compound unique index (email + auditId)
├── controllers/          Business logic, one async fn per endpoint
├── routes/               Express routers with middleware chains
├── services/
│   ├── geminiService.js  AI summary with timeout + fallback
│   └── emailService.js   Resend HTML template (inline CSS)
├── middleware/
│   ├── validate.js       express-validator chains
│   ├── rateLimiter.js    100/15min global, 20/15min writes
│   └── errorHandler.js   Global error + 404 handlers
└── utils/
    ├── generatePublicId.js  nanoid(8) with DB collision check
    └── response.js          ok(), created(), badRequest(), etc.
```

## Data Flow: Audit Submission

```
1. User submits form
   └─► useAuditForm.formState (localStorage)

2. AuditPage.handleSubmit()
   └─► onGenerateReport(formState)

3. useAuditReport.generate(formState)
   ├─► runAudit(formState)         [sync, <5ms]
   ├─► setReport(result)           [React state → renders ResultsPage]
   ├─► navigate('/results')        [user sees results immediately]
   └─► api.saveAudit(result)       [async, non-blocking]
         └─► POST /api/audits
               ├─► generatePublicId()
               ├─► generateAuditSummary() [Gemini/Groq with fallback]
               ├─► Audit.save()
               └─► returns { publicId, aiSummary, ... }
                     └─► merged into report state

4. User enters email in LeadCaptureForm
   └─► api.saveLead({ email, auditPublicId })
         └─► POST /api/leads
               ├─► Lead.save()
               ├─► Audit.findByIdAndUpdate(linkedLeadId)
               └─► sendAuditConfirmationEmail() [fire-and-forget]
```

## Database Schema

### audits collection
```json
{
  "publicId": "xK3mN9pQ",       // short unique ID for sharing
  "context": {
    "teamSize": 10,
    "primaryUseCase": "coding",
    "teamBucket": "medium"
  },
  "tools": [{ "toolId": "cursor", "monthlySpend": 200, "seats": 10, "plan": "Pro" }],
  "findings": [{ "id": "...", "type": "redundancy", "severity": "high", ... }],
  "metrics": { "totalMonthlySpend": 200, "potentialMonthlySavings": 80, "wasteScore": 72 },
  "verdict": { "headline": "...", "mood": "good" },
  "aiSummary": { "text": "...", "isFallback": false, "model": "llama-3.1-8b-instant" },
  "leadId": ObjectId,
  "viewCount": 14,
  "createdAt": ISODate
}
```

### leads collection
```json
{
  "email": "user@company.com",
  "companyName": "Acme Corp",
  "role": "CTO",
  "teamSize": 10,
  "auditId": ObjectId,
  "auditPublicId": "xK3mN9pQ",
  "savingsSnapshot": { "monthly": 80, "annual": 960 },
  "emailStatus": { "sent": true, "sentAt": ISODate, "resendId": "re_xxx" },
  "source": "audit_results",
  "createdAt": ISODate
}
```

## Social Sharing Flow

```
User copies share link: /shared/xK3mN9pQ

Crawler (Twitter/LinkedIn/Slack):
  → fetches /og/audit/xK3mN9pQ from Express
  → Express reads Audit from MongoDB
  → Returns HTML with dynamic OG meta tags
  → Crawler renders rich preview

Real user:
  → Browser hits /shared/xK3mN9pQ
  → React Router serves SharedAuditPage
  → SharedAuditPage fetches GET /api/audits/xK3mN9pQ
  → Renders full public results (no email/company details shown)
```

## Environment Variables

### Frontend (.env)
| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend API base URL |
| `VITE_SITE_URL` | Canonical site URL for SEO |

### Backend (backend/.env)
| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (default 8080) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `GEMINI_API_KEY` or `GROQ_API_KEY` | AI summary generation |
| `RESEND_API_KEY` | Transactional email |
| `RESEND_FROM_EMAIL` | Verified sender address |
| `FRONTEND_URL` | For CORS allowlist and email links |
| `RATE_LIMIT_MAX` | Max requests per 15 min (default 100) |
