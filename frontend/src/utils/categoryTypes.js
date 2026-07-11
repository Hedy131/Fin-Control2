export const TRANSACTION_TYPES = [
  { value: 'expense', label: 'Despesa' },
  { value: 'income', label: 'Receita' },
  { value: 'investment', label: 'Investimento' },
  { value: 'transfer', label: 'Transferência' },
  { value: 'savings', label: 'Poupança' },
]

export const TYPE_LABEL = Object.fromEntries(TRANSACTION_TYPES.map((t) => [t.value, t.label]))

export const TYPE_COLOR = {
  income: 'text-green-600',
  expense: 'text-red-600',
  investment: 'text-blue-600',
  transfer: 'text-gray-500',
  savings: 'text-emerald-600',
}
