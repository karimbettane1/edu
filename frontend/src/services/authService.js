import api from './api'

export const authService = {
  async register(payload) {
    const { data } = await api.post('/register', payload)
    return data
  },

  async login(payload) {
    const { data } = await api.post('/login', payload)
    return data
  },

  async logout() {
    await api.post('/logout')
  },

  async me() {
    const { data } = await api.get('/me')
    return data
  },

  async updateProfile(payload) {
    const { data } = await api.put('/me/profile', payload)
    return data
  },

  async updatePassword(payload) {
    await api.put('/me/password', payload)
  },

  async updatePreferences(payload) {
    await api.put('/me/preferences', payload)
  },
}
