function formatDay(isoDate) {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export function formatPeriodLabel(period) {
  if (!period) return ''
  const start = new Date(`${period.start}T00:00:00`)
  let end
  if (period.end) {
    end = new Date(`${period.end}T00:00:00`)
  } else {
    // período em curso: estima o fim (~1 mês) para que o rótulo não mude a meio do período
    end = new Date(start)
    end.setMonth(end.getMonth() + 1)
    end.setDate(end.getDate() - 1)
  }
  const midpoint = new Date((start.getTime() + end.getTime()) / 2)
  return MONTHS_PT[midpoint.getMonth()]
}

export function formatPeriodShort(period) {
  if (!period) return ''
  const [, month, day] = period.start.split('-')
  return `${day}/${month}`
}
