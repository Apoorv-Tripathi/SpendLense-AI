import { useEffect, useRef, useState } from 'react'

export default function SpendHealthGauge({ score, mood }) {
  const [animated, setAnimated] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setTimeout(() => setAnimated(true), 200) },
      { threshold: 0.3 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  // SVG arc gauge (semicircle, 180°)
  const W = 200, H = 110, cx = 100, cy = 100, r = 80
  const startAngle = -180
  const endAngle = 0
  const totalArc = endAngle - startAngle // 180°

  const scoreAngle = startAngle + (animated ? (score / 100) * totalArc : 0)

  // Needle coords
  const needleRad = (scoreAngle * Math.PI) / 180
  const needleX = cx + (r - 12) * Math.cos(needleRad)
  const needleY = cy + (r - 12) * Math.sin(needleRad)

  const gradientId = `gauge-grad-${score}`

  const label = score >= 85 ? 'Excellent' : score >= 65 ? 'Fair' : score >= 40 ? 'At Risk' : 'Critical'

  const colors = {
    excellent: ['#2DD4BF', '#10B981'],
    good:      ['#58A6FF', '#2DD4BF'],
    concerning:['#F0883E', '#D29922'],
    critical:  ['#F85149', '#F0883E'],
  }
  const [c1, c2] = colors[mood] ?? colors.good

  // Arc path helper
  function describeArc(cx, cy, r, startDeg, endDeg) {
    const s = (startDeg * Math.PI) / 180
    const e = (endDeg * Math.PI) / 180
    const x1 = cx + r * Math.cos(s)
    const y1 = cy + r * Math.sin(s)
    const x2 = cx + r * Math.cos(e)
    const y2 = cy + r * Math.sin(e)
    const large = endDeg - startDeg > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
  }

  const animatedEndAngle = startAngle + (animated ? (score / 100) * totalArc : 0)

  return (
    <div ref={ref} className="flex flex-col items-center">
      <svg width={W} height={H + 20} viewBox={`0 0 ${W} ${H + 20}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>

        {/* Track */}
        <path
          d={describeArc(cx, cy, r, -180, 0)}
          fill="none" stroke="#21262D" strokeWidth="12" strokeLinecap="round"
        />

        {/* Zone markers */}
        {[
          { deg: -180, label: '0' },
          { deg: -135, label: '25' },
          { deg: -90,  label: '50' },
          { deg: -45,  label: '75' },
          { deg: 0,    label: '100' },
        ].map(({ deg, label }) => {
          const rad = (deg * Math.PI) / 180
          const tx = cx + (r + 14) * Math.cos(rad)
          const ty = cy + (r + 14) * Math.sin(rad)
          return (
            <text key={deg} x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
              style={{ fontSize: 8, fill: '#484F58', fontFamily: 'JetBrains Mono, monospace' }}>
              {label}
            </text>
          )
        })}

        {/* Colored arc */}
        {animated && (
          <path
            d={describeArc(cx, cy, r, -180, animatedEndAngle)}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="12"
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${c1}60)`,
              transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        )}

        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={animated ? needleX : cx - r + 12}
          y2={animated ? needleY : cy}
          stroke="#E6EDF3" strokeWidth="2" strokeLinecap="round"
          style={{ transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)', transformOrigin: `${cx}px ${cy}px` }}
        />
        <circle cx={cx} cy={cy} r="5" fill="#E6EDF3" />
        <circle cx={cx} cy={cy} r="2.5" fill="#0D1117" />

        {/* Score text */}
        <text x={cx} y={cy - 20} textAnchor="middle"
          style={{ fontSize: 28, fontWeight: 800, fill: '#E6EDF3', fontFamily: 'Syne, sans-serif' }}>
          {score}
        </text>
        <text x={cx} y={cy - 6} textAnchor="middle"
          style={{ fontSize: 10, fill: c1, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>
          {label.toUpperCase()}
        </text>
      </svg>
    </div>
  )
}
