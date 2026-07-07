export const INVESTMENT_TYPES = [
  { value: 'renda_fixa', label: 'Renda Fixa' },
  { value: 'acoes', label: 'Ações' },
  { value: 'fundos', label: 'Fundos' },
  { value: 'cripto', label: 'Cripto' },
  { value: 'imobiliario', label: 'Imobiliário' },
  { value: 'outro', label: 'Outro' },
]

export const INVESTMENT_TYPE_LABEL = Object.fromEntries(INVESTMENT_TYPES.map((t) => [t.value, t.label]))

export const INVESTMENT_TYPE_COLOR = {
  renda_fixa: '#0ea5e9',
  acoes: '#8b5cf6',
  fundos: '#22c55e',
  cripto: '#f97316',
  imobiliario: '#eab308',
  outro: '#64748b',
}
