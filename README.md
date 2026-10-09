# SpendLens — AI Spend Audit

**Live deployment:** [https://spend-lense-ai-phi.vercel.app](https://spend-lense-ai-phi.vercel.app)

SpendLens helps engineering teams review their spending on AI tools. The application provides a place to record tool usage and costs, then view a summary of the information entered. Audit form data is stored in the browser with `localStorage`, so it can persist between visits on the same device.

The project includes a landing page and an audit page. The landing page explains the service and its workflow; the audit page contains the form interface and spending summary.

### Audit Experience

The project includes an audit page and reusable form components for collecting and presenting AI tool spending information. The form’s state is handled by a custom hook, with `localStorage` used to retain data in the browser.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + Vite |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS v3 |
| Icons | Lucide React |
| State | useState + localStorage |
| Backend | _Coming soon (Express + MongoDB)_ |

---

## Folder Structure

```
src/
├── components/
│   ├── ui/               # Reusable primitives
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Badge.jsx
│   │   └── Tooltip.jsx
│   ├── layout/           # App shell
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── landing/          # Landing page sections
│   │   ├── HeroSection.jsx
│   │   ├── StatsBar.jsx
│   │   ├── HowItWorksSection.jsx
│   │   ├── TestimonialsSection.jsx
│   │   └── CTASection.jsx
│   └── form/             # Audit form components
│       ├── ToolCard.jsx
│       ├── SpendSummary.jsx
│       └── FormProgress.jsx
├── pages/
│   ├── LandingPage.jsx
│   └── AuditPage.jsx
├── hooks/
│   └── useAuditForm.js   # Form state + localStorage
├── constants/
│   └── index.js          # Tools, use cases, copy
├── utils/
│   └── index.js          # formatCurrency, debounce, etc.
└── styles/
    └── globals.css       # Tailwind + custom CSS layers
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## Features

### Landing Page
- **Hero section** — Bold headline, floating tool badges with animations, trust indicators
- **Stats bar** — Key social proof numbers
- **How It Works** — 3-step explainer with icon cards
- **Testimonials** — 3 cards with avatar + role
- **CTA section** — Conversion-focused bottom block

### Audit Form (`/audit`)
- **Dynamic tool entries** — Add/remove/duplicate AI tools
- **8 supported tools** — Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, Windsurf
- **Per-tool fields** — Name, plan, monthly spend, seats; cost-per-seat auto-calculated
- **Team context** — Team size + primary use case
- **Live sidebar** — Real-time spend totals, per-employee cost, breakdown bar chart
- **Progress tracker** — 3-step completion indicator
- **localStorage persistence** — Auto-saves with 500ms debounce; survives page refresh
- **Collapsible cards** — Minimize filled cards to reduce clutter
- **Form reset** — With confirmation guard
- **Success state** — Summary screen after submission

### Design System
- **Fonts** — Syne (display/headings) + DM Sans (body) + JetBrains Mono (numbers)
- **Colors** — Dark ink background (#0A0A0F) + acid green (#C8F135) accent
- **Components** — `.btn-primary`, `.btn-outline`, `.card-glass`, `.input-field`, `.section-tag`, `.gradient-text`
- **Animations** — fade-up, fade-in, float, pulse-acid, shimmer

---

## Planned (Backend Phase)

- [ ] Express.js REST API
- [ ] MongoDB + Mongoose data models
- [ ] JWT authentication
- [ ] Audit report generation
- [ ] PDF export
- [ ] Team collaboration
- [ ] AI-powered optimization recommendations

---

## Design Decisions

- **No auth required** for MVP — lower friction, captures more leads
- **localStorage** for now — zero-dependency persistence, trivially swapped for API calls
- **Debounced auto-save** (500ms) — prevents excessive writes
- **Cost-per-seat calculation** lives in the card component — easy to move to a utility when backend is ready
- **Collapsible tool cards** — UX improvement for users with many tools
