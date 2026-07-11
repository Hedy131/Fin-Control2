import api from './axios.js'

export const previewImport = async (accountId, file) => {
  const formData = new FormData()
  formData.append('account_id', accountId)
  formData.append('file', file)
  const { data } = await api.post('/imports/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 90000,
  })
  return data
}

export const confirmImport = async (payload) => (await api.post('/imports/confirm', payload)).data
