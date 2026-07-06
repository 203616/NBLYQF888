import axios from 'axios'

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 15000
})

request.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

request.interceptors.response.use(
  response => {
    const body = response.data
    if (body && (body.code === 0 || body.code === 200)) return body.data
    return Promise.reject(new Error(body?.message || '请求失败'))
  },
  error => {
    if (!error.response) {
      return Promise.reject(new Error('无法连接 API 服务，请先启动：pnpm dev:server'))
    }
    const body = error.response.data
    const err = new Error(body?.message || `请求失败 (${error.response.status})`)
    err.data = body?.data
    return Promise.reject(err)
  }
)

export function pingApi() {
  return request.get('/health').catch(() => null)
}

export default request
