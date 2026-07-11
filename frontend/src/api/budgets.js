import api from './axios.js'

export const listBudgets = async (params = {}) => (await api.get('/budgets/', { params })).data
export const updateBudget = async (id, payload) => (await api.put(`/budgets/${id}`, payload)).data
