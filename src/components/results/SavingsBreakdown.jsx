import { useCurrency } from '../../context/CurrencyContext'
import { useThemeStyles } from '../../hooks/useThemeStyles'
import { TOOL_KNOWLEDGE } from '../../engine/auditKnowledge.js'

const TYPE_LABELS = {
  redundancy:            'Redundant tools',
  'wrong-plan':          'Wrong plan tier',
  'excess-seats':        'Unused seats',
  'billing-anomaly':     'Billing anomaly',
  'pricing-optimization':'Pricing discount',
  'cheaper-alternative': 'Cheaper alternative',
  'misaligned-tool':     'Misaligned tool',
  'cost-per-seat':       'High seat cost',
}

export default function SavingsBreakdown({ findings, metrics }) {
  const { format: formatCurrency } = useCurrency()
  const t = useThemeStyles()

  const savingsFindings = findings.filter(f => f.monthlySavings > 0 && !f.isOpportunity && f.type !== 'healthy')

  if (savingsFindings.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: t.bgCard, border: `1px solid ${t.border}` }}>
        <div className="font-body text-xs" style={{ color: t.textFaint }}>No quantifiable savings found.</div>
      </div>
    )
  }

  const byType = {}
  for (const f of savingsFindings) {
    byType[f.type] = (byType[f.type] || 0) + f.monthlySavings
  }
  const sorted = Object.entries(byType).sort((a, b) => b[1] - a[1])
  const max = sorted[0]?.[1] ?? 1

  const byTool = {}
  for (const f of savingsFindings) {
    const key = f.toolId === 'global' && f.affectedTools ? f.affectedTools[0] : f.toolId
    byTool[key] = (byTool[key] || 0) + f.monthlySavings
  }

  // ROI insight
  const roiMonths = metrics.totalMonthlySpend > 0 && metrics.potentialMonthlySavings > 0
    ? Math.ceil(metrics.totalMonthlySpend / metrics.potentialMonthlySavings) : null

  return (
    <div className="rounded-2xl p-5" style={{ background: t.bgCard, border: `1px solid ${t.border}` }}>
      <h3 className="font-display font-bold text-sm mb-5" style={{ color: t.textMuted }}>
        Savings Breakdown
      </h3>
      {metrics.totalFindings > 0 && (
        <div className="font-mono text-xs mb-2" style={{ color: t.textFaint }}>
          Based on published list pricing · {metrics.totalFindings} finding{metrics.totalFindings !== 1 ? 's' : ''}
        </div>
      )}

      {/* Monthly / Annual */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-xl p-3.5 text-center" style={{ background: 'rgba(88,166,255,0.08)', border: '1px solid rgba(88,166,255,0.20)' }}>
          <div className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: '#58A6FF' }}>Monthly</div>
          <div className="font-display font-extrabold" style={{ color: '#58A6FF', fontSize: 'clamp(1rem, 2.5vw, 1.4rem)' }}>
            {formatCurrency(metrics.potentialMonthlySavings)}
          </div>
        </div>
        <div className="rounded-xl p-3.5 text-center" style={{ background: t.bgCardDeep, border: `1px solid ${t.border}` }}>
          <div className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: t.textFaint }}>Annual</div>
          <div className="font-display font-extrabold" style={{ color: t.textPrimary, fontSize: 'clamp(1rem, 2.5vw, 1.4rem)' }}>
            {formatCurrency(metrics.potentialAnnualSavings)}
          </div>
        </div>
      </div>

      {/* By category */}
      <div className="mb-5">
        <div className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: t.textFaint }}>By category</div>
        <div className="space-y-2.5">
          {sorted.map(([type, amount]) => {
            const pct = (amount / max) * 100
            return (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-body text-xs" style={{ color: t.textMuted }}>{TYPE_LABELS[type] ?? type}</span>
                  <span className="font-mono text-xs font-semibold" style={{ color: '#58A6FF' }}>{formatCurrency(amount)}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: t.border }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #388BFD, #58A6FF)' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* By tool */}
      {Object.keys(byTool).length > 1 && (
        <div className="mb-5">
          <div className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: t.textFaint }}>By tool</div>
          <div className="space-y-2">
            {Object.entries(byTool).sort((a, b) => b[1] - a[1]).map(([toolId, amount]) => {
              const spec = TOOL_KNOWLEDGE[toolId]
              const pct = metrics.potentialMonthlySavings > 0 ? (amount / metrics.potentialMonthlySavings) * 100 : 0
              return (
                <div key={toolId} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs flex-shrink-0"
                    style={{ background: `${spec?.color ?? '#888'}20`, color: spec?.color ?? '#888' }}>
                    {spec?.icon ?? '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-body text-xs" style={{ color: t.textMuted }}>{spec?.name ?? toolId}</span>
                      <span className="font-mono text-xs" style={{ color: t.textFaint }}>{formatCurrency(amount)}/mo</span>
                    </div>
                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: t.border }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: spec?.color ?? '#58A6FF' }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ROI insight */}
      {roiMonths && (
        <div className="rounded-xl p-3.5" style={{ background: 'rgba(88,166,255,0.05)', border: '1px solid rgba(88,166,255,0.12)' }}>
          <div className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(88,166,255,0.7)' }}>
            ✦ ROI Insight
          </div>
          <p className="font-body text-xs leading-relaxed" style={{ color: t.textMuted }}>
            At {formatCurrency(metrics.potentialAnnualSavings)}/year in potential savings, acting on these findings pays back in the first month.
          </p>
        </div>
      )}

      <p className="mt-4 font-body text-xs leading-relaxed" style={{ color: t.textFaint }}>
        Estimates based on published list pricing. Actual savings depend on contract terms and regional taxes.
      </p>
    </div>
  )
}
