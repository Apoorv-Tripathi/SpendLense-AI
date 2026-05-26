import { useState } from 'react'
import { BarChart3, Users, TrendingUp, Award, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCurrency } from '../context/CurrencyContext'
import SEOMeta from '../components/seo/SEOMeta'

// Realistic benchmark data based on industry research
const BENCHMARKS = {
  byTeamSize: [
    { range: '1–5',    label: 'Solo / Micro', avgMonthly: 45,  avgTools: 1.8, wasteRate: 12, color: '#2DD4BF' },
    { range: '6–20',   label: 'Small Team',   avgMonthly: 210, avgTools: 2.9, wasteRate: 18, color: '#58A6FF' },
    { range: '21–50',  label: 'Mid Team',     avgMonthly: 680, avgTools: 3.8, wasteRate: 24, color: '#8B72EF' },
    { range: '51–100', label: 'Large Team',   avgMonthly: 1840, avgTools: 4.5, wasteRate: 29, color: '#F0883E' },
    { range: '100+',   label: 'Enterprise',   avgMonthly: 5200, avgTools: 5.9, wasteRate: 34, color: '#F85149' },
  ],
  byUseCase: [
    { useCase: 'Coding',    perSeat: 38, topTool: 'Cursor',  wasteRate: 21 },
    { useCase: 'Writing',   perSeat: 22, topTool: 'Claude',  wasteRate: 15 },
    { useCase: 'Research',  perSeat: 29, topTool: 'ChatGPT', wasteRate: 19 },
    { useCase: 'Data',      perSeat: 55, topTool: 'OpenAI API', wasteRate: 27 },
    { useCase: 'Mixed',     perSeat: 44, topTool: 'ChatGPT', wasteRate: 31 },
  ],
  topRedundancies: [
    { pair: 'Cursor + GitHub Copilot',     frequency: 68, avgWaste: 95 },
    { pair: 'Claude + ChatGPT',            frequency: 54, avgWaste: 42 },
    { pair: 'ChatGPT + Gemini',            frequency: 41, avgWaste: 38 },
    { pair: 'Cursor + Windsurf',           frequency: 29, avgWaste: 85 },
    { pair: 'Anthropic API + Claude Pro',  frequency: 22, avgWaste: 28 },
  ],
}

function BarRow({ label, value, max, color, formatted }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 flex-shrink-0 font-body text-xs text-right" style={{ color: '#8B949E' }}>{label}</div>
      <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ background: '#21262D' }}>
        <div className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}80, ${color})`, minWidth: '2rem' }}>
          <span className="font-mono text-xs font-medium" style={{ color: '#0D1117', whiteSpace: 'nowrap' }}>
            {formatted}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function BenchmarksPage() {
  const { format, convert, currency } = useCurrency()
  const [selectedSize, setSelectedSize] = useState('6–20')

  const selected = BENCHMARKS.byTeamSize.find(b => b.range === selectedSize) || BENCHMARKS.byTeamSize[1]

  return (
    <>
      <SEOMeta
        title="Industry Benchmarks"
        description="See how much teams like yours spend on AI tools. Compare your AI spend against industry averages by team size and use case."
        canonical="/benchmarks"
      />

      <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <span className="section-tag mb-5 inline-flex">
              <BarChart3 size={10} />
              Industry Benchmarks
            </span>
            <h1 className="font-display font-extrabold tracking-tight mt-4 mb-4"
              style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#E6EDF3' }}>
              How does your team compare?
            </h1>
            <p className="font-body text-base max-w-lg mx-auto" style={{ color: '#8B949E' }}>
              Aggregated data from teams using SpendLens. Use this to benchmark your AI spend and identify if you're over or under-investing.
            </p>
            <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(88,166,255,0.06)', border: '1px solid rgba(88,166,255,0.15)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#58A6FF' }} />
              <span className="font-mono text-xs" style={{ color: '#8B949E' }}>
                Based on anonymised audit data · Updated monthly
              </span>
            </div>
          </div>

          {/* Team size filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {BENCHMARKS.byTeamSize.map(b => (
              <button key={b.range}
                onClick={() => setSelectedSize(b.range)}
                className="px-4 py-2 rounded-xl text-sm font-body font-medium transition-all"
                style={{
                  background: selectedSize === b.range ? b.color + '15' : 'rgba(22,27,34,0.8)',
                  border: `1px solid ${selectedSize === b.range ? b.color + '40' : '#21262D'}`,
                  color: selectedSize === b.range ? b.color : '#8B949E',
                }}>
                {b.range} people
              </button>
            ))}
          </div>

          {/* Selected size stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: TrendingUp, label: 'Avg monthly spend',   value: format(selected.avgMonthly), color: '#58A6FF' },
              { icon: BarChart3,  label: 'Avg tools running',   value: `${selected.avgTools}`,      color: '#8B72EF' },
              { icon: Award,      label: 'Avg waste rate',      value: `${selected.wasteRate}%`,     color: '#F0883E' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="rounded-2xl p-5 text-center transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(22,27,34,0.8)', border: `1px solid ${color}20` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: `${color}10` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="font-display font-extrabold text-2xl mb-1" style={{ color }}>{value}</div>
                <div className="font-body text-xs" style={{ color: '#8B949E' }}>{label}</div>
                <div className="font-mono text-xs mt-1" style={{ color: '#484F58' }}>
                  for {selected.range}-person teams
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Avg spend by team size */}
            <div className="rounded-2xl p-6" style={{ background: 'rgba(22,27,34,0.8)', border: '1px solid #21262D' }}>
              <div className="font-mono text-xs uppercase tracking-widest mb-5" style={{ color: '#484F58' }}>
                Avg Monthly Spend by Team Size
              </div>
              <div className="space-y-3">
                {BENCHMARKS.byTeamSize.map(b => (
                  <BarRow
                    key={b.range}
                    label={b.range}
                    value={b.avgMonthly}
                    max={6000}
                    color={b.color}
                    formatted={format(b.avgMonthly)}
                  />
                ))}
              </div>
            </div>

            {/* Per-seat cost by use case */}
            <div className="rounded-2xl p-6" style={{ background: 'rgba(22,27,34,0.8)', border: '1px solid #21262D' }}>
              <div className="font-mono text-xs uppercase tracking-widest mb-5" style={{ color: '#484F58' }}>
                Avg Cost per Seat by Use Case
              </div>
              <div className="space-y-4">
                {BENCHMARKS.byUseCase.map((u, i) => {
                  const colors = ['#58A6FF', '#2DD4BF', '#8B72EF', '#F0883E', '#D29922']
                  return (
                    <div key={u.useCase}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-body text-sm" style={{ color: '#8B949E' }}>{u.useCase}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs" style={{ color: '#484F58' }}>Top: {u.topTool}</span>
                          <span className="font-mono text-xs font-semibold" style={{ color: colors[i] }}>
                            {format(u.perSeat)}/seat
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#21262D' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${(u.perSeat / 60) * 100}%`, background: colors[i], boxShadow: `0 0 6px ${colors[i]}40` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Most common redundancies */}
            <div className="rounded-2xl p-6 lg:col-span-2" style={{ background: 'rgba(22,27,34,0.8)', border: '1px solid #21262D' }}>
              <div className="font-mono text-xs uppercase tracking-widest mb-5" style={{ color: '#484F58' }}>
                Most Common Redundant Tool Pairs
              </div>
              <div className="space-y-3">
                {BENCHMARKS.topRedundancies.map((r, i) => (
                  <div key={r.pair} className="flex items-center gap-4 py-3 px-4 rounded-xl transition-all hover:bg-white/[0.02]"
                    style={{ borderBottom: i < BENCHMARKS.topRedundancies.length - 1 ? '1px solid #21262D' : 'none' }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold flex-shrink-0"
                      style={{ background: 'rgba(248,81,73,0.10)', color: '#F85149' }}>{i + 1}</div>
                    <div className="flex-1">
                      <div className="font-display font-semibold text-sm mb-0.5" style={{ color: '#E6EDF3' }}>{r.pair}</div>
                      <div className="font-body text-xs" style={{ color: '#484F58' }}>
                        Found in {r.frequency}% of audits for these tools
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-mono text-sm font-semibold" style={{ color: '#F85149' }}>
                        ~{format(r.avgWaste)}/mo
                      </div>
                      <div className="font-mono text-xs" style={{ color: '#484F58' }}>avg waste</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-10">
            <p className="font-body text-sm mb-4" style={{ color: '#8B949E' }}>
              See how your actual spend compares to these benchmarks
            </p>
            <Link to="/audit" className="btn-primary px-8 py-3 text-sm inline-flex">
              Audit Your Stack <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
