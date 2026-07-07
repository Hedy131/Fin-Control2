function formatDay(isoDate) {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

export function formatPeriodLabel(period) {
  if (!period) return ''
  const start = formatDay(period.start)
  const end = period.end ? formatDay(period.end) : 'presente'
  return `${start} - ${end}`
}

export function formatPeriodShort(period) {
  if (!period) return ''
  const [, month, day] = period.start.split('-')
  return `${day}/${month}`
}
