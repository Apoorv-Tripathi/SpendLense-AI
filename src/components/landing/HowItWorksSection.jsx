import { useEffect, useRef, useState } from 'react'
import { ClipboardList, BarChart3, Zap, ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'

const steps = [
  {
    step: '01', title: 'Log Your AI Tools',
    description: 'Add every subscription your team uses — coding assistants, chat tools, APIs. Capture plans, seats, and spend in under 5 minutes.',
    icon: ClipboardList, iconColor: '#58A6FF', borderColor: 'rgba(88,166,255,0.18)',
    bg: 'rgba(88,166,255,0.04)',
    bullets: ['8 supported tools', 'Estimates are fine', 'Takes 5 minutes'],
  },
  {
    step: '02', title: 'Instant Cost Breakdown',
    description: 'See your total AI spend by tool, team size, and cost-per-seat. Know exactly which tools pull their weight and which don\'t.',
    icon: BarChart3, iconColor: '#2DD4BF', borderColor: 'rgba(45,212,191,0.18)',
    bg: 'rgba(45,212,191,0.04)',
    bullets: ['Per-seat analysis', 'Waste score 0–100', 'Live as you type'],
  },
  {
    step: '03', title: 'Get Optimization Insights',
    description: 'Receive AI-powered recommendations to cut waste, consolidate redundant tools, and negotiate better contracts.',
    icon: Zap, iconColor: '#8B72EF', borderColor: 'rgba(139,114,239,0.18)',
    bg: 'rgba(139,114,239,0.04)',
    bullets: ['12 audit rules', 'Ranked by impact', 'Shareable report'],
  },
]

function StepCard({ step, index }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  const Icon = step.icon

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref}
      className="relative p-8 rounded-2xl group cursor-default"
      style={{
        background: step.bg,
        border: `1px solid ${step.borderColor}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${index * 0.15}s`,
      }}>

      {/* Step watermark */}
      <div className="absolute top-5 right-6 font-mono font-black select-none"
        style={{ color: step.borderColor, fontSize: '3.5rem', lineHeight: 1 }}>
        {step.step}
      </div>

      {/* Icon */}
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
        style={{ background: `${step.iconColor}15`, border: `1px solid ${step.iconColor}25` }}>
        <Icon size={22} style={{ color: step.iconColor }} />
      </div>

      <h3 className="font-display font-bold text-lg mb-3" style={{ color: '#E6EDF3' }}>
        {step.title}
      </h3>
      <p className="font-body text-sm leading-relaxed mb-5" style={{ color: '#8B949E' }}>
        {step.description}
      </p>

      {/* Bullets */}
      <div className="space-y-2">
        {step.bullets.map(b => (
          <div key={b} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: `${step.iconColor}18` }}>
              <Check size={9} style={{ color: step.iconColor }} />
            </div>
            <span className="font-body text-xs" style={{ color: '#8B949E' }}>{b}</span>
          </div>
        ))}
      </div>

      {/* Connector */}
      {index < steps.length - 1 && (
        <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full items-center justify-center"
          style={{ background: '#161B22', border: '1px solid #30363D', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
          <ArrowRight size={13} style={{ color: '#484F58' }} />
        </div>
      )}
    </div>
  )
}

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <span className="section-tag mb-5 inline-flex">How It Works</span>
          <h2 className="font-display font-extrabold tracking-tight mt-4 mb-5"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#E6EDF3' }}>
            Clarity in three steps
          </h2>
          <p className="font-body text-base max-w-lg mx-auto" style={{ color: '#8B949E', lineHeight: '1.7' }}>
            No integrations. No waiting. Fill in what you pay and let SpendLens surface the waste.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => <StepCard key={i} step={step} index={i} />)}
        </div>

        <div className="text-center mt-14">
          <Link to="/audit" className="btn-primary px-10 py-4 text-sm inline-flex">
            Run Your Audit Now <ArrowRight size={16} />
          </Link>
          <p className="mt-4 font-mono text-xs" style={{ color: '#484F58' }}>
            Free · No account required · Instant in-browser analysis
          </p>
        </div>
      </div>
    </section>
  )
}
