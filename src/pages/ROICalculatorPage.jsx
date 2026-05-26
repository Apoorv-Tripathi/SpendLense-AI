import { useState } from 'react'
import { Calculator, TrendingUp, Clock, Users, DollarSign, Zap } from 'lucide-react'
import { useCurrency } from '../context/CurrencyContext'
import SEOMeta from '../components/seo/SEOMeta'

const TOOLS = [
  { id: 'cursor',         name: 'Cursor',         pricePerSeat: 20, savingsMin: 15, savingsMax: 45 },
  { id: 'github-copilot', name: 'GitHub Copilot', pricePerSeat: 10, savingsMin: 10, savingsMax: 35 },
  { id: 'chatgpt',        name: 'ChatGPT Plus',   pricePerSeat: 20, savingsMin: 20, savingsMax: 60 },
  { id: 'claude',         name: 'Claude Pro',     pricePerSeat: 20, savingsMin: 20, savingsMax: 55 },
  { id: 'windsurf',       name: 'Windsurf Pro',   pricePerSeat: 15, savingsMin: 12, savingsMax: 40 },
]

export default function ROICalculatorPage() {
  const { format } = useCurrency()

  const [tool, setTool]         = useState(TOOLS[0])
  const [teamSize, setTeamSize] = useState(10)
  const [salary, setSalary]     = useState(100000)
  const [minsSaved, setMinsSaved] = useState(30)

  const toolCost = tool.pricePerSeat * teamSize
  const hourlyRate = salary / 52 / 40
  const dailySavingUSD = (minsSaved / 60) * hourlyRate * teamSize
  const monthlySavingUSD = dailySavingUSD * 22 // working days
  const annualSavingUSD  = monthlySavingUSD * 12
  const roi = toolCost > 0 ? ((monthlySavingUSD - toolCost) / toolCost) * 100 : 0
  const breakEvenMins = toolCost > 0 ? (toolCost / (teamSize * 22)) / (hourlyRate / 60) : 0

  const isPositiveROI = roi > 0

  return (
    <>
      <SEOMeta
        title="ROI Calculator"
        description="Calculate the return on investment for your AI tools. See exactly how many minutes per day justify the cost."
        canonical="/calculator"
      />

      <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <span className="section-tag mb-5 inline-flex">
              <Calculator size={10} />
              ROI Calculator
            </span>
            <h1 className="font-display font-extrabold tracking-tight mt-4 mb-4"
              style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--c-heading, #E6EDF3)' }}>
              Does your AI tool pay for itself?
            </h1>
            <p className="font-body text-base max-w-lg mx-auto" style={{ color: '#8B949E' }}>
              Enter your team details and we'll calculate the exact productivity savings your AI tool needs to justify its cost.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Inputs */}
            <div className="rounded-2xl p-6 space-y-6"
              style={{ background: 'rgba(22,27,34,0.8)', border: '1px solid #21262D' }}>
              <h2 className="font-display font-bold text-base" style={{ color: '#E6EDF3' }}>Your Details</h2>

              {/* Tool selector */}
              <div>
                <label className="label-field">AI Tool</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TOOLS.map(t => (
                    <button key={t.id} onClick={() => setTool(t)}
                      className="px-3 py-2 rounded-xl text-xs font-body font-medium transition-all text-left"
                      style={{
                        background: tool.id === t.id ? 'rgba(88,166,255,0.12)' : 'rgba(13,17,23,0.6)',
                        border: `1px solid ${tool.id === t.id ? 'rgba(88,166,255,0.35)' : '#21262D'}`,
                        color: tool.id === t.id ? '#58A6FF' : '#8B949E',
                      }}>
                      {t.name}
                      <div className="font-mono text-xs mt-0.5" style={{ color: tool.id === t.id ? 'rgba(88,166,255,0.6)' : '#484F58' }}>
                        {format(t.pricePerSeat)}/seat/mo
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Team size */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label-field mb-0">Team Size</label>
                  <span className="font-mono text-sm" style={{ color: '#58A6FF' }}>{teamSize} people</span>
                </div>
                <input type="range" min="1" max="200" value={teamSize}
                  onChange={e => setTeamSize(Number(e.target.value))}
                  className="w-full accent-blue-400" style={{ accentColor: '#58A6FF' }} />
                <div className="flex justify-between font-mono text-xs mt-1" style={{ color: '#484F58' }}>
                  <span>1</span><span>200</span>
                </div>
              </div>

              {/* Annual salary */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label-field mb-0">Avg Annual Salary</label>
                  <span className="font-mono text-sm" style={{ color: '#58A6FF' }}>{format(salary)}</span>
                </div>
                <input type="range" min="30000" max="300000" step="5000" value={salary}
                  onChange={e => setSalary(Number(e.target.value))}
                  className="w-full" style={{ accentColor: '#58A6FF' }} />
                <div className="flex justify-between font-mono text-xs mt-1" style={{ color: '#484F58' }}>
                  <span>{format(30000)}</span><span>{format(300000)}</span>
                </div>
              </div>

              {/* Minutes saved */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label-field mb-0">Minutes Saved Per Person / Day</label>
                  <span className="font-mono text-sm" style={{ color: '#58A6FF' }}>{minsSaved} min</span>
                </div>
                <input type="range" min="5" max="120" step="5" value={minsSaved}
                  onChange={e => setMinsSaved(Number(e.target.value))}
                  className="w-full" style={{ accentColor: '#58A6FF' }} />
                <div className="flex justify-between font-mono text-xs mt-1" style={{ color: '#484F58' }}>
                  <span>5 min</span><span>2 hrs</span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">

              {/* ROI verdict */}
              <div className="rounded-2xl p-6 text-center relative overflow-hidden"
                style={{
                  background: isPositiveROI ? 'rgba(45,212,191,0.06)' : 'rgba(248,81,73,0.06)',
                  border: `1px solid ${isPositiveROI ? 'rgba(45,212,191,0.20)' : 'rgba(248,81,73,0.20)'}`,
                }}>
                <div className="font-mono text-xs uppercase tracking-widest mb-2"
                  style={{ color: isPositiveROI ? '#2DD4BF' : '#F85149' }}>
                  {isPositiveROI ? 'Positive ROI ✓' : 'Negative ROI ✗'}
                </div>
                <div className="font-display font-extrabold mb-1"
                  style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', color: isPositiveROI ? '#2DD4BF' : '#F85149', lineHeight: 1 }}>
                  {roi > 0 ? '+' : ''}{Math.round(roi)}%
                </div>
                <div className="font-body text-sm" style={{ color: '#8B949E' }}>
                  Return on investment per month
                </div>
              </div>

              {/* Metrics */}
              {[
                { icon: DollarSign, label: 'Tool cost / month',      value: format(toolCost),         color: '#F0883E' },
                { icon: TrendingUp, label: 'Productivity value / mo', value: format(monthlySavingUSD), color: '#2DD4BF' },
                { icon: Zap,        label: 'Net gain / month',        value: format(monthlySavingUSD - toolCost), color: isPositiveROI ? '#58A6FF' : '#F85149' },
                { icon: Clock,      label: 'Break-even time / day',   value: `${breakEvenMins.toFixed(1)} min`,   color: '#8B72EF' },
                { icon: Users,      label: 'Annual value to team',    value: format(annualSavingUSD),  color: '#2DD4BF' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3.5 rounded-xl"
                  style={{ background: 'rgba(22,27,34,0.8)', border: '1px solid #21262D' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: `${color}12` }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <span className="font-body text-sm" style={{ color: '#8B949E' }}>{label}</span>
                  </div>
                  <span className="font-mono font-semibold text-sm" style={{ color }}>{value}</span>
                </div>
              ))}

              {/* Insight */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(88,166,255,0.05)', border: '1px solid rgba(88,166,255,0.12)' }}>
                <p className="font-body text-sm leading-relaxed" style={{ color: '#8B949E' }}>
                  {isPositiveROI
                    ? `If ${tool.name} saves each person just ${breakEvenMins.toFixed(0)} minutes/day it pays for itself. At ${minsSaved} min/day you're getting ${format(monthlySavingUSD - toolCost)}/mo in net value.`
                    : `At ${minsSaved} min/day saved, ${tool.name} costs more than it returns. Your team needs to save at least ${Math.ceil(breakEvenMins)} min/day to break even.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
