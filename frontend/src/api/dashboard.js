import api from './axios.js'

export const getSummary = async (range = 'month') => (await api.get('/dashboard/summary', { params: { range } })).data
