import api from './api'

export const resourceService = {
  async list(params = {}) {
    const { data } = await api.get('/resources', { params })
    return data
  },

  async detail(id) {
    const { data } = await api.get(`/resources/${id}`)
    return data.data ?? data
  },

  async recent(limit = 6) {
    const { data } = await api.get('/resources', {
      params: { sort: 'recent', per_page: limit, status: 'published' },
    })
    return data.data ?? []
  },

  async popular(limit = 6) {
    const { data } = await api.get('/resources', {
      params: { sort: 'popular', per_page: limit, status: 'published' },
    })
    return data.data ?? []
  },

  downloadUrl(id) {
    return `/api/resources/${id}/download`
  },

  previewUrl(id) {
    return `/api/resources/${id}/preview`
  },

  async preview(id) {
    const response = await api.get(`/resources/${id}/preview`, { responseType: 'blob' })
    return window.URL.createObjectURL(response.data)
  },

  async download(id) {
    const response = await api.get(`/resources/${id}/download`, { responseType: 'blob' })
    const disposition = response.headers['content-disposition'] || ''
    const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)
    const filename = match ? decodeURIComponent(match[1]) : `resource-${id}`
    const url = window.URL.createObjectURL(response.data)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    return filename
  },

  async toggleFavorite(id) {
    const { data } = await api.post(`/resources/${id}/favorite`)
    return data
  },

  async comments(id) {
    const { data } = await api.get(`/resources/${id}/comments`)
    return data.data ?? data
  },

  async addComment(id, payload) {
    const { data } = await api.post(`/resources/${id}/comments`, payload)
    return data
  },

  async deleteComment(commentId) {
    await api.delete(`/comments/${commentId}`)
  },

  async report(id, payload) {
    const { data } = await api.post(`/resources/${id}/reports`, payload)
    return data
  },
}
