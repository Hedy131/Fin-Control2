import api from './axios.js'

export const listBudgets = async (params = {}) => (await api.get('/budgets/', { params })).data
export const createBudget = async (payload) => (await api.post('/budgets/', payload)).data
export const updateBudget = async (id, payload) => (await api.put(`/budgets/${id}`, payload)).data
export const deleteBudget = async (id) => (await api.delete(`/budgets/${id}`)).data
