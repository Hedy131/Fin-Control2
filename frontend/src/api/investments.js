import api from './axios.js'

export const listInvestmentPositions = async () => (await api.get('/investments/')).data
export const createInvestmentPosition = async (payload) => (await api.post('/investments/', payload)).data
export const updateInvestmentPosition = async (id, payload) => (await api.put(`/investments/${id}`, payload)).data
export const deleteInvestmentPosition = async (id) => (await api.delete(`/investments/${id}`)).data
