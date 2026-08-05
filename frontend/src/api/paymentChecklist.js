import api from './axios.js'

export const listChecklistItems = async (params = {}) =>
  (await api.get('/payment-checklist/', { params })).data
export const createChecklistItem = async (payload) => (await api.post('/payment-checklist/', payload)).data
export const updateChecklistItem = async (id, payload) => (await api.put(`/payment-checklist/${id}`, payload)).data
export const deleteChecklistItem = async (id) => (await api.delete(`/payment-checklist/${id}`)).data
