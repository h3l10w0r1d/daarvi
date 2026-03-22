import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request interceptor: attach JWT ─────────────────────────────────────────
client.interceptors.request.use(config => {
  const token = localStorage.getItem('daarvi_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Response interceptor: auto-refresh on 401 ───────────────────────────────
let refreshing = false
let queue = []

const processQueue = (error, token = null) => {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)))
  queue = []
}

client.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return client(original)
        })
      }
      original._retry = true
      refreshing = true
      const refreshToken = localStorage.getItem('daarvi_refresh_token')
      if (!refreshToken) {
        refreshing = false
        localStorage.removeItem('daarvi_access_token')
        localStorage.removeItem('daarvi_refresh_token')
        return Promise.reject(error)
      }
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken })
        localStorage.setItem('daarvi_access_token', data.access_token)
        localStorage.setItem('daarvi_refresh_token', data.refresh_token)
        client.defaults.headers.common.Authorization = `Bearer ${data.access_token}`
        processQueue(null, data.access_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return client(original)
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem('daarvi_access_token')
        localStorage.removeItem('daarvi_refresh_token')
        // Signal AppContext to clear user state and let ProtectedRoute redirect
        window.dispatchEvent(new Event('daarvi:auth-expired'))
        return Promise.reject(err)
      } finally {
        refreshing = false
      }
    }
    return Promise.reject(error)
  }
)
