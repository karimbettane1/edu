import api from './api'

export const quizService = {
  async list(params = {}) {
    const { data } = await api.get('/quizzes', { params })
    return data.data ?? data
  },

  async detail(id) {
    const { data } = await api.get(`/quizzes/${id}`)
    return data.data ?? data
  },

  async submitAttempt(id, payload) {
    const { data } = await api.post(`/quizzes/${id}/attempts`, payload)
    return data
  },

  async attempts(id) {
    const { data } = await api.get(`/quizzes/${id}/attempts`)
    return data.data ?? data
  },

  async myAttempts() {
    const { data } = await api.get('/me/quiz-attempts')
    return data.data ?? data
  },
}
