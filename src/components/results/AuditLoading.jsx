export default function AuditLoading() {
  const steps = [
    'Analysing your AI stack…',
    'Running 12 audit rules…',
    'Calculating savings…',
    'Generating insights…',
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">

      {/* Animated logo */}
      <div className="relative mb-10">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #388BFD, #2DD4BF)', boxShadow: '0 0 40px rgba(88,166,255,0.3)' }}>
          <span className="text-3xl">⚡</span>
        </div>
        {/* Orbiting ring */}
        <div className="absolute inset-0 rounded-3xl border-2 animate-spin"
          style={{ borderColor: 'rgba(88,166,255,0.3)', borderTopColor: '#58A6FF', animationDuration: '1.5s' }} />
      </div>

      {/* Skeleton placeholders */}
      <div className="w-full max-w-2xl space-y-4 animate-pulse">
        <div className="h-8 rounded-xl mx-auto w-2/3" style={{ background: '#21262D' }} />
        <div className="h-4 rounded-lg mx-auto w-1/2" style={{ background: '#1C2128' }} />

        <div className="grid grid-cols-3 gap-4 mt-8">
          {[1,2,3].map(i => (
            <div key={i} className="h-28 rounded-2xl" style={{ background: '#161B22' }} />
          ))}
        </div>

        <div className="space-y-3 mt-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 rounded-xl" style={{ background: '#161B22', opacity: 1 - i * 0.2 }} />
          ))}
        </div>
      </div>

      {/* Cycling status messages */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-2xl"
        style={{ background: 'rgba(22,27,34,0.95)', border: '1px solid #30363D', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#58A6FF', animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
        <span className="font-body text-sm" style={{ color: '#8B949E' }}>
          Analysing your AI stack…
        </span>
      </div>
    </div>
  )
}
