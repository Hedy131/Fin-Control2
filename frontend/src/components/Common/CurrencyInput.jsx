import { useState, useEffect } from 'react'

function centsToDisplay(cents) {
  return (cents / 100).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function CurrencyInput({ value, onChange, required, className, placeholder }) {
  const [cents, setCents] = useState(() => Math.round((Number(value) || 0) * 100))

  useEffect(() => {
    const next = Math.round((Number(value) || 0) * 100)
    setCents((current) => (current === next ? current : next))
  }, [value])

  function handleChange(e) {
    const digits = e.target.value.replace(/\D/g, '')
    const nextCents = digits ? parseInt(digits, 10) : 0
    setCents(nextCents)
    onChange(nextCents / 100)
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      required={required}
      placeholder={placeholder || '0,00'}
      value={cents === 0 ? '' : centsToDisplay(cents)}
      onChange={handleChange}
      className={
        className ||
        'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
      }
    />
  )
}
