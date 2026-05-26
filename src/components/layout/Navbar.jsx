import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Zap, ChevronDown } from 'lucide-react'
import { useCurrency, CURRENCIES } from '../../context/CurrencyContext'

export default function Navbar() {
  const [open, setOpen]         = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showCurrency, setShowCurrency] = useState(false)
  const { pathname }            = useLocation()
  const { currency, changeCurrency } = useCurrency()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setOpen(false); setShowCurrency(false) }, [pathname])

  const bg    = 'rgba(13,17,23,0.92)'
  const border = '#21262D'
  const textPrimary = '#E6EDF3'
  const textMuted   = '#8B949E'

  const navLinks = [
    { label: 'Compare',    to: '/compare' },
    { label: 'ROI Calc',  to: '/calculator' },
    { label: 'Benchmarks', to: '/benchmarks' },
  ]

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? bg : 'transparent',
        borderBottom: scrolled ? `1px solid ${border}` : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        padding: scrolled ? '10px 0' : '18px 0',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #388BFD, #58A6FF)', boxShadow: '0 2px 8px rgba(88,166,255,0.3)' }}>
              <Zap size={15} className="text-white fill-white" />
            </div>
            <span className="font-display font-bold text-lg" style={{ color: textPrimary, letterSpacing: '-0.01em' }}>
              Spend<span style={{ color: '#58A6FF' }}>Lens</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(link => (
              <Link key={link.label} to={link.to}
                className="px-4 py-2 text-sm rounded-lg transition-all duration-200 font-body font-medium"
                style={{
                  color: pathname === link.to ? '#58A6FF' : textMuted,
                  background: pathname === link.to ? 'rgba(88,166,255,0.08)' : 'transparent',
                }}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">

            {/* Currency picker */}
            <div className="relative">
              <button
                onClick={() => setShowCurrency(s => !s)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-mono transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${border}`, color: textMuted }}>
                {currency.symbol} {currency.code}
                <ChevronDown size={12} />
              </button>

              {showCurrency && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden shadow-2xl z-50"
                  style={{ background: '#161B22', border: `1px solid ${border}` }}>
                  {CURRENCIES.map(c => (
                    <button key={c.code}
                      onClick={() => { changeCurrency(c.code); setShowCurrency(false) }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all text-left"
                      style={{
                        background: currency.code === c.code ? 'rgba(88,166,255,0.08)' : 'transparent',
                        color: currency.code === c.code ? '#58A6FF' : textMuted,
                      }}>
                      <span className="font-body">{c.label}</span>
                      <span className="font-mono text-xs">{c.symbol} {c.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link to="/audit" className="btn-primary text-xs py-2.5 px-5">
              Start Free Audit
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg transition-all"
            style={{ color: textMuted }}
            onClick={() => setOpen(o => !o)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden mt-4 pb-4 animate-fade-up" style={{ borderTop: `1px solid ${border}` }}>
            <nav className="flex flex-col gap-1 mt-4">
              {navLinks.map(link => (
                <Link key={link.label} to={link.to}
                  className="px-4 py-3 text-sm rounded-xl font-body font-medium transition-all"
                  style={{ color: pathname === link.to ? '#58A6FF' : textMuted }}
                  onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              ))}

              {/* Mobile controls */}
              <div className="flex items-center gap-2 px-4 py-3">
                <select value={currency.code}
                  onChange={e => changeCurrency(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-mono"
                  style={{ background: '#161B22', border: `1px solid ${border}`, color: textMuted, colorScheme: 'dark' }}>
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                  ))}
                </select>
              </div>

              <Link to="/audit" className="btn-primary mt-2 mx-4 justify-center"
                onClick={() => setOpen(false)}>
                Start Free Audit
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Click outside to close currency dropdown */}
      {showCurrency && (
        <div className="fixed inset-0 z-40" onClick={() => setShowCurrency(false)} />
      )}
    </header>
  )
}
