import { useEffect, useState, useCallback, useRef } from 'react'
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
import ExportPanel from '../components/Transactions/ExportPanel.jsx'
import Loading from '../components/Common/Loading.jsx'
import { useNotifications } from '../context/NotificationContext.jsx'
import { usePeriodContext } from '../context/PeriodContext.jsx'

const EMPTY_FILTERS = {
  account_id: '',
  category_id: '',
  type: '',
  period_start: '',
  start_date: '',
  end_date: '',
  search: '',
}

export default function Transactions() {
  const [searchParams] = useSearchParams()
  const { recheckBudgets } = useNotifications() || {}
  const { periodStart: sharedPeriodStart, periodEnd: sharedPeriodEnd, setResolvedPeriod } = usePeriodContext()
  const [transactions, setTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [periods, setPeriods] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(() => {
    const categoryId = searchParams.get('category_id')
    const periodStart = searchParams.get('period_start')
    const periodEnd = searchParams.get('period_end')
    const search = searchParams.get('search')
    return {
      ...EMPTY_FILTERS,
      ...(categoryId ? { category_id: categoryId } : {}),
      ...(periodStart ? { period_start: periodStart, start_date: periodStart, end_date: periodEnd || '' } : {}),
      ...(search ? { search } : {}),
    }
  })
  const [showForm, setShowForm] = useState(false)
  const [formInitialValues, setFormInitialValues] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [importStep, setImportStep] = useState(null) // null | 'upload' | 'review'
  const [importRows, setImportRows] = useState([])
  const [showExport, setShowExport] = useState(false)
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const duplicateIds = useRef(
    (searchParams.get('duplicate_ids') || '')
      .split(',')
      .map(Number)
      .filter((n) => !Number.isNaN(n))
  ).current
  const appliedDuplicateSelectionRef = useRef(false)

  const refreshTransactions = useCallback(() => {
    const { account_id, category_id, type, start_date, end_date, search } = filters
    const params = {}
    if (account_id) params.account_id = account_id
    if (category_id) params.category_id = category_id
    if (type) params.type = type
    if (start_date) params.start_date = start_date
    if (end_date) params.end_date = end_date
    if (search) params.search = search

    listTransactions(params).then((t) => {
      setTransactions(t)
      if (!appliedDuplicateSelectionRef.current && duplicateIds.length > 0) {
        appliedDuplicateSelectionRef.current = true
        setSelectedIds(new Set(t.filter((tx) => duplicateIds.includes(tx.id)).map((tx) => tx.id)))
      } else {
        setSelectedIds(new Set())
      }
    })
  }, [filters])

  useEffect(() => {
    setLoading(true)
    Promise.all([listAccounts(), listCategories(), listPeriods(12)])
      .then(([a, c, p]) => {
        setAccounts(a)
        setCategories(c)
        setPeriods(p)
        // carry over whatever period was last selected on the Painel/outra página, falling
        // back to the current period only if nothing was ever selected anywhere
        const fallback = sharedPeriodStart
          ? { start: sharedPeriodStart, end: sharedPeriodEnd || '' }
          : p[p.length - 1]
        if (fallback) {
          setFilters((f) =>
            // a search coming from the global search bar should look across all periods,
            // not just default to the current one
            f.period_start || f.search
              ? f
              : { ...f, period_start: fallback.start, start_date: fallback.start, end_date: fallback.end || '' }
          )
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refreshTransactions()
  }, [refreshTransactions])

  useEffect(() => {
    if (filters.start_date) setResolvedPeriod(filters.start_date, filters.end_date || null)
  }, [filters.start_date, filters.end_date])

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
    setShowExport(false)
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
    setShowExport(false)
    setImportRows([])
    setImportStep('upload')
  }

  function closeImport() {
    setImportStep(null)
    setImportRows([])
  }

  function openExport() {
    closeForm()
    closeImport()
    setShowExport(true)
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
            onClick={() => (showExport ? setShowExport(false) : openExport())}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700"
          >
            {showExport ? 'Fechar' : 'Exportar'}
          </button>
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
      {showExport && <ExportPanel filters={filters} onCancel={() => setShowExport(false)} />}
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
