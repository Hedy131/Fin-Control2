import api from './axios.js'

export const listPeriods = async (n = 12) => (await api.get('/periods/', { params: { n } })).data
