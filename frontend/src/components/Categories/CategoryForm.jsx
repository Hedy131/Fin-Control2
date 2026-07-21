import { useState, useEffect } from 'react'
import { TRANSACTION_TYPES } from '../../utils/categoryTypes.js'
import { CATEGORY_ICON_OPTIONS, getCategoryIcon } from '../../utils/categoryIcons.js'

export default function CategoryForm({ initialValues, onSubmit, onCancel }) {
  const [name, setName] = useState(initialValues?.name || '')
  const [types, setTypes] = useState(initialValues?.types || ['expense'])
  const [isSalary, setIsSalary] = useState(initialValues?.is_salary || false)
  const [color, setColor] = useState(initialValues?.color || '#6366f1')
  const [icon, setIcon] = useState(initialValues?.icon || 'tag')

  useEffect(() => {
    if (!types.includes('income') && isSalary) setIsSalary(false)
  }, [types, isSalary])

  function toggleType(value) {
    setTypes((current) =>
      current.includes(value) ? current.filter((t) => t !== value) : [...current, value]
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (types.length === 0) return
    onSubmit({ name, types, is_salary: isSalary, color, icon })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipos</label>
        <div className="flex flex-wrap gap-3">
          {TRANSACTION_TYPES.map((t) => (
            <label key={t.value} className="flex items-center gap-1.5 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={types.includes(t.value)}
                onChange={() => toggleType(t.value)}
                className="rounded border-gray-300"
              />
              {t.label}
            </label>
          ))}
        </div>
        {types.length === 0 && <p className="text-xs text-red-500 mt-1">Escolha pelo menos um tipo.</p>}
      </div>
      {types.includes('income') && (
        <div>
          <label className="flex items-center gap-1.5 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isSalary}
              onChange={(e) => setIsSalary(e.target.checked)}
              className="rounded border-gray-300"
            />
            É salário (define o início do mês financeiro)
          </label>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-16 h-10 rounded-lg border border-gray-300" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
        <div className="grid grid-cols-8 gap-2">
          {CATEGORY_ICON_OPTIONS.map((opt) => {
            const Icon = getCategoryIcon(opt.value)
            const active = icon === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                title={opt.label}
                onClick={() => setIcon(opt.value)}
                className={`flex items-center justify-center h-9 rounded-lg border transition-colors ${
                  active ? 'text-white' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
                style={active ? { backgroundColor: color, borderColor: color } : undefined}
              >
                <Icon size={16} />
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-300">Cancelar</button>
        <button type="submit" disabled={types.length === 0} className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white disabled:opacity-50">Salvar</button>
      </div>
    </form>
  )
}
