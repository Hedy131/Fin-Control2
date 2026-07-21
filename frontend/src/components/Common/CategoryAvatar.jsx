import { getCategoryIcon } from '../../utils/categoryIcons.js'

function initialsFrom(text) {
  if (!text) return '?'
  const words = text.trim().split(/\s+/).slice(0, 2)
  return words.map((w) => w[0]?.toUpperCase() || '').join('') || '?'
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
}

export default function CategoryAvatar({ category, description, size = 'md' }) {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md

  if (category) {
    const Icon = getCategoryIcon(category.icon)
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full shrink-0 ${sizeClass}`}
        style={{ backgroundColor: category.color || '#6366f1' }}
      >
        <Icon size={size === 'sm' ? 14 : 18} className="text-white" strokeWidth={2} />
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full shrink-0 bg-gray-200 text-gray-600 font-semibold ${sizeClass}`}
    >
      {initialsFrom(description)}
    </span>
  )
}
