import api from './api'

export const projectService = {
  async list(params = {}) {
    const { data } = await api.get('/projects', { params })
    return data
  },

  async detail(id) {
    const { data } = await api.get(`/projects/${id}`)
    return data.data ?? data
  },

  async create(payload) {
    const { data } = await api.post('/projects', payload)
    return data
  },

  async remove(id) {
    await api.delete(`/projects/${id}`)
  },

  async mine(params = {}) {
    const { data } = await api.get('/me/projects', { params })
    return data
  },
}
