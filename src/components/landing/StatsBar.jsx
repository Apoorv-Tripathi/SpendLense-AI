import { useEffect, useRef, useState } from 'react'
import { STATS } from '../../constants'

function AnimatedStat({ value, label, index }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="text-center group cursor-default"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 0.1}s` }}>
      <div className="font-display font-extrabold mb-2 brand-gradient-text group-hover:scale-105 transition-transform duration-200"
        style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
        {value}
      </div>
      <div className="font-body text-sm leading-snug" style={{ color: '#8B949E' }}>
        {label}
      </div>
    </div>
  )
}

export default function StatsBar() {
  return (
    <section className="py-16 relative overflow-hidden" style={{ borderTop: '1px solid #21262D', borderBottom: '1px solid #21262D' }}>
      {/* Background shimmer */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(88,166,255,0.02) 50%, transparent 100%)' }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {STATS.map((stat, i) => (
            <AnimatedStat key={i} value={stat.value} label={stat.label} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
