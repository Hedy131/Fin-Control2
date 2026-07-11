import api from './axios.js'

export const listGoals = async () => (await api.get('/goals/')).data
export const updateGoal = async (id, payload) => (await api.put(`/goals/${id}`, payload)).data
