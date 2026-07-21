export default function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${onClick ? 'cursor-pointer transition-colors hover:bg-gray-50 hover:border-primary-200' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
