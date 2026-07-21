import api from './axios.js'

export const listInvestmentPositions = async () => (await api.get('/investments/')).data
