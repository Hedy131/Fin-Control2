import { TRANSACTION_TYPES } from '../../utils/categoryTypes.js'
import { formatPeriodLabel } from '../../utils/period.js'

export default function TransactionFilters({ accounts, categories, periods, filters, onChange }) {
  function update(patch) {
    onChange({ ...filters, ...patch })
  }

  function handlePeriodSelect(e) {
    const startValue = e.target.value
    if (!startValue) {
      update({ period_start: '', start_date: '', end_date: '' })
      return
    }
    const period = periods.find((p) => p.start === startValue)
    update({ period_start: startValue, start_date: period.start, end_date: period.end || '' })
  }

  const availableCategories = filters.type
    ? categories.filter((c) => c.types.includes(filters.type))
    : categories

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Período</label>
        <select value={filters.period_start} onChange={handlePeriodSelect} className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm">
          {periods.map((p) => (
            <option key={p.start} value={p.start}>{formatPeriodLabel(p)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Conta</label>
        <select value={filters.account_id} onChange={(e) => update({ account_id: e.target.value })} className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm">
          <option value="">Todas</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Categoria</label>
        <select value={filters.category_id} onChange={(e) => update({ category_id: e.target.value })} className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm">
          <option value="">Todas</option>
          {availableCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
        <select value={filters.type} onChange={(e) => update({ type: e.target.value, category_id: '' })} className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm">
          <option value="">Todos</option>
          {TRANSACTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
