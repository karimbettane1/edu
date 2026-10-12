import api from './api'

export const adminService = {
  async dashboard() {
    const { data } = await api.get('/admin/dashboard')
    return data.data ?? data
  },

  async resources(params = {}) {
    const { data } = await api.get('/admin/resources', { params })
    return data
  },

  async resource(id) {
    const { data } = await api.get(`/admin/resources/${id}`)
    return data.data ?? data
  },

  async createResource(payload) {
    const { data } = await api.post('/admin/resources', payload)
    return data
  },

  async updateResource(id, payload) {
    const { data } = await api.post(`/admin/resources/${id}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async deleteResource(id) {
    await api.delete(`/admin/resources/${id}`)
  },

  async filieres(params = {}) {
    const { data } = await api.get('/admin/filieres', { params })
    return data.data ?? data
  },

  async createFiliere(payload) {
    const { data } = await api.post('/admin/filieres', payload)
    return data
  },

  async updateFiliere(id, payload) {
    const { data } = await api.put(`/admin/filieres/${id}`, payload)
    return data
  },

  async deleteFiliere(id) {
    await api.delete(`/admin/filieres/${id}`)
  },

  async modules(params = {}) {
    const { data } = await api.get('/admin/modules', { params })
    return data.data ?? data
  },

  async createModule(payload) {
    const { data } = await api.post('/admin/modules', payload)
    return data
  },

  async updateModule(id, payload) {
    const { data } = await api.put(`/admin/modules/${id}`, payload)
    return data
  },

  async deleteModule(id) {
    await api.delete(`/admin/modules/${id}`)
  },

  async annees(params = {}) {
    const { data } = await api.get('/admin/annees', { params })
    return data.data ?? data
  },

  async createAnnee(payload) {
    const { data } = await api.post('/admin/annees', payload)
    return data
  },

  async updateAnnee(id, payload) {
    const { data } = await api.put(`/admin/annees/${id}`, payload)
    return data
  },

  async deleteAnnee(id) {
    await api.delete(`/admin/annees/${id}`)
  },

  async users(params = {}) {
    const { data } = await api.get('/admin/users', { params })
    return data
  },

  async updateUser(id, payload) {
    const { data } = await api.put(`/admin/users/${id}`, payload)
    return data
  },

  async deleteUser(id) {
    await api.delete(`/admin/users/${id}`)
  },

  async reports(params = {}) {
    const { data } = await api.get('/admin/reports', { params })
    return data
  },

  async resolveReport(id, payload = {}) {
    const { data } = await api.put(`/admin/reports/${id}`, payload)
    return data
  },

  async pendingComments(params = {}) {
    const { data } = await api.get('/admin/comments', { params })
    return data
  },

  async approveComment(id, approved = true) {
    const { data } = await api.put(`/admin/comments/${id}`, { is_approved: approved })
    return data
  },

  async deleteComment(id) {
    await api.delete(`/admin/comments/${id}`)
  },

  async settings() {
    const { data } = await api.get('/admin/settings')
    return data.data ?? data
  },

  async updateSettings(payload) {
    const { data } = await api.post('/admin/settings', payload)
    return data
  },

  async auditLogs(params = {}) {
    const { data } = await api.get('/admin/audit-logs', { params })
    return data
  },
}
