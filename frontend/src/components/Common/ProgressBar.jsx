export default function ProgressBar({ percent, excessText }) {
  const value = percent || 0
  const clamped = Math.max(0, Math.min(100, value))

  let color = 'bg-green-500'
  if (clamped >= 88) color = 'bg-red-500'
  else if (clamped >= 46) color = 'bg-blue-500'

  return (
    <div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${clamped}%` }} />
      </div>
      {value > 100 && excessText && <p className="text-xs text-red-600 mt-1">{excessText}</p>}
    </div>
  )
}
