import api from './axios.js'

export const getFxRates = async (base) => (await api.get('/fx/rates', { params: { base } })).data
