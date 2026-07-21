import api from './axios.js'

export const getSummary = async (params = { range: 'month' }) => (await api.get('/dashboard/summary', { params })).data
