import { useEffect, useRef, useState } from 'react'
import { TrendingUp, Users, Package, DollarSign, Activity } from 'lucide-react'
import { useCurrency } from '../../context/CurrencyContext'
import { useThemeStyles } from '../../hooks/useThemeStyles'
import { AI_TOOLS } from '../../constants'

function AnimatedValue({ value, prefix = '' }) {
  const [display, setDisplay] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const start = prev.current, end = value, diff = end - start
    if (diff === 0) return
    const duration = 400, startTime = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + diff * eased))
      if (progress < 1) requestAnimationFrame(tick)
      else prev.current = end
    }
    requestAnimationFrame(tick)
  }, [value])
  return <>{prefix}{display.toLocaleString()}</>
}

export default function SpendSummary({ tools, teamSize, totals }) {
  const { format: formatCurrency } = useCurrency()
  const t = useThemeStyles()
  const filledTools = tools.filter(tool => tool.toolName && tool.monthlySpend)
  const perEmployee = teamSize && totals.totalMonthlySpend > 0
    ? totals.totalMonthlySpend / parseInt(teamSize) : 0

  return (
    <div className="rounded-2xl overflow-hidden sticky top-24"
      style={{ background: t.bgCard, border: `1px solid ${t.border}` }}>

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${t.border}`, background: t.bgCardDeep }}>
        <div className="flex items-center gap-2">
          <Activity size={13} style={{ color: '#58A6FF' }} />
          <span className="font-display font-bold text-sm" style={{ color: t.textPrimary }}>Live Summary</span>
        </div>
        <span className="font-mono text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(88,166,255,0.08)', color: '#58A6FF', border: '1px solid rgba(88,166,255,0.15)' }}>
          Auto-updated
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { icon: DollarSign, label: 'Monthly',  formatted: formatCurrency(totals.totalMonthlySpend),      color: '#58A6FF' },
            { icon: TrendingUp, label: 'Annual',   formatted: formatCurrency(totals.totalMonthlySpend * 12), color: '#2DD4BF' },
            { icon: Package,    label: 'Tools',    formatted: String(totals.toolCount),                       color: '#8B72EF' },
            { icon: Users,      label: 'Seats',    formatted: String(totals.totalSeats || 0),                 color: '#F0883E' },
          ].map(({ icon: Icon, label, formatted, color }) => (
            <div key={label} className="rounded-xl p-3 transition-all"
              style={{ background: t.bgCardDeep, border: `1px solid ${t.border}` }}>
              <Icon size={12} style={{ color, marginBottom: '6px' }} />
              <div className="font-display font-bold text-lg" style={{ color, lineHeight: 1 }}>
                {formatted}
              </div>
              <div className="font-mono text-xs mt-0.5" style={{ color: t.textFaint }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Per employee */}
        {perEmployee > 0 && (
          <div className="rounded-xl p-4 relative overflow-hidden"
            style={{ background: 'rgba(88,166,255,0.06)', border: '1px solid rgba(88,166,255,0.15)' }}>
            <div className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(88,166,255,0.7)' }}>
              Per employee
            </div>
            <div className="font-display font-extrabold text-2xl" style={{ color: '#58A6FF' }}>
              {formatCurrency(perEmployee)}
              <span className="font-normal text-sm" style={{ color: 'rgba(88,166,255,0.5)' }}>/mo</span>
            </div>
            <div className="font-body text-xs mt-1" style={{ color: t.textFaint }}>
              Based on {teamSize} team members
            </div>
          </div>
        )}

        {/* Breakdown */}
        {filledTools.length > 0 ? (
          <div>
            <div className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: t.textFaint }}>
              Breakdown
            </div>
            <div className="space-y-3">
              {filledTools.map(tool => {
                const meta = AI_TOOLS.find(t => t.id === tool.toolName)
                const spend = parseFloat(tool.monthlySpend) || 0
                const pct = totals.totalMonthlySpend > 0 ? (spend / totals.totalMonthlySpend) * 100 : 0
                const color = meta?.color || '#58A6FF'
                return (
                  <div key={tool.id} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center text-xs flex-shrink-0"
                        style={{ background: `${color}15`, color }}>
                        {meta?.icon || '?'}
                      </div>
                      <span className="font-body text-xs flex-1 truncate" style={{ color: t.textMuted }}>
                        {meta?.name || tool.toolName}
                      </span>
                      <span className="font-mono text-xs flex-shrink-0" style={{ color }}>
                        {formatCurrency(spend)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden ml-7"
                      style={{ background: t.border }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 rounded-xl"
            style={{ background: t.bgCardDeep, border: `1px dashed ${t.border}` }}>
            <Package size={20} className="mx-auto mb-2" style={{ color: t.border }} />
            <p className="font-body text-xs" style={{ color: t.textFaint }}>
              Add tools above to see<br />your spend breakdown
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
