export function extractErrorMessage(err, fallback) {
  const detail = err?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((d) => (typeof d === 'string' ? d : d?.msg || JSON.stringify(d))).join('; ')
  }
  if (detail && typeof detail === 'object') {
    return detail.msg || JSON.stringify(detail)
  }
  return fallback
}
