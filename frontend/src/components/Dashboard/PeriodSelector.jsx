import { useEffect, useState } from 'react'
import { listPeriods } from '../../api/periods.js'
import { formatPeriodLabel } from '../../utils/period.js'

const PRESETS = [
  { value: 'month', label: 'Este mês' },
  { value: 'last_month', label: 'Mês passado' },
  { value: 'year', label: 'Este ano' },
]

export default function PeriodSelector({ value, onChange }) {
  const [periods, setPeriods] = useState([])

  useEffect(() => {
    listPeriods(24).then(setPeriods)
  }, [])

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex bg-gray-100 rounded-full p-1">
        {PRESETS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ type: 'preset', value: opt.value })}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition ${
              value.type === 'preset' && value.value === opt.value
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <select
        value={value.type === 'period' ? value.value : ''}
        onChange={(e) => e.target.value && onChange({ type: 'period', value: e.target.value })}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 bg-white"
      >
        <option value="">Escolher mês…</option>
        {[...periods].reverse().map((p) => (
          <option key={p.start} value={p.start}>
            {formatPeriodLabel(p)} {p.start.slice(0, 4)}
          </option>
        ))}
      </select>
      <select
        value={value.type === 'year' ? value.value : ''}
        onChange={(e) => e.target.value && onChange({ type: 'year', value: parseInt(e.target.value, 10) })}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 bg-white"
      >
        <option value="">Escolher ano…</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  )
}
