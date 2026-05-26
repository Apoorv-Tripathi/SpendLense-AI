import { useState } from 'react'
import { ChevronDown, Check, X, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCurrency } from '../context/CurrencyContext'
import { TOOL_KNOWLEDGE } from '../engine/auditKnowledge.js'
import SEOMeta from '../components/seo/SEOMeta'

const TOOLS = Object.values(TOOL_KNOWLEDGE)

const FEATURES = [
  { key: 'ide',         label: 'IDE Integration',          tools: { cursor: true,  'github-copilot': true,  windsurf: true,  claude: false, chatgpt: false, gemini: false, 'anthropic-api': false, 'openai-api': false } },
  { key: 'autocomplete',label: 'Code Autocomplete',         tools: { cursor: true,  'github-copilot': true,  windsurf: true,  claude: false, chatgpt: false, gemini: false, 'anthropic-api': false, 'openai-api': false } },
  { key: 'chat',        label: 'AI Chat Interface',         tools: { cursor: true,  'github-copilot': true,  windsurf: true,  claude: true,  chatgpt: true,  gemini: true,  'anthropic-api': false, 'openai-api': false } },
  { key: 'api',         label: 'Programmatic API Access',   tools: { cursor: false, 'github-copilot': false, windsurf: false, claude: false, chatgpt: false, gemini: true,  'anthropic-api': true,  'openai-api': true  } },
  { key: 'image',       label: 'Image Generation',          tools: { cursor: false, 'github-copilot': false, windsurf: false, claude: false, chatgpt: true,  gemini: true,  'anthropic-api': false, 'openai-api': true  } },
  { key: 'codebase',   label: 'Codebase Context',           tools: { cursor: true,  'github-copilot': true,  windsurf: true,  claude: false, chatgpt: false, gemini: false, 'anthropic-api': false, 'openai-api': false } },
  { key: 'free',        label: 'Free Tier Available',       tools: { cursor: true,  'github-copilot': false, windsurf: true,  claude: true,  chatgpt: true,  gemini: true,  'anthropic-api': true,  'openai-api': true  } },
  { key: 'team',        label: 'Team Management',           tools: { cursor: true,  'github-copilot': true,  windsurf: true,  claude: true,  chatgpt: true,  gemini: true,  'anthropic-api': false, 'openai-api': false } },
]

function ToolSelector({ value, onChange, exclude }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field appearance-none pr-8 font-display font-semibold cursor-pointer"
        style={{ colorScheme: 'dark' }}
      >
        {TOOLS.filter(t => t.id !== exclude).map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#484F58' }} />
    </div>
  )
}

export default function ComparisonPage() {
  const { format } = useCurrency()
  const [toolA, setToolA] = useState('cursor')
  const [toolB, setToolB] = useState('github-copilot')
  const [seats, setSeats] = useState(10)

  const specA = TOOL_KNOWLEDGE[toolA]
  const specB = TOOL_KNOWLEDGE[toolB]

  const cheapestPlanA = specA?.plans.find(p => p.pricePerSeat > 0)
  const cheapestPlanB = specB?.plans.find(p => p.pricePerSeat > 0)

  const costA = (cheapestPlanA?.pricePerSeat || 0) * seats
  const costB = (cheapestPlanB?.pricePerSeat || 0) * seats
  const cheaper = costA < costB ? toolA : costB < costA ? toolB : null
  const saving  = Math.abs(costA - costB)

  return (
    <>
      <SEOMeta
        title="Compare AI Tools"
        description="Side-by-side comparison of AI tools — features, pricing, and which is right for your team."
        canonical="/compare"
      />

      <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <span className="section-tag mb-5 inline-flex">Tool Comparison</span>
            <h1 className="font-display font-extrabold tracking-tight mt-4 mb-4"
              style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#E6EDF3' }}>
              Compare AI tools side-by-side
            </h1>
          </div>

          {/* Selectors + seats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 items-end">
            <div>
              <label className="label-field">Tool A</label>
              <ToolSelector value={toolA} onChange={setToolA} exclude={toolB} />
            </div>
            <div className="text-center">
              <div className="font-mono text-xs mb-2" style={{ color: '#484F58' }}>Team seats</div>
              <div className="flex items-center gap-3 justify-center">
                <button onClick={() => setSeats(s => Math.max(1, s - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all"
                  style={{ background: '#21262D', color: '#E6EDF3' }}>−</button>
                <span className="font-display font-bold text-xl w-10 text-center" style={{ color: '#58A6FF' }}>{seats}</span>
                <button onClick={() => setSeats(s => s + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all"
                  style={{ background: '#21262D', color: '#E6EDF3' }}>+</button>
              </div>
            </div>
            <div>
              <label className="label-field">Tool B</label>
              <ToolSelector value={toolB} onChange={setToolB} exclude={toolA} />
            </div>
          </div>

          {/* Price comparison banner */}
          {saving > 0 && cheaper && (
            <div className="rounded-2xl p-5 mb-8 flex items-center justify-between flex-wrap gap-4"
              style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.18)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: TOOL_KNOWLEDGE[cheaper].color + '20', color: TOOL_KNOWLEDGE[cheaper].color }}>
                  {TOOL_KNOWLEDGE[cheaper].icon}
                </div>
                <div>
                  <div className="font-display font-bold text-sm" style={{ color: '#E6EDF3' }}>
                    {TOOL_KNOWLEDGE[cheaper].name} is cheaper
                  </div>
                  <div className="font-body text-xs" style={{ color: '#8B949E' }}>
                    for {seats} seats at the base paid plan
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-xl" style={{ color: '#2DD4BF' }}>
                  {format(saving)}/mo saved
                </div>
                <div className="font-mono text-xs" style={{ color: '#484F58' }}>
                  {format(saving * 12)}/year
                </div>
              </div>
            </div>
          )}

          {/* Comparison table */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #21262D' }}>

            {/* Tool headers */}
            <div className="grid grid-cols-3" style={{ background: 'rgba(13,17,23,0.8)', borderBottom: '1px solid #21262D' }}>
              <div className="px-5 py-4 font-mono text-xs uppercase tracking-widest" style={{ color: '#484F58' }}>Feature</div>
              {[specA, specB].map((spec, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-2"
                  style={{ borderLeft: '1px solid #21262D' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                    style={{ background: spec.color + '18', color: spec.color }}>{spec.icon}</div>
                  <div>
                    <div className="font-display font-bold text-sm" style={{ color: '#E6EDF3' }}>{spec.name}</div>
                    <div className="font-mono text-xs" style={{ color: '#484F58' }}>
                      {cheapestPlanA && i === 0 ? `$${cheapestPlanA.pricePerSeat}/seat` : ''}
                      {cheapestPlanB && i === 1 ? `$${cheapestPlanB.pricePerSeat}/seat` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Monthly cost row */}
            <div className="grid grid-cols-3" style={{ borderBottom: '1px solid #21262D', background: 'rgba(88,166,255,0.03)' }}>
              <div className="px-5 py-4 font-body text-sm" style={{ color: '#8B949E' }}>Cost for {seats} seats</div>
              {[costA, costB].map((cost, i) => (
                <div key={i} className="px-5 py-4 font-display font-bold text-base"
                  style={{ borderLeft: '1px solid #21262D', color: cost === Math.min(costA, costB) ? '#2DD4BF' : '#E6EDF3' }}>
                  {format(cost)}/mo
                </div>
              ))}
            </div>

            {/* Feature rows */}
            {FEATURES.map((feat, idx) => {
              const valA = feat.tools[toolA]
              const valB = feat.tools[toolB]
              return (
                <div key={feat.key} className="grid grid-cols-3 transition-colors"
                  style={{
                    borderBottom: idx < FEATURES.length - 1 ? '1px solid #21262D' : 'none',
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  }}>
                  <div className="px-5 py-3.5 font-body text-sm" style={{ color: '#8B949E' }}>{feat.label}</div>
                  {[valA, valB].map((val, i) => (
                    <div key={i} className="px-5 py-3.5 flex items-center" style={{ borderLeft: '1px solid #21262D' }}>
                      {val
                        ? <Check size={16} style={{ color: '#2DD4BF' }} />
                        : <X     size={16} style={{ color: '#F85149', opacity: 0.5 }} />
                      }
                    </div>
                  ))}
                </div>
              )
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-10">
            <p className="font-body text-sm mb-4" style={{ color: '#8B949E' }}>
              Want a full cost analysis of your entire AI stack?
            </p>
            <Link to="/audit" className="btn-primary px-8 py-3 text-sm inline-flex">
              Run Free Audit <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
