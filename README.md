# SpendLens — Full-Stack AI Tool Spend Audit SaaS

> **Live Deployment:** [https://spend-lense-ai-phi.vercel.app](https://spend-lense-ai-phi.vercel.app)  
> **Status:** Production-Ready · 65/65 Tests Passing · Local-First Architecture

SpendLens is a production-grade full-stack platform designed to audit, benchmark, and optimize AI subscription spending for engineering and product teams. It combines an instant, client-side deterministic rule engine with an additive Node.js/Express backend that delivers executive AI summaries via Google Gemini and Groq.

---

## Architecture & System Design

SpendLens follows a **Local-First, Privacy-Conscious Architecture** with an additive companion microservice:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BROWSER (React 18 + Vite)                       │
│                                                                        │
│  LandingPage ──► AuditPage ──► ResultsPage ──► SharedAuditPage         │
│                     │                │                                 │
│              useAuditForm     useAuditReport                           │
│                     │                │                                 │
│               localStorage     sessionStorage                          │
│                                      │                                 │
│                         auditEngine.js (Local, <5ms)                   │
│                         - 12 deterministic rules                       │
│                         - Deduplication & ranking                      │
│                         - Metric rollups & waste scores                │
└──────────────────────────────────────┬─────────────────────────────────┘
                                       │ Non-blocking background sync
                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        COMPANION BACKEND (Express)                     │
│                                                                        │
│  POST /api/audits        ──► Audit persistence (MongoDB or In-Memory)  │
│  POST /api/audits/summary──► Live Executive Summary Generator          │
│  GET  /api/audits/:id    ──► Fetch shared audit report                 │
│  POST /api/leads         ──► Lead capture & confirmation               │
│                                      │                                 │
│         ┌────────────────────────────┼────────────────────────────┐    │
│         ▼                            ▼                            ▼    │
│   Google Gemini API             Groq AI (LLaMA 3.3)         Resend Email│
│   (Primary LLM)                 (Fast Fallback)             (Optional) │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Architectural Principles
1. **Financial Privacy & Zero-Latency Evaluation:** The 12-rule audit engine runs client-side in pure JavaScript with zero network dependencies. Sensitive tool costs and seat counts are computed instantly without transmitting numbers unless the user explicitly saves or shares the audit.
2. **Resilient Multi-Provider AI Pipeline:** Executive summaries are generated through a tiered cascade: **Google Gemini (`gemini-2.5-flash`)** $\rightarrow$ **Groq (`llama-3.3-70b-versatile`)** $\rightarrow$ **Deterministic Heuristic Engine**. If API keys are unconfigured or external networks time out, the application gracefully provides a rich, grounded summary calculated directly from the user's data.
3. **Zero-Config Operation:** The backend automatically defaults to an in-memory store if `MONGODB_URI` is omitted, allowing the full stack to run offline or in sandboxes without database provisioning.

---

## Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | React 18 + Vite | Chunk-split production bundle, fast HMR |
| **Routing** | React Router DOM v6 | Lazy-loaded routes, dynamic `:publicId` sharing |
| **Styling & UI** | Tailwind CSS v3 + Lucide Icons | Dark ink theme (`#0D1117`), Syne / DM Sans typography |
| **Audit Engine** | Pure JavaScript (ESM) | 12 financial & licensing rules, <5ms evaluation |
| **State & Persistence** | Custom React Hooks | `localStorage` (form auto-save) + `sessionStorage` (cached report) |
| **Backend API** | Node.js + Express (ESM) | RESTful API, Helmet security headers, CORS, rate limiting |
| **Database** | MongoDB Atlas / In-Memory Store | Mongoose ODM with automatic zero-config memory fallback |
| **AI Generation** | `@google/genai` & `groq-sdk` | Multi-provider executive summary with timeout protection |
| **Export Engine** | Custom Canvas / PDF Builder | High-resolution branded audit report PDF generation |
| **Testing** | Jest + Babel | 65 passing unit tests covering all audit rules & edge cases |

---

## Repository Structure

```
.
├── backend/                  # Dedicated Express REST API & AI Service
│   ├── config/               # Database, Gemini, Groq & Resend configs
│   ├── controllers/          # Audit, Lead & Health controllers
│   ├── middleware/           # Rate limiting, validation & error handlers
│   ├── models/               # MongoDB schema & In-memory store fallback
│   ├── routes/               # /api/audits, /api/health, /api/leads, /og
│   ├── services/             # Gemini/Groq LLM generator & Resend emails
│   ├── utils/                # Public ID generation & response formatters
│   ├── package.json          # Backend dependencies (@google/genai, groq-sdk, etc.)
│   └── server.js             # Express server entry point (port 8080)
├── src/                      # Client Application & Audit Engine
│   ├── components/
│   │   ├── form/             # Audit form cards, live spend sidebar, progress bar
│   │   ├── landing/          # Hero section, stats bar, capabilities, how-it-works, CTA
│   │   ├── layout/           # App layout, responsive Navbar, Footer
│   │   ├── results/          # AI summary card, tool cards, savings breakdown, PDF CTA
│   │   └── ui/               # Reusable primitives (Input, Select, Badges)
│   ├── constants/            # Supported tools, tier pricing specs, audit rules metadata
│   ├── context/              # Currency context (multi-currency USD/EUR/GBP/INR)
│   ├── engine/               # Pure JS Audit Engine & Rule Registry
│   │   ├── auditEngine.js    # runAudit() orchestrator, deduplication, scoring
│   │   ├── auditHelpers.js   # Bucket calculations, plan resolution, severity scales
│   │   ├── auditKnowledge.js # Pricing knowledge base for 8 major AI platforms
│   │   └── auditRules.js     # 12 independent, testable audit rule functions
│   ├── hooks/                # useAuditForm, useAuditReport, useThemeStyles
│   ├── pages/                # LandingPage, AuditPage, ResultsPage, SharedAuditPage,
│   │                         # ROICalculatorPage, ComparisonPage, BenchmarksPage
│   ├── utils/                # api client, pdfExport, formatCurrency, debounce
│   └── App.jsx               # Route declarations & provider wrapper
├── docs/                     # Architecture, economics, metrics, and developer logs
├── __tests__/                # Jest test suite (65 passing tests)
├── package.json              # Root scripts and frontend dependencies
├── tailwind.config.js        # Design tokens, custom gradients, and typography
└── vite.config.js            # Vite build configuration with manual chunking
```

---

## Features

### 1. Interactive AI Spend Audit (`/audit`)
* **8 Pre-configured AI Platforms:** Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, and Windsurf.
* **Custom Tool Inputs:** Add arbitrary tools with custom plans, user counts, and monthly billing amounts.
* **Live Sidebar Calculations:** Real-time feedback showing total monthly spend, annual spend, per-employee cost, and spend breakdown bar charts.
* **Non-destructive Auto-save:** Debounced browser persistence saves entries as you type so returning from results never wipes data.

### 2. Comprehensive Audit Report (`/results`)
* **Executive AI Summary Card:** Live AI generation with status badges, regenerate controls, expandable text, and honest heuristic disclosure.
* **Cross-Tool Redundancy Panel:** Highlights overlapping coding assistants or chat tools across developers.
* **Per-Tool Inefficiency Cards:** Displays exact plan right-sizing opportunities, idle seat counts, and overpayment deltas.
* **Savings Breakdown & Waste Score:** Calculates potential monthly and annual savings alongside a 0–100 waste health score.
* **One-Click PDF Export:** Downloads an executive-ready, branded PDF summary.

### 3. Shareable Reports (`/shared/:publicId`)
* Share audit findings with teammates and leadership via permanent public IDs.
* Server-rendered Open Graph cards for Twitter/LinkedIn previews.

### 4. Decision Tools & Calculators
* **Tool Comparison Matrix (`/compare`):** Side-by-side feature and pricing arbitrage between any two AI platforms for arbitrary seat counts.
* **AI ROI Calculator (`/calculator`):** Computes break-even minutes saved per developer, annual productivity return, and net dollar value.
* **Industry Benchmarks (`/benchmarks`):** Segmented spend and waste benchmarks filtered by team size and primary use case.

---

## The 12 Deterministic Audit Rules

SpendLens evaluates every audit submission against 12 battle-tested financial and licensing rules:

1. **`ruleRedundantCodingAssistants`**: Flags simultaneous enterprise spending on Cursor, GitHub Copilot, and Windsurf.
2. **`ruleRedundantChatAssistants`**: Identifies overlapping team subscriptions across ChatGPT and Claude.
3. **`ruleExcessSeats`**: Detects tool seat allocations that exceed the active team size.
4. **`ruleEnterprisePlanOnSmallTeam`**: Surfaces small teams paying enterprise minimums where standard Pro tiers suffice.
5. **`ruleOverpaymentVsListPrice`**: Flags billing rates exceeding public retail list pricing by >20%.
6. **`ruleApiAndChatOverlap`**: Flags high per-seat chat subscriptions when direct API infrastructure is already active.
7. **`ruleApiCommittedDiscount`**: Recommends committed-use discounts for high-volume API spending.
8. **`ruleWrongToolForUseCase`**: Warns when coding teams lack specialized developer IDE tooling.
9. **`ruleHighCostPerSeat`**: Identifies excessive per-seat unit economics (>=$50/seat/mo).
10. **`ruleWindsurfVsCursor`**: Highlights pricing arbitrage between competitive IDE assistants.
11. **`ruleGeminiWorkspaceAddOn`**: Recommends Google Workspace add-on pricing over standalone subscriptions.
12. **`ruleWellPricedTool`**: Confirms and validates cost-effective tool configurations.

---

## Getting Started

### Prerequisites
* Node.js v18.0.0 or higher
* npm v9.0.0 or higher

### Installation

```bash
# 1. Clone repository
git clone https://github.com/apoorvtripathi/SpendLens.git
cd SpendLens

# 2. Install frontend and root dependencies
npm install

# 3. Install backend dependencies
cd backend && npm install && cd ..
```

### Running Locally

You can run both services simultaneously:

**Terminal 1 — Backend API (port 8080):**
```bash
npm run server
# or: cd backend && npm run dev
```

**Terminal 2 — Frontend Application (port 5173):**
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables

SpendLens functions in **zero-config mode** by default (in-memory storage and deterministic heuristics are active out of the box). To enable live generative AI models or cloud storage, create a `backend/.env` file:

```bash
# Server Port & Environment
PORT=8080
NODE_ENV=development

# AI Providers (At least one recommended for live LLM executive summaries)
GEMINI_API_KEY=your_gemini_api_key_here      # https://aistudio.google.com/app/apikey
GEMINI_MODEL=gemini-2.5-flash

GROQ_API_KEY=your_groq_api_key_here          # https://console.groq.com/keys
GROQ_MODEL=llama-3.3-70b-versatile

# Cloud Database (Optional — defaults to in-memory store if unset)
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/spendlens?retryWrites=true&w=majority

# Transactional Email Reports (Optional)
# RESEND_API_KEY=your_resend_api_key_here    # https://resend.com/api-keys
# RESEND_FROM_EMAIL=SpendLens <hello@yourdomain.com>

# Frontend Origin (for CORS and shareable links)
FRONTEND_URL=http://localhost:5173
```

---

## Verification & Testing

### Running Unit Tests
```bash
npm test
```
Runs the 65 unit test suites in `__tests__/auditEngine.test.js` validating all 12 rules, metric calculations, edge cases, and deduplication logic.

### Running Production Build
```bash
npm run build
```
Executes Vite production compilation and generates optimized, chunk-split assets in `dist/` in under 1.5s.

---

## License

MIT License. Designed and engineered by **Apoorv Tripathi**.
