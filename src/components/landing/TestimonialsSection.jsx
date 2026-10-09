import { AUDIT_CAPABILITIES } from '../../constants'
import { ShieldAlert, Users, Layers } from 'lucide-react'

const icons = [Layers, Users, ShieldAlert]

export default function TestimonialsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ borderTop: '1px solid #21262D' }}>
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-14">
          <span className="section-tag mb-5 inline-flex">Audit Engine</span>
          <h2 className="font-display font-extrabold mt-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#E6EDF3' }}>
            Common AI Spend Inefficiencies We Detect
          </h2>
          <p className="mt-3 font-body text-sm max-w-xl mx-auto" style={{ color: '#8B949E' }}>
            SpendLens evaluates your tools using 12 deterministic rules to detect duplicate software, misallocated seats, and over-provisioned enterprise plans.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {AUDIT_CAPABILITIES.map((cap, i) => {
            const Icon = icons[i % icons.length]
            return (
              <div key={i} className="card-glass-hover p-7 rounded-2xl flex flex-col gap-4"
                style={{ background: 'rgba(22,27,34,0.6)', border: '1px solid #21262D' }}>

                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(88,166,255,0.10)', border: '1px solid rgba(88,166,255,0.20)', color: '#58A6FF' }}>
                    <Icon size={18} />
                  </div>
                  <span className="font-mono text-xs px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.20)', color: '#2DD4BF' }}>
                    {cap.badge}
                  </span>
                </div>

                <div>
                  <div className="font-mono text-xs uppercase tracking-wider mb-1" style={{ color: '#484F58' }}>
                    {cap.category}
                  </div>
                  <h3 className="font-display font-bold text-lg" style={{ color: '#E6EDF3' }}>
                    {cap.title}
                  </h3>
                </div>

                <p className="font-body text-sm leading-relaxed flex-1" style={{ color: '#8B949E' }}>
                  {cap.description}
                </p>

                <div className="pt-3 flex items-center justify-between" style={{ borderTop: '1px solid #21262D' }}>
                  <span className="font-mono text-xs" style={{ color: '#58A6FF' }}>
                    Rule #{i + 1}
                  </span>
                  <span className="font-mono text-xs" style={{ color: '#484F58' }}>
                    {cap.tag}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
