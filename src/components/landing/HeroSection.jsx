import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Clock, TrendingDown, Zap } from 'lucide-react'

const tools = [
  { icon: '⌘', name: 'Cursor',   spend: '$1,200/mo', color: '#7C6FF7', pos: 'top-32 left-4 md:left-12',  delay: '0s' },
  { icon: '◉', name: 'ChatGPT', spend: '$600/mo',    color: '#10A37F', pos: 'top-44 right-4 md:right-16', delay: '1.5s' },
  { icon: '◆', name: 'Claude',  spend: '$450/mo',    color: '#D4774A', pos: 'bottom-48 left-4 md:left-16',delay: '0.8s' },
  { icon: '◎', name: 'Copilot', spend: '$760/mo',    color: '#6E40C9', pos: 'bottom-36 right-2 md:right-10',delay: '2s' },
]

const trustItems = [
  { icon: ShieldCheck, label: 'No account required' },
  { icon: TrendingDown, label: 'Instant results' },
  { icon: Clock, label: 'Under 2 min audit' },
]

function LiveCounter() {
  return (
    <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-3 z-10">
      {[
        { value: '8 Tools', label: 'analyzed side-by-side', color: '#58A6FF' },
        { value: '12 Rules', label: 'redundancy & seat checks', color: '#2DD4BF' },
        { value: '< 2 min', label: 'start to full audit', color: '#8B72EF' },
      ].map(({ value, label, color }) => (
        <div key={label} className="px-4 py-3 rounded-xl text-right"
          style={{ background: 'rgba(22,27,34,0.85)', border: `1px solid ${color}20`, backdropFilter: 'blur(12px)' }}>
          <div className="font-display font-extrabold text-xl" style={{ color }}>{value}</div>
          <div className="font-mono text-xs" style={{ color: '#8B949E' }}>{label}</div>
        </div>
      ))}
    </div>
  )
}

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 100) }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

      {/* Multi-layer background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px]"
          style={{ background: 'radial-gradient(ellipse, rgba(88,166,255,0.06) 0%, transparent 60%)' }} />
        {/* Secondary teal glow */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80"
          style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.05) 0%, transparent 65%)' }} />
        {/* Bottom left glow */}
        <div className="absolute bottom-1/4 left-1/4 w-60 h-60"
          style={{ background: 'radial-gradient(circle, rgba(124,111,247,0.04) 0%, transparent 65%)' }} />
        {/* Animated orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full animate-spin-slow opacity-30"
          style={{ background: 'conic-gradient(from 0deg, transparent 0%, rgba(88,166,255,0.04) 25%, transparent 50%, rgba(45,212,191,0.04) 75%, transparent 100%)' }} />
      </div>

      {/* Floating tool badges */}
      {tools.map((badge, i) => (
        <div key={badge.name}
          className={`absolute ${badge.pos} z-10 hidden sm:flex items-center gap-3 px-4 py-3 rounded-2xl`}
          style={{
            background: 'rgba(22,27,34,0.85)',
            border: `1px solid ${badge.color}25`,
            backdropFilter: 'blur(16px)',
            boxShadow: `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px ${badge.color}10`,
            animation: `float ${6 + i}s ease-in-out infinite`,
            animationDelay: badge.delay,
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.6s ease',
            transitionDelay: `${i * 0.15}s`,
          }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold"
            style={{ background: `${badge.color}18`, color: badge.color, border: `1px solid ${badge.color}25` }}>
            {badge.icon}
          </div>
          <div>
            <div className="font-display font-semibold text-xs" style={{ color: '#E6EDF3' }}>{badge.name}</div>
            <div className="font-mono text-xs" style={{ color: '#484F58' }}>{badge.spend}</div>
          </div>
          {/* Pulse dot */}
          <div className="w-1.5 h-1.5 rounded-full ml-1 animate-bounce-soft"
            style={{ background: badge.color, boxShadow: `0 0 6px ${badge.color}` }} />
        </div>
      ))}

      {/* Live counters — right side */}
      <LiveCounter />

      {/* Hero content */}
      <div className="relative z-20 max-w-3xl mx-auto px-4 sm:px-6 text-center">

        <div className="animate-fade-up">
          <span className="section-tag mb-8 inline-flex">
            <Zap size={10} className="animate-bounce-soft" />
            AI Spend Intelligence
          </span>
        </div>

        <h1 className="font-display font-extrabold tracking-tight mt-6 animate-fade-up animate-delay-100"
          style={{ fontSize: 'clamp(2.4rem, 6.5vw, 4.5rem)', lineHeight: '1.05', color: '#E6EDF3' }}>
          Stop overpaying for{' '}
          <span className="brand-gradient-text relative">
            AI tools
            {/* Underline decoration */}
            <svg className="absolute -bottom-1 left-0 w-full" height="4" viewBox="0 0 200 4" preserveAspectRatio="none">
              <path d="M0 2 Q50 0 100 2 Q150 4 200 2" stroke="url(#ug)" strokeWidth="2" fill="none" strokeLinecap="round" />
              <defs>
                <linearGradient id="ug" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#58A6FF" />
                  <stop offset="100%" stopColor="#2DD4BF" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <br />your team barely uses.
        </h1>

        <p className="mt-7 text-base sm:text-lg leading-relaxed animate-fade-up animate-delay-200 max-w-xl mx-auto"
          style={{ color: '#8B949E' }}>
          Teams frequently accumulate duplicate AI assistants, unassigned seats, and tier mismatches across departments. SpendLens audits your entire tooling stack in under 2 minutes — completely free and private.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animate-delay-300">
          <Link to="/audit" className="btn-primary text-sm px-9 py-4 w-full sm:w-auto justify-center animate-pulse-brand">
            Start Your Free Audit
            <ArrowRight size={16} />
          </Link>
          <a href="#how-it-works" className="btn-outline text-sm px-8 py-4 w-full sm:w-auto justify-center">
            See How It Works
          </a>
        </div>

        {/* Trust bar */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2 animate-fade-up animate-delay-400">
          {trustItems.map(({ icon: Icon, label }, i) => (
            <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-body"
              style={{ background: 'rgba(22,27,34,0.6)', border: '1px solid #21262D', color: '#484F58' }}>
              <Icon size={13} style={{ color: '#2DD4BF' }} />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 flex flex-col items-center gap-2 animate-fade-up animate-delay-500">
          <div className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
            style={{ border: '1px solid #30363D' }}>
            <div className="w-1 h-2 rounded-full animate-bounce-soft" style={{ background: '#484F58' }} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #0D1117)' }} />
    </section>
  )
}
