import api from './api'

export const catalogService = {
  async stats() {
    const { data } = await api.get('/stats')
    return data.data ?? data
  },

  async filieres() {
    const { data } = await api.get('/filieres')
    return data.data ?? data
  },

  async filiere(slug) {
    const { data } = await api.get(`/filieres/${slug}`)
    return data.data ?? data
  },

  async niveaux() {
    const { data } = await api.get('/niveaux')
    return data.data ?? data
  },

  async annees(filiereId) {
    const { data } = await api.get('/annees', { params: { filiere_id: filiereId } })
    return data.data ?? data
  },

  async modules(params = {}) {
    const { data } = await api.get('/modules', { params })
    return data.data ?? data
  },

  async resourceTypes() {
    const { data } = await api.get('/resource-types')
    return data.data ?? data
  },
}
