import { createContext, useContext, useState } from 'react'

export const CURRENCIES = [
  { code: 'USD', symbol: '$',  label: 'US Dollar',      rate: 1 },
  { code: 'EUR', symbol: '€',  label: 'Euro',            rate: 0.92 },
  { code: 'GBP', symbol: '£',  label: 'British Pound',  rate: 0.79 },
  { code: 'INR', symbol: '₹',  label: 'Indian Rupee',   rate: 83.5 },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar', rate: 1.36 },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar', rate: 1.53 },
]

const CurrencyContext = createContext(null)

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('spendlens_currency')
    return CURRENCIES.find(c => c.code === saved) || CURRENCIES[0]
  })

  function changeCurrency(code) {
    const found = CURRENCIES.find(c => c.code === code)
    if (found) {
      setCurrency(found)
      localStorage.setItem('spendlens_currency', code)
    }
  }

  // Convert USD amount to selected currency
  function convert(usdAmount) {
    return usdAmount * currency.rate
  }

  // Format a USD amount in selected currency
  function format(usdAmount, opts = {}) {
    const converted = convert(usdAmount)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: opts.decimals ?? 0,
      maximumFractionDigits: opts.decimals ?? 0,
    }).format(converted)
  }

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, convert, format, currencies: CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider')
  return ctx
}
