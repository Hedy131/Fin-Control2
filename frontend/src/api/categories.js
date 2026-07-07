import api from './axios.js'

export const listCategories = async () => (await api.get('/categories/')).data
export const createCategory = async (payload) => (await api.post('/categories/', payload)).data
export const updateCategory = async (id, payload) => (await api.put(`/categories/${id}`, payload)).data
export const deleteCategory = async (id) => (await api.delete(`/categories/${id}`)).data
