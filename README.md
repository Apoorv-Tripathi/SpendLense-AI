# SpendLens — AI Spend Audit SaaS

**Live deployment:** [https://spend-lense-ai-phi.vercel.app](https://spend-lense-ai-phi.vercel.app)

SpendLens is a frontend prototype for helping engineering teams understand and review their spending on AI tools. It presents an audit experience alongside a landing page that explains the product, highlights its key benefits, and guides users toward getting started.

Built for the Credex internship assignment, the project demonstrates a React application with reusable components, client-side form state, and a responsive interface. Form data is managed with React state and saved in the browser using `localStorage`, so it can persist between visits on the same device.

## Features

### Landing Page

- **Hero section:** Introduces SpendLens with a prominent headline, animated floating AI tool badges, and trust indicators.
- **Stats bar:** Displays key figures to give visitors a quick overview of the product’s reach or impact.
- **How It Works:** Explains the product in three steps, using icon cards to make the process easy to scan.
- **Testimonials:** Presents three testimonial cards with an avatar and role to add customer perspective.
- **Call to action:** Encourages visitors to continue to the audit experience.

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
