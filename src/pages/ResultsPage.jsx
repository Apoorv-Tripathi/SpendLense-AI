import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Zap, Sparkles, Download, ChevronDown } from 'lucide-react'
import { exportToPDF } from '../utils/pdfExport.js'
import { useCurrency } from '../context/CurrencyContext'
import { useThemeStyles } from '../hooks/useThemeStyles'
import { groupFindingsByTool } from '../engine/auditEngine.js'
import { TOOL_KNOWLEDGE } from '../engine/auditKnowledge.js'
import ResultsHero         from '../components/results/ResultsHero'
import ToolResultCard      from '../components/results/ToolResultCard'
import GlobalFindingsPanel from '../components/results/GlobalFindingsPanel'
import SavingsBreakdown    from '../components/results/SavingsBreakdown'
import AnalyticsPanel      from '../components/results/AnalyticsPanel'
import ResultsCTA          from '../components/results/ResultsCTA'
import AuditLoading        from '../components/results/AuditLoading'

export default function ResultsPage({ report, loading, onReset, publicId }) {
  useEffect(() => { window.scrollTo({ top: 0 }) }, [])

  const t = useThemeStyles()

  if (loading) return <AuditLoading />

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: t.bgCard, border: `1px solid ${t.border}` }}>
            <Zap size={24} style={{ color: t.textFaint }} />
          </div>
          <h1 className="font-display font-bold text-2xl mb-3" style={{ color: t.textPrimary }}>No audit report found</h1>
          <p className="font-body text-sm mb-8" style={{ color: t.textMuted }}>
            Complete the audit form to generate your personalised spend analysis.
          </p>
          <Link to="/audit" className="btn-primary text-sm px-8 py-3 inline-flex">Start Audit</Link>
        </div>
      </div>
    )
  }

  const { currency } = useCurrency()
  const { findings, metrics, verdict, context, tools, generatedAt } = report

  const globalFindings = findings.filter(
    f => f.toolId === 'global' && (!f.affectedTools || f.affectedTools.length > 1)
  )
  const activeTools = tools.filter(tool => tool.monthlySpend > 0 && TOOL_KNOWLEDGE[tool.toolId])
  const globalFindingIds = new Set(globalFindings.map(f => f.id))
  const perToolFindings = groupFindingsByTool(
    findings.filter(f => !globalFindingIds.has(f.id)),
    activeTools
  )

  return (
    <div className="min-h-screen">
      <ResultsHero metrics={metrics} verdict={verdict} context={context} generatedAt={generatedAt} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">

        {/* Nav */}
        <div className="flex items-center justify-between mb-8 pt-2 flex-wrap gap-3">
          <Link to="/audit" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body transition-all"
            style={{ color: t.textFaint }}>
            <ArrowLeft size={14} /> Back to form
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => exportToPDF(report, currency)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-body transition-all"
              style={{ background: 'rgba(88,166,255,0.08)', border: '1px solid rgba(88,166,255,0.20)', color: '#58A6FF' }}>
              <Download size={13} /> Export PDF
            </button>
            <button onClick={onReset}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body transition-all"
              style={{ color: t.textFaint }}>
              <RotateCcw size={14} /> New audit
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* LEFT */}
          <div className="space-y-8">
            <AnalyticsPanel metrics={metrics} context={context} findings={findings} tools={activeTools} />

            {/* AI Summary card */}
            {report.aiSummary?.text && (
              <AISummaryCard summary={report.aiSummary} metrics={metrics} context={context} t={t} />
            )}

            {globalFindings.length > 0 && (
              <section>
                <SectionLabel step="01" label="Cross-Tool Issues" count={globalFindings.length} t={t} />
                <GlobalFindingsPanel findings={globalFindings} />
              </section>
            )}

            {activeTools.length > 0 && (
              <section>
                <SectionLabel
                  step={globalFindings.length > 0 ? '02' : '01'}
                  label="Per-Tool Analysis"
                  count={activeTools.length}
                  t={t}
                />
                <div className="space-y-4">
                  {activeTools.map(tool => (
                    <ToolResultCard
                      key={tool.id || tool.toolId}
                      toolEntry={tool}
                      findings={perToolFindings.get(tool.toolId) ?? []}
                    />
                  ))}
                </div>
              </section>
            )}

            {findings.length === 0 && (
              <div className="rounded-2xl p-12 text-center"
                style={{ background: t.bgCard, border: `1px solid ${t.border}` }}>
                <div className="text-4xl mb-4">✨</div>
                <h3 className="font-display font-bold text-xl mb-2" style={{ color: t.textPrimary }}>No issues found</h3>
                <p className="font-body text-sm" style={{ color: t.textMuted }}>
                  Your AI stack looks clean. Come back as your team and tooling evolves.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <SavingsBreakdown findings={findings} metrics={metrics} />

            {/* Audit context */}
            <div className="rounded-2xl p-5 space-y-4"
              style={{ background: t.bgCard, border: `1px solid ${t.border}` }}>
              <div className="font-mono text-xs uppercase tracking-widest" style={{ color: t.textFaint }}>
                Audit context
              </div>
              {[
                { label: 'Team size',      value: `${context.teamSize} people` },
                { label: 'Use case',       value: context.primaryUseCase },
                { label: 'Tools audited',  value: `${metrics.toolCount}` },
                { label: 'Total findings', value: `${metrics.totalFindings}` },
                {
                  label: 'Waste score',
                  value: `${metrics.wasteScore}/100`,
                  color: metrics.wasteScore >= 75 ? '#2DD4BF' : metrics.wasteScore >= 50 ? '#D29922' : '#F85149',
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="font-body text-xs" style={{ color: t.textFaint }}>{label}</span>
                  <span className="font-mono text-xs font-medium capitalize"
                    style={{ color: color ?? t.textMuted }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ResultsCTA metrics={metrics} onReset={onReset} publicId={publicId} />
    </div>
  )
}

// ─── AI Summary Card ──────────────────────────────────────────────────────────

function AISummaryCard({ summary, metrics, context, t }) {
  const [expanded, setExpanded] = useState(false)
  const words   = summary.text.split(' ')
  const preview = words.slice(0, 28).join(' ') + (words.length > 28 ? '…' : '')

  const mood = metrics.wasteScore >= 80 ? 'excellent'
    : metrics.wasteScore >= 55 ? 'good'
    : metrics.wasteScore >= 35 ? 'concerning' : 'critical'

  const moodColors = { excellent: '#2DD4BF', good: '#58A6FF', concerning: '#F0883E', critical: '#F85149' }
  const accentColor = moodColors[mood]

  const bgGradient = t.isDark
    ? `linear-gradient(135deg, ${accentColor}08 0%, ${accentColor}03 100%)`
    : `linear-gradient(135deg, ${accentColor}06 0%, rgba(255,255,255,0.95) 100%)`

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: bgGradient, border: `1px solid ${accentColor}22` }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: `1px solid ${accentColor}15`, background: `${accentColor}06` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}>
            <Sparkles size={13} style={{ color: accentColor }} />
          </div>
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
              AI Analysis
            </span>
            <span className="font-mono text-xs ml-2" style={{ color: t.textFaint }}>· powered by Groq</span>
          </div>
        </div>
        <button onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-body transition-all"
          style={{
            background: expanded ? `${accentColor}12` : 'transparent',
            border: `1px solid ${expanded ? accentColor + '30' : 'transparent'}`,
            color: t.textMuted,
          }}>
          {expanded ? 'Show less' : 'Read more'}
          <ChevronDown size={12} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
        </button>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <div className="font-display text-5xl select-none mb-1"
          style={{ color: `${accentColor}15`, lineHeight: 1 }}>"</div>

        <p className="font-body text-sm leading-relaxed"
          style={{ color: t.textBody, lineHeight: '1.8' }}>
          {expanded ? summary.text : preview}
        </p>

        {!expanded && (
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { label: 'Monthly savings', value: `$${metrics.potentialMonthlySavings.toFixed(0)}` },
              { label: 'Waste score',     value: `${metrics.wasteScore}/100` },
              { label: 'Findings',        value: `${metrics.totalFindings}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}18` }}>
                <span className="font-mono text-xs font-semibold" style={{ color: accentColor }}>{value}</span>
                <span className="font-body text-xs" style={{ color: t.textFaint }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3"
          style={{ borderTop: `1px solid ${accentColor}12` }}>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accentColor }} />
            <span className="font-mono text-xs" style={{ color: t.textFaint }}>
              {summary.isFallback
                ? 'Auto-generated summary'
                : `${summary.model || 'Groq AI'} · ${summary.text.split(' ').length} words`}
            </span>
          </div>
          <span className="font-mono text-xs" style={{ color: `${accentColor}50` }}>SpendLens AI ✦</span>
        </div>
      </div>
    </div>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ step, label, count, t }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center"
        style={{ background: 'rgba(88,166,255,0.10)', border: '1px solid rgba(88,166,255,0.20)' }}>
        <span className="font-mono text-xs" style={{ color: '#58A6FF' }}>{step}</span>
      </div>
      <h2 className="font-display font-bold text-base" style={{ color: t.textPrimary }}>{label}</h2>
      <span className="font-mono text-xs" style={{ color: t.textFaint }}>
        {count} {count === 1 ? 'item' : 'items'}
      </span>
    </div>
  )
}
