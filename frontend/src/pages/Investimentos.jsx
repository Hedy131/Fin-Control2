import { useEffect, useState } from 'react'
import {
  listInvestmentPositions,
  createInvestmentPosition,
  updateInvestmentPosition,
  deleteInvestmentPosition,
} from '../api/investments.js'
import InvestmentForm from '../components/Investments/InvestmentForm.jsx'
import InvestmentList from '../components/Investments/InvestmentList.jsx'
import AllocationChart from '../components/Investments/AllocationChart.jsx'
import TotalsBar from '../components/Investments/TotalsBar.jsx'
import Loading from '../components/Common/Loading.jsx'

export default function Investimentos() {
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPosition, setEditingPosition] = useState(null)

  function refresh() {
    setLoading(true)
    listInvestmentPositions().then(setPositions).finally(() => setLoading(false))
  }

  useEffect(refresh, [])

  async function handleCreate(payload) {
    await createInvestmentPosition(payload)
    setShowForm(false)
    refresh()
  }

  async function handleUpdate(payload) {
    await updateInvestmentPosition(editingPosition.id, payload)
    setEditingPosition(null)
    refresh()
  }

  async function handleUpdateValue(id, currentValue) {
    await updateInvestmentPosition(id, { current_value: currentValue })
    refresh()
  }

  async function handleDelete(id) {
    if (!confirm('Remover esta posição de investimento?')) return
    await deleteInvestmentPosition(id)
    refresh()
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Investimentos</h2>
        <button
          onClick={() => {
            setEditingPosition(null)
            setShowForm(!showForm)
          }}
          className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white"
        >
          {showForm ? 'Fechar' : 'Novo Investimento'}
        </button>
      </div>
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 max-w-md">
          <InvestmentForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}
      {editingPosition && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 max-w-md">
          <InvestmentForm
            initialValues={editingPosition}
            onSubmit={handleUpdate}
            onCancel={() => setEditingPosition(null)}
          />
        </div>
      )}
      <TotalsBar positions={positions} />
      {positions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Alocação por Tipo</h3>
          <AllocationChart positions={positions} />
        </div>
      )}
      <InvestmentList
        positions={positions}
        onEdit={setEditingPosition}
        onUpdateValue={handleUpdateValue}
        onDelete={handleDelete}
      />
    </div>
  )
}
