export default function FormProgress({ formState, totals }) {
  const steps = [
    { label: 'Team info', done: !!(formState.teamSize && formState.primaryUseCase) },
    { label: 'Tools logged', done: totals.toolCount > 0 },
    { label: 'Spend entered', done: totals.totalMonthlySpend > 0 },
  ]

  const completedCount = steps.filter(s => s.done).length
  const pct = Math.round((completedCount / steps.length) * 100)

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex-1 min-w-[120px]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-body text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Completion</span>
          <span className="font-mono text-xs" style={{ color: '#58A6FF' }}>{pct}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #388BFD, #58A6FF)' }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300"
              style={step.done
                ? { background: '#58A6FF', borderColor: '#58A6FF' }
                : { background: 'transparent', borderColor: 'rgba(255,255,255,0.2)' }
              }
            >
              {step.done && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 4L3 6L7 2" stroke="#0D1117" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="font-body text-xs transition-colors"
              style={{ color: step.done ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)' }}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}