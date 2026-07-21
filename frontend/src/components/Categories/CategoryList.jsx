import { TYPE_LABEL } from '../../utils/categoryTypes.js'
import CategoryAvatar from '../Common/CategoryAvatar.jsx'

export default function CategoryList({ categories, onEdit, onDelete }) {
  if (categories.length === 0) {
    return <p className="text-sm text-gray-400">Nenhuma categoria cadastrada.</p>
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <CategoryAvatar category={cat} size="sm" />
            <span className="text-sm font-medium text-gray-900">{cat.name}</span>
            <div className="flex gap-1">
              {cat.types.map((t) => (
                <span key={t} className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                  {TYPE_LABEL[t] || t}
                </span>
              ))}
              {cat.is_salary && (
                <span className="text-xs text-primary-700 bg-primary-50 rounded-full px-2 py-0.5">Salário</span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => onEdit(cat)} className="text-xs text-primary-600 hover:text-primary-700">
              Editar
            </button>
            <button onClick={() => onDelete(cat.id)} className="text-xs text-red-500 hover:text-red-700">
              Remover
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
