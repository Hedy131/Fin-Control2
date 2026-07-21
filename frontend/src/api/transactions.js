import api from './axios.js'

export const listTransactions = async (params = {}) => (await api.get('/transactions/', { params })).data
export const getTransactionsSummary = async (params = {}) => (await api.get('/transactions/summary', { params })).data
export const createTransaction = async (payload) => (await api.post('/transactions/', payload)).data
export const updateTransaction = async (id, payload) => (await api.put(`/transactions/${id}`, payload)).data
export const deleteTransaction = async (id) => (await api.delete(`/transactions/${id}`)).data
export const bulkDeleteTransactions = async (ids) => (await api.post('/transactions/bulk-delete', { ids })).data
export const bulkUpdateTransactions = async (payload) => (await api.post('/transactions/bulk-update', payload)).data
export const getDuplicateTransactions = async () => (await api.get('/transactions/duplicates')).data
export const exportTransactions = async (format, params) =>
  (await api.get('/transactions/export', { params: { ...params, format }, responseType: 'blob' })).data
