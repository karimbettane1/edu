import api from './api'

export const contributorService = {
  async resources(params = {}) {
    const { data } = await api.get('/contributor/resources', { params })
    return data
  },

  async resource(id) {
    const { data } = await api.get(`/contributor/resources/${id}`)
    return data.data ?? data
  },

  async createResource(payload) {
    const { data } = await api.post('/contributor/resources', payload)
    return data
  },

  async updateResource(id, payload) {
    const { data } = await api.post(`/contributor/resources/${id}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async deleteResource(id) {
    await api.delete(`/contributor/resources/${id}`)
  },

  async stats() {
    const { data } = await api.get('/contributor/stats')
    return data.data ?? data
  },
}
