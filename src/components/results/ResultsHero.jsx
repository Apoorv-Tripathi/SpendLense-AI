import { useEffect, useState } from 'react'
import { TrendingDown, Clock, Layers, CheckCircle, AlertCircle, AlertTriangle, XCircle, Share2, Check } from 'lucide-react'
import { useCurrency } from '../../context/CurrencyContext'
import SpendHealthGauge from './SpendHealthGauge'

const MOOD = {
  excellent: { icon: CheckCircle,   color: '#2DD4BF', label: 'Optimised',      bg: 'rgba(45,212,191,0.08)',  border: 'rgba(45,212,191,0.20)' },
  good:      { icon: AlertCircle,   color: '#58A6FF', label: 'Savings Found',  bg: 'rgba(88,166,255,0.08)',  border: 'rgba(88,166,255,0.20)' },
  concerning:{ icon: AlertTriangle, color: '#F0883E', label: 'Action Needed',  bg: 'rgba(240,136,62,0.08)',  border: 'rgba(240,136,62,0.20)' },
  critical:  { icon: XCircle,       color: '#F85149', label: 'Critical Waste', bg: 'rgba(248,81,73,0.08)',   border: 'rgba(248,81,73,0.20)' },
}

export default function ResultsHero({ metrics, verdict, context, generatedAt }) {
  const { format: formatCurrency } = useCurrency()
  const [copied, setCopied] = useState(false)
  const mood     = MOOD[verdict.mood] ?? MOOD.good
  const MoodIcon = mood.icon

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { window.prompt('Copy link:', window.location.href) }
  }

  const stats = [
    { icon: TrendingDown, label: 'Annual savings potential', value: formatCurrency(metrics.potentialAnnualSavings), highlight: true, sub: `${(metrics.savingsPercent ?? 0).toFixed(0)}% of current spend` },
    { icon: Layers,       label: 'Current monthly spend',   value: formatCurrency(metrics.totalMonthlySpend),      sub: `${metrics.toolCount} tool${metrics.toolCount !== 1 ? 's' : ''} audited` },
    { icon: Clock,        label: 'Per employee / month',    value: formatCurrency(metrics.perEmployeeCost),         sub: `Team of ${context.teamSize}` },
  ]

  return (
    <section className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">

      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute rounded-full animate-float"
            style={{
              width: `${150 + i * 60}px`, height: `${150 + i * 60}px`,
              left: `${i * 22}%`, top: `${10 + (i % 3) * 25}%`,
              background: `radial-gradient(circle, ${mood.color}05 0%, transparent 70%)`,
              animationDelay: `${i * 0.9}s`, animationDuration: `${6 + i * 1.2}s`,
            }} />
        ))}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px]"
          style={{ background: `radial-gradient(ellipse at top, ${mood.color}06 0%, transparent 60%)` }} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Badge + share */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-medium animate-fade-in"
            style={{ background: mood.bg, border: `1px solid ${mood.border}`, color: mood.color }}>
            <MoodIcon size={12} />
            Audit Report · {mood.label}
          </span>
          <button onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-body transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #21262D', color: '#8B949E' }}>
            {copied ? <Check size={12} style={{ color: '#2DD4BF' }} /> : <Share2 size={12} />}
            {copied ? 'Copied!' : 'Share report'}
          </button>
        </div>

        {/* Gauge + headline side by side */}
        <div className="flex flex-col lg:flex-row items-center gap-10 mb-10">
          <div className="flex-shrink-0 animate-fade-up">
            <SpendHealthGauge score={metrics.wasteScore} mood={verdict.mood} />
            <p className="text-center font-mono text-xs mt-2" style={{ color: '#484F58' }}>Spend Health Score</p>
          </div>

          <div className="flex-1 text-center lg:text-left animate-fade-up animate-delay-100">
            <h1 className="font-display font-extrabold tracking-tight mb-4"
              style={{ fontSize: 'clamp(1.5rem, 4vw, 2.8rem)', color: '#E6EDF3', lineHeight: '1.12', wordBreak: 'break-word' }}>
              {verdict.headline}
            </h1>
            <p className="font-body leading-relaxed" style={{ color: '#8B949E', fontSize: 'clamp(0.875rem, 1.8vw, 1rem)' }}>
              {verdict.subtext}
            </p>

            {/* Severity pills */}
            {metrics.totalFindings > 0 && (
              <div className="flex flex-wrap gap-2 mt-5 justify-center lg:justify-start">
                {[
                  { count: metrics.criticalCount, label: 'critical', color: '#F85149' },
                  { count: metrics.highCount,     label: 'high',     color: '#F0883E' },
                  { count: metrics.mediumCount,   label: 'medium',   color: '#D29922' },
                ].filter(s => s.count > 0).map(s => (
                  <div key={s.label} className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                    style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                    <span className="font-mono text-xs" style={{ color: s.color }}>{s.count} {s.label}</span>
                  </div>
                ))}
                <span className="font-mono text-xs self-center" style={{ color: '#484F58' }}>
                  · {new Date(generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up animate-delay-200">
          {stats.map(({ icon: Icon, label, value, highlight, sub }) => (
            <div key={label} className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: highlight ? 'rgba(88,166,255,0.06)' : 'rgba(22,27,34,0.8)',
                border: `1px solid ${highlight ? 'rgba(88,166,255,0.22)' : '#21262D'}`,
                boxShadow: highlight ? '0 4px 24px rgba(88,166,255,0.08)' : 'none',
              }}>
              <Icon size={15} style={{ color: highlight ? '#58A6FF' : '#484F58', marginBottom: '10px' }} />
              <div className="font-display font-extrabold mb-1"
                style={{ color: highlight ? '#58A6FF' : '#E6EDF3', fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', lineHeight: 1 }}>
                {value}
              </div>
              <div className="font-body text-xs mb-1" style={{ color: '#8B949E' }}>{label}</div>
              <div className="font-mono text-xs" style={{ color: '#484F58' }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
