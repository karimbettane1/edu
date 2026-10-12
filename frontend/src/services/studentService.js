import api from './api'

export const studentService = {
  async favorites(params = {}) {
    const { data } = await api.get('/favorites', { params })
    return data
  },

  async downloads(params = {}) {
    const { data } = await api.get('/me/downloads', { params })
    return data
  },

  async recentViews(limit = 4) {
    const { data } = await api.get('/me/recent-views', { params: { per_page: limit } })
    return data.data ?? data
  },

  async notifications(params = {}) {
    const { data } = await api.get('/me/notifications', { params })
    return data
  },

  async unreadCount() {
    const { data } = await api.get('/me/notifications/unread-count')
    return data.count ?? 0
  },

  async markNotificationRead(id) {
    await api.post(`/me/notifications/${id}/read`)
  },

  async markAllNotificationsRead() {
    await api.post('/me/notifications/read-all')
  },

  async dashboard() {
    const { data } = await api.get('/me/dashboard')
    return data.data ?? data
  },
}
