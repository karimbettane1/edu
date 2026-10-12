import axios from 'axios'

export const TOKEN_KEY = 'da_token'
export const USER_KEY = 'da_user'

const api = axios.create({
  baseURL: '/api',
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      window.dispatchEvent(new Event('da:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error, fallback) {
  if (!error.response) return fallback
  const data = error.response.data
  if (data?.message) return data.message
  if (data?.errors) {
    const first = Object.values(data.errors)[0]
    if (Array.isArray(first) && first.length) return first[0]
  }
  return fallback
}

export default api
