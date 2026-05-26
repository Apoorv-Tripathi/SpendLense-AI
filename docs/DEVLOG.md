# SpendLens — Development Log

## Session 1 — Frontend Foundation

**Built:**
- React + Vite + Tailwind CSS project setup
- Folder structure: components/, engine/, hooks/, pages/, utils/
- Custom design system: Syne + DM Sans + JetBrains Mono fonts
- CSS layers: base, components (btn-primary, card-glass, input-field), utilities
- Responsive Navbar with mobile menu and scroll-aware styling
- Landing page: Hero, StatsBar, HowItWorks, Testimonials, CTA sections
- Floating animated tool badges in hero section
- React Router DOM v6 with Layout + Outlet pattern

**Key decisions:**
- Dark-first design with acid green (#C8F135) as the single accent
- Tailwind only — no component libraries that add bundle weight
- `font-display: swap` on Google Fonts to prevent layout shift

---

## Session 2 — Audit Form System

**Built:**
- `useAuditForm` hook with localStorage persistence (500ms debounce auto-save)
- Dynamic tool entry system: add, remove, duplicate, collapse cards
- 8 supported AI tools with brand colors, icons, and plan lists
- Per-tool fields: name, plan, monthly spend, seats
- Real-time cost-per-seat calculation displayed on each card
- Live spend summary sidebar with bar chart breakdown
- 3-step form completion progress indicator
- Responsive two-column layout (form + sidebar)

**Key decisions:**
- localStorage chosen over sessionStorage for the form — survives browser refresh
- Debounced save prevents excessive writes during typing
- `GripVertical` handle added visually (drag-to-reorder deferred to v2)

---

## Session 3 — Audit Engine

**Built:**
- `auditKnowledge.js` — pricing database for 8 tools, 30+ plan specs
- `auditHelpers.js` — 12 pure utility functions (plan resolution, cost math, etc.)
- `auditRules.js` — 12 independent audit rules
- `auditEngine.js` — orchestrator: normalise → per-tool rules → cross-tool rules → rank → metrics → verdict
- Results page: ResultsHero (waste score ring), FindingCard (expandable), ToolResultCard, GlobalFindingsPanel, SavingsBreakdown

**Rules implemented:**
1. Enterprise plan on small team → downgrade suggestion
2. Excess seats → trim suggestion
3. Overpayment vs list price → billing audit flag
4. Redundant coding assistants (Cursor + Copilot + Windsurf)
5. Redundant chat assistants (Claude + ChatGPT + Gemini)
6. API + chat tool overlap (low API spend)
7. API committed discount eligibility
8. Wrong tool for use case (coding team without coding assistant)
9. High cost per seat
10. Windsurf vs Cursor pricing comparison
11. Gemini Workspace add-on opportunity
12. Well-priced tool (positive reinforcement)

**Key decisions:**
- Rules return `null` to opt out — engine never crashes on rule failure (try/catch per rule)
- Savings capped at 80% of current spend — prevents absurd "save everything" outputs
- `suppressRedundantHealthyFindings()` — prevents "looks good" and "redundant" for same tool

---

## Session 4 — Backend

**Built:**
- Express server with helmet, cors, morgan, express-rate-limit
- MongoDB + Mongoose: Audit and Lead models with indexes and instance methods
- Two rate limiters: 100/15min global, 20/15min for write endpoints
- `generatePublicId()` — nanoid(8) with DB collision check
- Gemini/Groq AI summary service with 10s timeout + fallback
- Resend email service with professional dark-theme HTML template
- Lead controller: deduplication, fire-and-forget email, audit linking
- Graceful shutdown: SIGTERM → close HTTP → disconnect MongoDB

**Key decisions:**
- Fire-and-forget email: `sendAuditConfirmationEmail` not awaited — email failure never causes API 500
- AI summary races against 10s timeout — slow AI never blocks the user
- Compound unique index on `{email, auditId}` — prevents duplicate leads at DB level
- `toPublic()` method strips internal fields before API response

---

## Session 5 — Integration & Merge

**Built:**
- `src/utils/api.js` — typed fetch wrapper
- Updated `useAuditReport` — local engine first, backend save in background
- `LeadCaptureForm` — email gate on results page
- `ResultsCTA` variants: high savings (>$500), medium, low/healthy

**Key decisions:**
- Results page shows instantly from local engine (no network wait)
- Backend publicId merged into report state once received
- AI summary merged back into report state if backend returns one

---

## Session 6 — Production Hardening

**Built:**
- `SharedAuditPage` — public URL `/shared/:publicId`, loads from backend
- `SEOMeta` — react-helmet-async wrapper for OG + Twitter Card + canonical
- `/og/audit/:publicId` — Express route serving dynamic OG HTML for crawlers
- 65 Jest tests covering helpers, rules, metrics, verdicts, and E2E scenarios
- GitHub Actions CI: lint + test + build on every push
- Vite config: manual chunk splitting, code splitting via lazy imports
- 404 page, NotFound handler
- `ARCHITECTURE.md`, `TESTS.md`, `PRICING_DATA.md`, `PROMPTS.md`, `DEVLOG.md`, `REFLECTION.md`
- Deployment guides for Vercel (frontend) and Render (backend)

---

## Known Issues / Deferred

- Gemini free tier quota is very restrictive — Groq recommended instead
- Drag-to-reorder tool cards not implemented (visual handle exists)
- No admin dashboard for viewing leads/audits
- No PDF export (window.print() is the current workaround)
- Component tests (jsdom + @testing-library/react) deferred to v2
