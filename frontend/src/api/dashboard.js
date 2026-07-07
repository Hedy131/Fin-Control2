import api from './axios.js'

export const getSummary = async () => (await api.get('/dashboard/summary')).data
