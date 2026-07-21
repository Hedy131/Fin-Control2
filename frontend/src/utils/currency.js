export const CURRENCIES = [
  { code: 'AOA', label: 'Kwanza (Kz)' },
  { code: 'USD', label: 'Dolar (US$)' },
  { code: 'EUR', label: 'Euro (EUR)' },
]

const LOCALE_BY_CURRENCY = { AOA: 'pt-AO', USD: 'en-US', EUR: 'pt-PT' }

export function formatCurrency(amount, currencyCode = 'AOA') {
  const locale = LOCALE_BY_CURRENCY[currencyCode] || 'pt-PT'
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(amount || 0)
  } catch {
    return `${(amount || 0).toFixed(2)} ${currencyCode}`
  }
}

export function currencyLabel(currencyCode) {
  return CURRENCIES.find((c) => c.code === currencyCode)?.label || currencyCode
}

const CURRENCY_ORDER = ['AOA', 'USD', 'EUR', 'BRL', 'CNY', 'JPY', 'ZAR', 'NAD', 'MZN', 'CHF']

export function sortCurrencies(currencies) {
  return [...currencies].sort((a, b) => {
    const ai = CURRENCY_ORDER.indexOf(a)
    const bi = CURRENCY_ORDER.indexOf(b)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })
}
