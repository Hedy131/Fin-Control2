import api from './axios.js'

export const listInvestmentPositions = async () => (await api.get('/investments/')).data
export const updateInvestmentPosition = async (id, payload) => (await api.put(`/investments/${id}`, payload)).data
