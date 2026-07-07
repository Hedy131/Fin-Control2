import { useEffect, useState } from 'react'
import { listCategories, createCategory, updateCategory, deleteCategory } from '../api/categories.js'
import CategoryForm from '../components/Categories/CategoryForm.jsx'
import CategoryList from '../components/Categories/CategoryList.jsx'
import Loading from '../components/Common/Loading.jsx'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  function refresh() {
    setLoading(true)
    listCategories().then(setCategories).finally(() => setLoading(false))
  }

  useEffect(refresh, [])

  async function handleCreate(payload) {
    await createCategory(payload)
    setShowForm(false)
    refresh()
  }

  async function handleUpdate(payload) {
    await updateCategory(editingCategory.id, payload)
    setEditingCategory(null)
    refresh()
  }

  async function handleDelete(id) {
    if (!confirm('Remover esta categoria?')) return
    await deleteCategory(id)
    refresh()
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Categorias</h2>
        <button
          onClick={() => {
            setEditingCategory(null)
            setShowForm(!showForm)
          }}
          className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white"
        >
          {showForm ? 'Fechar' : 'Nova Categoria'}
        </button>
      </div>
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 max-w-md">
          <CategoryForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}
      {editingCategory && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 max-w-md">
          <CategoryForm
            initialValues={editingCategory}
            onSubmit={handleUpdate}
            onCancel={() => setEditingCategory(null)}
          />
        </div>
      )}
      <CategoryList categories={categories} onEdit={setEditingCategory} onDelete={handleDelete} />
    </div>
  )
}
