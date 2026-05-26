/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0D1117',
          soft:    '#161B22',
          muted:   '#21262D',
          light:   '#30363D',
        },
        brand: {
          DEFAULT: '#58A6FF',
          dim:     '#388BFD',
          pale:    '#A5D6FF',
          glow:    'rgba(88,166,255,0.25)',
        },
        teal: {
          DEFAULT: '#2DD4BF',
          dim:     '#14B8A6',
          pale:    '#99F6E4',
        },
        ivory: {
          DEFAULT: '#E6EDF3',
          muted:   '#8B949E',
          faint:   '#484F58',
        },
      },
      animation: {
        'fade-up':      'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in':      'fadeIn 0.5s ease forwards',
        'slide-in':     'slideIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'pulse-brand':  'pulseBrand 2.5s ease-in-out infinite',
        'float':        'float 7s ease-in-out infinite',
        'float-slow':   'float 10s ease-in-out infinite',
        'shimmer':      'shimmer 2.5s linear infinite',
        'spin-slow':    'spin 8s linear infinite',
        'bounce-soft':  'bounceSoft 2s ease-in-out infinite',
        'scale-in':     'scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-right':  'slideRight 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'counter':      'counter 1s ease-out forwards',
        'glow-pulse':   'glowPulse 3s ease-in-out infinite',
        'draw':         'draw 1.5s ease forwards',
      },
      keyframes: {
        fadeUp:    { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn:   { from: { opacity: 0, transform: 'translateX(-16px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        slideRight:{ from: { opacity: 0, transform: 'translateX(16px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        scaleIn:   { from: { opacity: 0, transform: 'scale(0.92)' }, to: { opacity: 1, transform: 'scale(1)' } },
        pulseBrand:{ '0%,100%': { boxShadow: '0 0 0 0 rgba(88,166,255,0.25)' }, '50%': { boxShadow: '0 0 0 10px rgba(88,166,255,0)' } },
        float:     { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
        bounceSoft:{ '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        glowPulse: { '0%,100%': { opacity: 0.4 }, '50%': { opacity: 0.9 } },
        draw:      { from: { strokeDashoffset: 1000 }, to: { strokeDashoffset: 0 } },
      },
    },
  },
  plugins: [],
}
