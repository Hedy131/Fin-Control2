import { createContext, useContext, useState } from 'react'

const PeriodContext = createContext(null)

export function PeriodProvider({ children }) {
  // In-memory only (not persisted): the goal is to stop re-asking for a period when
  // navigating between pages within the same visit, not to pin an old month forever
  // across days/sessions once "the current period" has naturally moved on.
  const [dashboardSelector, setDashboardSelector] = useState({ type: 'preset', value: 'month' })
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState(null)

  function setResolvedPeriod(start, end) {
    setPeriodStart(start || '')
    setPeriodEnd(end ?? null)
  }

  return (
    <PeriodContext.Provider
      value={{ dashboardSelector, setDashboardSelector, periodStart, periodEnd, setResolvedPeriod }}
    >
      {children}
    </PeriodContext.Provider>
  )
}

export function usePeriodContext() {
  return useContext(PeriodContext)
}
