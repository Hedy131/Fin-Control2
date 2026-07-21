import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkDeleteTransactions,
  bulkUpdateTransactions,
} from '../api/transactions.js'
import { listAccounts } from '../api/accounts.js'
import { listCategories } from '../api/categories.js'
import { listPeriods } from '../api/periods.js'
import TransactionForm from '../components/Transactions/TransactionForm.jsx'
import TransactionList from '../components/Transactions/TransactionList.jsx'
import TransactionFilters from '../components/Transactions/TransactionFilters.jsx'
import BulkEditBar from '../components/Transactions/BulkEditBar.jsx'
import ImportForm from '../components/Transactions/ImportForm.jsx'
import ImportReview from '../components/Transactions/ImportReview.jsx'
import Loading from '../components/Common/Loading.jsx'
import { useNotifications } from '../context/NotificationContext.jsx'

const EMPTY_FILTERS = {
  account_id: '',
  category_id: '',
  type: '',
  period_start: '',
  start_date: '',
  end_date: '',
}

export default function Transactions() {
  const [searchParams] = useSearchParams()
  const { recheckBudgets } = useNotifications() || {}
  const [transactions, setTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [periods, setPeriods] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(() => {
    const categoryId = searchParams.get('category_id')
    const periodStart = searchParams.get('period_start')
    const periodEnd = searchParams.get('period_end')
    return {
      ...EMPTY_FILTERS,
      ...(categoryId ? { category_id: categoryId } : {}),
      ...(periodStart ? { period_start: periodStart, start_date: periodStart, end_date: periodEnd || '' } : {}),
    }
  })
  const [showForm, setShowForm] = useState(false)
  const [formInitialValues, setFormInitialValues] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [importStep, setImportStep] = useState(null) // null | 'upload' | 'review'
  const [importRows, setImportRows] = useState([])
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  const refreshTransactions = useCallback(() => {
    const { account_id, category_id, type, start_date, end_date } = filters
    const params = {}
    if (account_id) params.account_id = account_id
    if (category_id) params.category_id = category_id
    if (type) params.type = type
    if (start_date) params.start_date = start_date
    if (end_date) params.end_date = end_date

    listTransactions(params).then((t) => {
      setTransactions(t)
      setSelectedIds(new Set())
    })
  }, [filters])

  useEffect(() => {
    setLoading(true)
    Promise.all([listAccounts(), listCategories(), listPeriods(12)])
      .then(([a, c, p]) => {
        setAccounts(a)
        setCategories(c)
        setPeriods(p)
        const current = p[p.length - 1]
        if (current) {
          setFilters((f) =>
            f.period_start ? f : { ...f, period_start: current.start, start_date: current.start, end_date: current.end || '' }
          )
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refreshTransactions()
  }, [refreshTransactions])

  function toggleSelect(id) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll(checked) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (checked) transactions.forEach((t) => next.add(t.id))
      else transactions.forEach((t) => next.delete(t.id))
      return next
    })
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return
    if (!confirm(`Remover ${selectedIds.size} transações selecionadas?`)) return
    await bulkDeleteTransactions(Array.from(selectedIds))
    refreshTransactions()
    recheckBudgets?.()
  }

  async function handleBulkUpdate(payload) {
    await bulkUpdateTransactions({ ids: Array.from(selectedIds), ...payload })
    refreshTransactions()
    recheckBudgets?.()
  }

  function openCreateForm() {
    closeImport()
    setFormInitialValues(null)
    setEditingId(null)
    setShowForm(true)
  }

  function openEditForm(tx) {
    closeImport()
    setFormInitialValues(tx)
    setEditingId(tx.id)
    setShowForm(true)
  }

  function openDuplicateForm(tx) {
    closeImport()
    setFormInitialValues({ ...tx, date: new Date().toISOString().slice(0, 10), time: null })
    setEditingId(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setFormInitialValues(null)
    setEditingId(null)
  }

  async function handleSubmit(payload) {
    if (editingId) {
      await updateTransaction(editingId, payload)
    } else {
      await createTransaction(payload)
    }
    closeForm()
    refreshTransactions()
    recheckBudgets?.()
  }

  async function handleDelete(id) {
    if (!confirm('Remover esta transação?')) return
    await deleteTransaction(id)
    refreshTransactions()
    recheckBudgets?.()
  }

  function openImport() {
    closeForm()
    setImportRows([])
    setImportStep('upload')
  }

  function closeImport() {
    setImportStep(null)
    setImportRows([])
  }

  function handleExtracted(rows) {
    setImportRows(rows)
    setImportStep('review')
  }

  function handleImported() {
    closeImport()
    refreshTransactions()
    recheckBudgets?.()
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Transações</h2>
        <div className="flex gap-2">
          <button
            onClick={() => (importStep ? closeImport() : openImport())}
            disabled={accounts.length === 0}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50"
          >
            {importStep ? 'Fechar' : 'Upload'}
          </button>
          <button
            onClick={() => (showForm ? closeForm() : openCreateForm())}
            disabled={accounts.length === 0}
            className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white disabled:opacity-50"
          >
            {showForm ? 'Fechar' : 'Nova Transação'}
          </button>
        </div>
      </div>
      {accounts.length === 0 && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Cadastre uma conta antes de lançar transações.
        </p>
      )}
      {showForm && editingId === null && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 max-w-md">
          <TransactionForm
            accounts={accounts}
            categories={categories}
            initialValues={formInitialValues}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        </div>
      )}
      {importStep === 'upload' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 max-w-md">
          <ImportForm onExtracted={handleExtracted} onCancel={closeImport} />
        </div>
      )}
      {importStep === 'review' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <ImportReview
            rows={importRows}
            accounts={accounts}
            categories={categories}
            onImported={handleImported}
            onCancel={closeImport}
          />
        </div>
      )}
      <TransactionFilters accounts={accounts} categories={categories} periods={periods} filters={filters} onChange={setFilters} />
      <BulkEditBar
        selectedCount={selectedIds.size}
        accounts={accounts}
        categories={categories}
        onApply={handleBulkUpdate}
        onDelete={handleBulkDelete}
      />
      <TransactionList
        transactions={transactions}
        accounts={accounts}
        categories={categories}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onEdit={openEditForm}
        onDuplicate={openDuplicateForm}
        onDelete={handleDelete}
        editingId={editingId}
        editInitialValues={formInitialValues}
        onEditSubmit={handleSubmit}
        onEditCancel={closeForm}
      />
    </div>
  )
}
