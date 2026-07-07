import { TRANSACTION_TYPES } from '../../utils/categoryTypes.js'
import { CURRENCIES } from '../../utils/currency.js'
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

  function handleCustomDate(field, value) {
    update({ period_start: '', [field]: value })
  }

  const availableCategories = filters.type
    ? categories.filter((c) => c.types.includes(filters.type))
    : categories

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Período</label>
        <select value={filters.period_start} onChange={handlePeriodSelect} className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm">
          <option value="">Todos</option>
          {periods.map((p) => (
            <option key={p.start} value={p.start}>{formatPeriodLabel(p)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">De</label>
        <input
          type="date"
          value={filters.start_date}
          onChange={(e) => handleCustomDate('start_date', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Até</label>
        <input
          type="date"
          value={filters.end_date}
          onChange={(e) => handleCustomDate('end_date', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
        />
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
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Moeda</label>
        <select value={filters.currency} onChange={(e) => update({ currency: e.target.value })} className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm">
          <option value="">Todas</option>
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.code}</option>
          ))}
        </select>
      </div>
      <div className="col-span-2 md:col-span-3 lg:col-span-7">
        <label className="block text-xs font-medium text-gray-500 mb-1">Pesquisar descrição</label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="ex: supermercado"
          className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
    </div>
  )
}
