import api from './axios.js'

export const listBudgets = async (params = {}) => (await api.get('/budgets/', { params })).data
export const updateBudget = async (id, payload, params = {}) => (await api.put(`/budgets/${id}`, payload, { params })).data
