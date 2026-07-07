import api from './axios.js'

export const listGoals = async () => (await api.get('/goals/')).data
export const createGoal = async (payload) => (await api.post('/goals/', payload)).data
export const updateGoal = async (id, payload) => (await api.put(`/goals/${id}`, payload)).data
export const deleteGoal = async (id) => (await api.delete(`/goals/${id}`)).data
