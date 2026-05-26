# SpendLens — Pricing Data Reference

**Last verified:** May 2025
**Source file:** `src/engine/auditKnowledge.js`

All prices are monthly USD per seat unless noted.

---

## Cursor

| Plan | Price/seat/mo | Min seats | Key features |
|------|--------------|-----------|-------------|
| Free | $0 | 1 | 200 completions/month |
| Pro | $20 | 1 | Unlimited completions, Claude & GPT-4 |
| Business | $40 | 2 | Admin controls, SSO, centralized billing |
| Enterprise | Custom | 50+ | Custom deployment, dedicated support |

**Source:** cursor.com/pricing

---

## GitHub Copilot

| Plan | Price/seat/mo | Min seats | Key features |
|------|--------------|-----------|-------------|
| Individual | $10 | 1 | Autocomplete, IDE chat |
| Business | $19 | 1 | Org policy controls, audit logs |
| Enterprise | $39 | 1 | Fine-tuning, codebase indexing |

**Source:** github.com/features/copilot

---

## Claude (Anthropic)

| Plan | Price/seat/mo | Min seats | Key features |
|------|--------------|-----------|-------------|
| Free | $0 | 1 | Limited messages, Claude 3.5 Haiku |
| Pro | $20 | 1 | 5× usage, Claude 3.5 Sonnet & Opus |
| Team | $30 | 1 | Centralized billing, higher rate limits |
| Enterprise | Custom | 1+ | Custom context, SSO, admin controls |

**Source:** anthropic.com/claude

---

## ChatGPT (OpenAI)

| Plan | Price/seat/mo | Min seats | Key features |
|------|--------------|-----------|-------------|
| Free | $0 | 1 | GPT-4o mini, limited GPT-4o |
| Plus | $20 | 1 | GPT-4o, DALL·E 3, code interpreter |
| Team | $30 | 2 | Admin console, no data training |
| Enterprise | Custom | 1+ | Unlimited GPT-4, SSO, advanced admin |

**Source:** openai.com/chatgpt/pricing

---

## Anthropic API

| Plan | Price | Notes |
|------|-------|-------|
| Pay-as-you-go | Per token | No commitment required |
| Committed Usage | -20–30% | Volume discount, priority rate limits |

**Key thresholds:**
- **Low usage threshold:** $50/mo — below this, Claude Pro may be sufficient
- **Committed usage threshold:** $5,000/mo — above this, negotiate committed pricing

**Source:** anthropic.com/api

---

## OpenAI API

| Plan | Price | Notes |
|------|-------|-------|
| Pay-as-you-go | Per token | Per-model pricing varies |
| Committed Usage | -20% | Volume discount |

**Source:** openai.com/pricing

---

## Gemini (Google)

| Plan | Price/seat/mo | Min seats | Key features |
|------|--------------|-----------|-------------|
| Free | $0 | 1 | Gemini 1.5 Flash |
| Advanced | $20 | 1 | Gemini Ultra, Google One 2TB |
| Workspace Add-on | $30 | 1 | Gemini in Docs/Sheets/Slides/Meet |
| API Pay-as-you-go | Per token | 1 | All Gemini models |

**Source:** gemini.google.com, workspace.google.com/products/gemini

---

## Windsurf (Codeium)

| Plan | Price/seat/mo | Min seats | Key features |
|------|--------------|-----------|-------------|
| Free | $0 | 1 | 5 user prompt credits/day |
| Pro | $15 | 1 | Unlimited completions, all AI models |
| Teams | $30 | 2 | Team management, centralized billing |
| Enterprise | Custom | 25+ | Custom deployment, SSO |

**Source:** windsurf.com/pricing

---

## Pricing Update Policy

When AI tool pricing changes:
1. Update `src/engine/auditKnowledge.js` — the single source of truth
2. Update this document with new prices and verification date
3. Re-run the test suite — `npm test`
4. Tests that check exact pricing will catch regressions

**Do not** hardcode prices anywhere else in the codebase.
