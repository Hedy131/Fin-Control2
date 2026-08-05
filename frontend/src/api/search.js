import api from './axios.js'

export const search = async (q) => (await api.get('/search/', { params: { q } })).data
