import { ArrowRight, Download, RotateCcw, TrendingDown, Zap } from 'lucide-react'
import { useCurrency } from '../../context/CurrencyContext'
import { exportToPDF } from '../../utils/pdfExport.js'
import LeadCaptureForm from './LeadCaptureForm'

export default function ResultsCTA({ metrics, onReset, publicId, report }) {
  const { format, currency } = useCurrency()
  const formatCurrency = format
  const isHighSavings = metrics.potentialMonthlySavings >= 500
  const isLowSavings  = metrics.potentialMonthlySavings < 50 && metrics.totalMonthlySpend > 0

  if (isLowSavings) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto rounded-3xl p-10 text-center"
          style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.15)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(45,212,191,0.10)', border: '1px solid rgba(45,212,191,0.20)' }}>
            <span className="text-2xl">🎉</span>
          </div>
          <h2 className="font-display font-bold text-2xl mb-3" style={{ color: '#E6EDF3' }}>
            Your AI stack is well-optimised
          </h2>
          <p className="font-body text-sm leading-relaxed mb-8" style={{ color: '#8B949E' }}>
            We only found {formatCurrency(metrics.potentialMonthlySavings)}/mo in potential savings — that's a healthy sign. Re-run this audit quarterly as your team grows or as tool pricing changes.
          </p>
          <button onClick={onReset} className="btn-outline text-sm px-8 py-3 inline-flex items-center gap-2">
            <RotateCcw size={14} /> Run Another Audit
          </button>
          <LeadCaptureForm publicId={publicId} />
        </div>
      </section>
    )
  }

  if (isHighSavings) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto relative rounded-3xl p-10 md:p-14 text-center overflow-hidden"
          style={{ background: 'rgba(22,27,34,0.95)', border: '1px solid rgba(88,166,255,0.20)', boxShadow: '0 0 80px rgba(88,166,255,0.06)' }}>

          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48"
              style={{ background: 'radial-gradient(ellipse at top, rgba(88,166,255,0.08) 0%, transparent 65%)' }} />
            <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.04) 0%, transparent 65%)', transform: 'translate(30%, 30%)' }} />
          </div>

          <div className="relative z-10">
            {/* Icon */}
            <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-6"
              style={{ background: 'linear-gradient(135deg, #388BFD, #2DD4BF)', boxShadow: '0 4px 24px rgba(88,166,255,0.25)' }}>
              <TrendingDown size={24} className="text-white" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
              style={{ background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.20)' }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#F85149' }} />
              <span className="font-mono text-xs" style={{ color: '#F85149' }}>High savings detected</span>
            </div>

            <h2 className="font-display font-extrabold mb-4 leading-tight"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', color: '#E6EDF3' }}>
              You're leaving{' '}
              <span className="brand-gradient-text">{formatCurrency(metrics.potentialAnnualSavings)}</span>
              <br />on the table every year.
            </h2>

            <p className="font-body text-base leading-relaxed max-w-xl mx-auto mb-10" style={{ color: '#8B949E' }}>
              Acting on the recommendations above could recover{' '}
              <span style={{ color: '#E6EDF3', fontWeight: 500 }}>{formatCurrency(metrics.potentialMonthlySavings)}/month</span>{' '}
              without reducing your team's AI capabilities.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => report ? exportToPDF(report, currency) : window.print()} className="btn-primary text-sm px-8 py-4 w-full sm:w-auto justify-center">
                <Download size={15} /> Export Report
              </button>
              <button onClick={onReset} className="btn-outline text-sm px-8 py-4 w-full sm:w-auto justify-center">
                <RotateCcw size={14} /> Re-run Audit
              </button>
            </div>

            <LeadCaptureForm publicId={publicId} />
          </div>
        </div>
      </section>
    )
  }

  // Medium savings
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex w-12 h-12 rounded-xl items-center justify-center mb-6"
          style={{ background: 'rgba(88,166,255,0.08)', border: '1px solid rgba(88,166,255,0.15)' }}>
          <Zap size={20} style={{ color: '#58A6FF' }} />
        </div>
        <h2 className="font-display font-bold text-2xl mb-3" style={{ color: '#E6EDF3' }}>
          Start with the highest-impact finding
        </h2>
        <p className="font-body text-sm mb-8" style={{ color: '#8B949E' }}>
          Implement the top recommendation first — it takes under 30 minutes and accounts for the majority of your potential savings.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="btn-primary text-sm px-8 py-3">
            Review findings <ArrowRight size={14} />
          </button>
          <button onClick={onReset} className="btn-ghost text-sm flex items-center gap-2" style={{ color: '#484F58' }}>
            <RotateCcw size={14} /> New audit
          </button>
        </div>
        <LeadCaptureForm publicId={publicId} />
      </div>
    </section>
  )
}
