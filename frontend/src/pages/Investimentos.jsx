import { useEffect, useState } from 'react'
import { listInvestmentPositions } from '../api/investments.js'
import { listCategories } from '../api/categories.js'
import InvestmentList from '../components/Investments/InvestmentList.jsx'
import AllocationChart from '../components/Investments/AllocationChart.jsx'
import TotalsBar from '../components/Investments/TotalsBar.jsx'
import CurrencyConverter from '../components/Investments/CurrencyConverter.jsx'
import Loading from '../components/Common/Loading.jsx'

export default function Investimentos() {
  const [positions, setPositions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([listInvestmentPositions(), listCategories()])
      .then(([p, c]) => {
        setPositions(p)
        setCategories(c)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Investimentos</h2>
      {categories.filter((c) => c.types.includes('investment')).length === 0 && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Cadastre uma categoria de investimento (em Categorias) para ela aparecer aqui.
        </p>
      )}
      <p className="text-xs text-gray-400">
        As posições vêm das categorias de investimento e das transações lançadas nelas — para investir, lance uma
        transação de investimento; para registar juros/dividendos, lance uma receita na mesma categoria. A moeda
        segue a da conta usada.
      </p>
      <TotalsBar positions={positions} />
      <CurrencyConverter />
      {positions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Alocação por Categoria</h3>
          <AllocationChart positions={positions} categories={categories} />
        </div>
      )}
      <InvestmentList positions={positions} categories={categories} />
    </div>
  )
}
