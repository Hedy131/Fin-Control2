import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  listTransactions,
  getTransactionsSummary,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../api/transactions.js'
import { listAccounts } from '../api/accounts.js'
import { listCategories } from '../api/categories.js'
import { listPeriods } from '../api/periods.js'
import TransactionForm from '../components/Transactions/TransactionForm.jsx'
import TransactionList from '../components/Transactions/TransactionList.jsx'
import TransactionFilters from '../components/Transactions/TransactionFilters.jsx'
import FilterSummary from '../components/Transactions/FilterSummary.jsx'
import ImportForm from '../components/Transactions/ImportForm.jsx'
import ImportReview from '../components/Transactions/ImportReview.jsx'
import Loading from '../components/Common/Loading.jsx'

const EMPTY_FILTERS = {
  account_id: '',
  category_id: '',
  type: '',
  currency: '',
  search: '',
  period_start: '',
  start_date: '',
  end_date: '',
}

export default function Transactions() {
  const [searchParams] = useSearchParams()
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState([])
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [periods, setPeriods] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(() => {
    const categoryId = searchParams.get('category_id')
    return categoryId ? { ...EMPTY_FILTERS, category_id: categoryId } : EMPTY_FILTERS
  })
  const [showForm, setShowForm] = useState(false)
  const [formInitialValues, setFormInitialValues] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [importStep, setImportStep] = useState(null) // null | 'upload' | 'review'
  const [importRows, setImportRows] = useState([])

  const refreshTransactions = useCallback(() => {
    const { account_id, category_id, type, search, start_date, end_date } = filters
    const params = {}
    if (account_id) params.account_id = account_id
    if (category_id) params.category_id = category_id
    if (type) params.type = type
    if (search) params.search = search
    if (start_date) params.start_date = start_date
    if (end_date) params.end_date = end_date

    Promise.all([listTransactions(params), getTransactionsSummary(params)]).then(([t, s]) => {
      setTransactions(t)
      setSummary(s.by_currency)
    })
  }, [filters])

  useEffect(() => {
    setLoading(true)
    Promise.all([listAccounts(), listCategories(), listPeriods(12)])
      .then(([a, c, p]) => {
        setAccounts(a)
        setCategories(c)
        setPeriods(p)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refreshTransactions()
  }, [refreshTransactions])

  const filteredTransactions = filters.currency
    ? transactions.filter((t) => accounts.find((a) => a.id === t.account_id)?.currency === filters.currency)
    : transactions

  const filteredSummary = filters.currency ? summary.filter((row) => row.currency === filters.currency) : summary

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
  }

  async function handleDelete(id) {
    if (!confirm('Remover esta transação?')) return
    await deleteTransaction(id)
    refreshTransactions()
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
      {showForm && (
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
      <FilterSummary byCurrency={filteredSummary} />
      <TransactionList
        transactions={filteredTransactions}
        accounts={accounts}
        categories={categories}
        onEdit={openEditForm}
        onDuplicate={openDuplicateForm}
        onDelete={handleDelete}
      />
    </div>
  )
}
