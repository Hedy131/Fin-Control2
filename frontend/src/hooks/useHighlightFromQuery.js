import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function useHighlightFromQuery(paramName = 'highlight') {
  const [searchParams] = useSearchParams()
  const raw = searchParams.get(paramName)
  const targetId = raw ? Number(raw) : null
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    if (!targetId) return
    setActiveId(targetId)
    const el = document.getElementById(`hl-${targetId}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const timer = setTimeout(() => setActiveId(null), 2500)
    return () => clearTimeout(timer)
  }, [targetId])

  return activeId
}
