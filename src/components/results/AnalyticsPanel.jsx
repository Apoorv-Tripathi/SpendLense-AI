import { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Users, Zap, Target, Award } from 'lucide-react'
import { useCurrency } from '../../context/CurrencyContext'
import { useThemeStyles } from '../../hooks/useThemeStyles'
import { TOOL_KNOWLEDGE } from '../../engine/auditKnowledge.js'

function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1200 }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const tick = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setDisplay(Math.round(eased * value))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [value, duration])
  return <span ref={ref}>{prefix}{display.toLocaleString()}{suffix}</span>
}

function SimpleBar({ value, max, color, label, subLabel, t }) {
  const [animated, setAnimated] = useState(false)
  const ref = useRef(null)
  const pct = Math.min((value / max) * 100, 100)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setTimeout(() => setAnimated(true), 200)
    }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-body text-xs" style={{ color: t.textMuted }}>{label}</span>
        <span className="font-mono text-xs font-semibold" style={{ color }}>{subLabel}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: t.border }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: animated ? `${pct}%` : '0%', background: `linear-gradient(90deg, ${color}80, ${color})` }} />
      </div>
    </div>
  )
}

function ToolEfficiencyCard({ tool, findings, t }) {
  const { format: formatCurrency } = useCurrency()
  const spec = TOOL_KNOWLEDGE[tool.toolId]
  if (!spec) return null
  const toolFindings = findings.filter(f =>
    f.toolId === tool.toolId || (f.affectedTools && f.affectedTools.includes(tool.toolId))
  ).filter(f => f.type !== 'healthy')
  const penalty = toolFindings.reduce((sum, f) =>
    sum + (f.severity === 'critical' ? 35 : f.severity === 'high' ? 25 : f.severity === 'medium' ? 15 : 8), 0)
  const score = Math.max(0, 100 - penalty)
  const scoreColor = score >= 75 ? '#2DD4BF' : score >= 50 ? '#D29922' : '#F85149'
  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: `1px solid ${t.border}` }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
        style={{ background: `${spec.color}15`, color: spec.color, border: `1px solid ${spec.color}25` }}>
        {spec.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-display font-semibold text-xs" style={{ color: t.textPrimary }}>{spec.name}</span>
          <span className="font-mono text-xs font-bold" style={{ color: scoreColor }}>{score}/100</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: t.border }}>
          <div className="h-full rounded-full" style={{ width: `${score}%`, background: scoreColor }} />
        </div>
        <div className="font-mono text-xs mt-1" style={{ color: t.textFaint }}>
          {formatCurrency(tool.monthlySpend)}/mo · {toolFindings.length === 0 ? 'No issues' : `${toolFindings.length} issue${toolFindings.length > 1 ? 's' : ''}`}
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPanel({ metrics, context, findings, tools }) {
  const { format: formatCurrency } = useCurrency()
  const t = useThemeStyles()

  const INDUSTRY_AVG_PER_EMPLOYEE = 45
  const INDUSTRY_WASTE_PCT = 18
  const yourWastePct = metrics.totalMonthlySpend > 0
    ? Math.round((metrics.potentialMonthlySavings / metrics.totalMonthlySpend) * 100) : 0
  const activeTools = tools.filter(t => t.monthlySpend > 0 && TOOL_KNOWLEDGE[t.toolId])

  const insights = []
  if (metrics.perEmployeeCost > 80) {
    insights.push({ icon: AlertTriangle, color: '#F0883E', text: `At ${formatCurrency(metrics.perEmployeeCost)}/employee/mo, your AI spend exceeds the ${formatCurrency(80)} threshold where ROI typically needs justification.` })
  }
  if (yourWastePct > 20) {
    insights.push({ icon: TrendingDown, color: '#F85149', text: `${yourWastePct}% of your AI budget is recoverable — more than double the ${INDUSTRY_WASTE_PCT}% industry average waste rate.` })
  }
  if (metrics.wasteScore >= 80 && insights.length === 0) {
    insights.push({ icon: Award, color: '#2DD4BF', text: `Waste score of ${metrics.wasteScore}/100 puts you in the top 20% of audited teams. Strong budget discipline.` })
  }
  if (metrics.potentialAnnualSavings > 1000 && insights.length < 2) {
    insights.push({ icon: Target, color: '#58A6FF', text: `${formatCurrency(metrics.potentialAnnualSavings)}/year in savings ≈ ${Math.round(metrics.potentialAnnualSavings / 5000)} engineering days of productivity recovered.` })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #58A6FF, #2DD4BF)' }} />
        <h2 className="font-display font-bold text-base" style={{ color: t.textPrimary }}>Analytics & Insights</h2>
      </div>

      {/* 4 metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Monthly Spend', value: metrics.totalMonthlySpend,              formatted: formatCurrency(metrics.totalMonthlySpend), color: '#58A6FF',  icon: TrendingUp,   sub: 'total AI budget' },
          { label: 'Per Employee',  value: Math.round(metrics.perEmployeeCost),    formatted: formatCurrency(metrics.perEmployeeCost) + '/mo', color: metrics.perEmployeeCost > 80 ? '#F0883E' : '#2DD4BF', icon: Users, sub: `${context.teamSize} members` },
          { label: 'Waste Rate',    value: yourWastePct,                            formatted: `${yourWastePct}%`, color: yourWastePct > 20 ? '#F85149' : '#2DD4BF', icon: AlertTriangle, sub: `${INDUSTRY_WASTE_PCT}% industry avg` },
          { label: 'Health Score',  value: metrics.wasteScore,                     formatted: `${metrics.wasteScore}/100`, color: metrics.wasteScore >= 75 ? '#2DD4BF' : metrics.wasteScore >= 50 ? '#D29922' : '#F85149', icon: CheckCircle, sub: metrics.wasteScore >= 75 ? 'above average' : 'needs attention' },
        ].map(({ label, value, formatted, color, icon: Icon, sub }) => (
          <div key={label} className="rounded-2xl p-4 transition-all hover:-translate-y-0.5"
            style={{ background: t.bgCard, border: `1px solid ${color}18` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-body text-xs" style={{ color: t.textFaint }}>{label}</span>
              <Icon size={12} style={{ color }} />
            </div>
            <div className="font-display font-extrabold text-xl mb-0.5"
              style={{ color, lineHeight: 1, fontSize: 'clamp(1rem, 2.5vw, 1.3rem)' }}>
              {formatted}
            </div>
            <div className="font-mono text-xs" style={{ color: t.textFaint }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Benchmarks + Tool scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl p-5 space-y-4" style={{ background: t.bgCard, border: `1px solid ${t.border}` }}>
          <div className="font-mono text-xs uppercase tracking-widest" style={{ color: t.textFaint }}>vs Industry Average</div>
          <SimpleBar label="Cost per employee / month" subLabel={`You: ${formatCurrency(metrics.perEmployeeCost)} · Avg: ${formatCurrency(45)}`}
            value={metrics.perEmployeeCost} max={Math.max(metrics.perEmployeeCost * 1.2, 100)}
            color={metrics.perEmployeeCost > 80 ? '#F0883E' : '#2DD4BF'} t={t} />
          <SimpleBar label="Waste rate" subLabel={`You: ${yourWastePct}% · Avg: ${INDUSTRY_WASTE_PCT}%`}
            value={yourWastePct} max={Math.max(yourWastePct * 1.2, 40)}
            color={yourWastePct > 20 ? '#F85149' : '#2DD4BF'} t={t} />
        </div>

        {activeTools.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: t.bgCard, border: `1px solid ${t.border}` }}>
            <div className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: t.textFaint }}>Tool Efficiency</div>
            {activeTools.slice(0, 4).map(tool => (
              <ToolEfficiencyCard key={tool.id || tool.toolId} tool={tool} findings={findings} t={t} />
            ))}
          </div>
        )}
      </div>

      {/* Smart insights */}
      {insights.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(88,166,255,0.15)' }}>
          <div className="px-4 py-2.5 flex items-center gap-2"
            style={{ background: 'rgba(88,166,255,0.05)', borderBottom: '1px solid rgba(88,166,255,0.10)' }}>
            <Zap size={12} style={{ color: '#58A6FF' }} />
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: '#58A6FF' }}>Smart Insights</span>
          </div>
          {insights.slice(0, 2).map((insight, i) => {
            const Icon = insight.icon
            return (
              <div key={i} className="flex items-start gap-3 px-4 py-3"
                style={{ borderTop: i > 0 ? `1px solid ${t.border}` : 'none', background: t.bgCardDeep }}>
                <Icon size={13} style={{ color: insight.color, flexShrink: 0, marginTop: '1px' }} />
                <p className="font-body text-xs leading-relaxed" style={{ color: t.textMuted }}>{insight.text}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* 3-year projection */}
      {metrics.potentialAnnualSavings > 500 && (
        <div className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: t.bgHighlight, border: '1px solid rgba(88,166,255,0.15)' }}>
          <div className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: '#58A6FF' }}>3-Year Savings Projection</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Year 1', mult: 1, color: '#58A6FF' },
              { label: 'Year 2', mult: 2, color: '#7BC8FF' },
              { label: 'Year 3', mult: 3, color: '#2DD4BF' },
            ].map(({ label, mult, color }) => (
              <div key={label} className="text-center p-3 rounded-xl" style={{ background: t.bgCardDeep }}>
                <div className="font-display font-extrabold mb-0.5"
                  style={{ color, fontSize: 'clamp(0.9rem, 2vw, 1.15rem)' }}>
                  {formatCurrency(Math.round(metrics.potentialAnnualSavings * mult))}
                </div>
                <div className="font-mono text-xs" style={{ color: t.textFaint }}>{label}</div>
              </div>
            ))}
          </div>
          <p className="font-body text-xs mt-3" style={{ color: t.textFaint }}>Assumes current savings rate maintained.</p>
        </div>
      )}
    </div>
  )
}
