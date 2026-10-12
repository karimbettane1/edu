import api from './api'

export const contactService = {
  async send(payload) {
    const { data } = await api.post('/contact', payload)
    return data
  },
}
