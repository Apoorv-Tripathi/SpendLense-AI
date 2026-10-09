export const AI_TOOLS = [
  {
    id: 'cursor',
    name: 'Cursor',
    icon: '⌘',
    color: '#7C6FF7',
    plans: ['Free', 'Pro ($20/mo)', 'Business ($40/seat/mo)', 'Enterprise'],
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    icon: '◎',
    color: '#6E40C9',
    plans: ['Individual ($10/mo)', 'Business ($19/seat/mo)', 'Enterprise ($39/seat/mo)'],
  },
  {
    id: 'claude',
    name: 'Claude',
    icon: '◆',
    color: '#D4774A',
    plans: ['Free', 'Pro ($20/mo)', 'Team ($30/seat/mo)', 'Enterprise'],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: '◉',
    color: '#10A37F',
    plans: ['Free', 'Plus ($20/mo)', 'Team ($30/seat/mo)', 'Enterprise'],
  },
  {
    id: 'anthropic-api',
    name: 'Anthropic API',
    icon: '∷',
    color: '#D4774A',
    plans: ['Pay-as-you-go', 'Committed Usage'],
  },
  {
    id: 'openai-api',
    name: 'OpenAI API',
    icon: '⬡',
    color: '#10A37F',
    plans: ['Pay-as-you-go', 'Committed Usage'],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: '✦',
    color: '#4285F4',
    plans: ['Free', 'Advanced ($20/mo)', 'Workspace', 'API Pay-as-you-go'],
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    icon: '⟡',
    color: '#00C4FF',
    plans: ['Free', 'Pro ($15/mo)', 'Teams ($30/seat/mo)', 'Enterprise'],
  },
]

export const USE_CASES = [
  { value: 'coding', label: 'Coding & Development' },
  { value: 'writing', label: 'Writing & Content' },
  { value: 'research', label: 'Research & Analysis' },
  { value: 'data', label: 'Data & Analytics' },
  { value: 'mixed', label: 'Mixed / Multiple' },
]

export const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Log Your AI Tools',
    description: 'Add every AI subscription your team uses — from coding assistants to LLM APIs. Capture plans, seats, and monthly spend.',
    icon: 'ClipboardList',
  },
  {
    step: '02',
    title: 'Instant Cost Breakdown',
    description: 'See your total AI spend visualized by tool, team size, and cost-per-seat. Identify which tools are carrying their weight.',
    icon: 'BarChart3',
  },
  {
    step: '03',
    title: 'Get Optimization Insights',
    description: 'Receive actionable recommendations to cut waste, consolidate redundant tools, and negotiate better enterprise pricing.',
    icon: 'Zap',
  },
]

export const STATS = [
  { value: '8', label: 'Major AI platforms evaluated with tier pricing' },
  { value: '12', label: 'Deterministic audit rules & redundancy checks' },
  { value: '< 2 min', label: 'To enter tooling and generate your report' },
  { value: '100%', label: 'Client-side private evaluation by default' },
]

export const AUDIT_CAPABILITIES = [
  {
    category: 'Redundancy Elimination',
    title: 'Duplicate Assistants',
    description: 'Detects overlapping tools across engineers and knowledge workers — like paying simultaneously for Cursor and GitHub Copilot, or multiple team chat subscriptions.',
    badge: 'Cross-Tool Rule',
    tag: 'Redundancy',
  },
  {
    category: 'Seat Optimization',
    title: 'Excess & Idle Seats',
    description: 'Flags subscription seat counts that exceed active team size and identifies per-seat premiums above published list prices.',
    badge: 'Seat Efficiency',
    tag: 'Rightsizing',
  },
  {
    category: 'Plan Right-Sizing',
    title: 'Enterprise Tier Overkill',
    description: 'Surfaces small teams paying expensive enterprise minimums where standard Pro or Team tiers deliver identical daily capabilities.',
    badge: 'Contract Audit',
    tag: 'Tier Fit',
  },
]

// Backward-compatibility alias
export const TESTIMONIALS = AUDIT_CAPABILITIES
