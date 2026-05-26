import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { TOOL_KNOWLEDGE } from '../../engine/auditKnowledge.js'
import { useCurrency } from '../../context/CurrencyContext'
import { useThemeStyles } from '../../hooks/useThemeStyles'
import FindingCard from './FindingCard'

export default function ToolResultCard({ toolEntry, findings }) {
  const [open, setOpen] = useState(true)
  const { format: formatCurrency } = useCurrency()
  const t = useThemeStyles()
  const spec = TOOL_KNOWLEDGE[toolEntry.toolId]
  if (!spec) return null

  const realFindings = findings.filter(f => f.type !== 'healthy')
  const isHealthy    = realFindings.length === 0
  const savings      = realFindings.reduce((s, f) => s + (f.monthlySavings || 0), 0)

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: t.bgCard, border: `1px solid ${t.border}` }}>

      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-6 py-5 text-left transition-colors"
        style={{ background: open ? t.bgCardDeep : 'transparent' }}>

        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold"
          style={{ background: `${spec.color}18`, color: spec.color, border: `1px solid ${spec.color}30` }}>
          {spec.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display font-bold text-base" style={{ color: t.textPrimary }}>{spec.name}</span>
            {isHealthy ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-xs"
                style={{ background: 'rgba(45,212,191,0.10)', border: '1px solid rgba(45,212,191,0.20)', color: '#2DD4BF' }}>
                ✓ Looks good
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-xs"
                style={{ background: 'rgba(240,136,62,0.10)', border: '1px solid rgba(240,136,62,0.20)', color: '#F0883E' }}>
                {realFindings.length} {realFindings.length === 1 ? 'finding' : 'findings'}
              </span>
            )}
          </div>
          <div className="font-mono text-xs mt-0.5" style={{ color: t.textFaint }}>
            {formatCurrency(toolEntry.monthlySpend)}/mo
            {toolEntry.seats > 1 && (
              <span className="ml-2">
                · {toolEntry.seats} seats · {formatCurrency(toolEntry.monthlySpend / toolEntry.seats)}/seat
              </span>
            )}
            {toolEntry.plan && <span className="ml-2">· {toolEntry.plan}</span>}
          </div>
        </div>

        {savings > 0 && (
          <div className="text-right flex-shrink-0">
            <div className="font-display font-bold text-base" style={{ color: '#58A6FF' }}>
              -{formatCurrency(savings)}/mo
            </div>
            <div className="font-mono text-xs" style={{ color: t.textFaint }}>potential</div>
          </div>
        )}

        <div style={{ color: t.textFaint, flexShrink: 0 }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {open && findings.length > 0 && (
        <div className="px-4 pb-4 space-y-3" style={{ borderTop: `1px solid ${t.border}` }}>
          <div className="pt-3 space-y-3">
            {findings.map((finding, i) => (
              <FindingCard key={finding.id} finding={finding} index={i} />
            ))}
          </div>
        </div>
      )}

      {open && findings.length === 0 && (
        <div className="px-6 pb-5" style={{ borderTop: `1px solid ${t.border}` }}>
          <p className="pt-4 font-body text-sm text-center" style={{ color: t.textFaint }}>
            No issues found for this tool.
          </p>
        </div>
      )}
    </div>
  )
}
