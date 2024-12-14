import axios from 'axios'
import store from '@/store'
import router from '@/router'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  // baseURL: 'https://backend.thefashion.io.vn/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Reset store state
      store.commit('user/LOGOUT')
      
      // Redirect to login
      router.push({
        name: 'login',
        query: { 
          message: 'Phiên đăng nhập đã hết hạn'
        }
      })
    }
    return Promise.reject(error)
  }
)

export default api