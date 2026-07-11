import api from './axios.js'

export const previewImport = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/imports/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  })
  return data
}

export const confirmImport = async (payload) => (await api.post('/imports/confirm', payload)).data
