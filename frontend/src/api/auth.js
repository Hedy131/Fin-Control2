import api from './axios.js'

export async function login(pin) {
  const { data } = await api.post('/auth/login', { pin })
  return data
}

export async function getMe() {
  const { data } = await api.get('/users/me')
  return data
}

export async function changePin(currentPin, newPin) {
  await api.put('/auth/pin', { current_pin: currentPin, new_pin: newPin })
}

export async function forgotPin() {
  await api.post('/auth/forgot-pin')
}
