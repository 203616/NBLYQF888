const { getConfig, markApiOffline, isApiOffline } = require('./config')

function isConnectionError(error) {
  const msg = String(error?.message || error?.errMsg || '').toLowerCase()
  return msg.includes('connection_refused') ||
    msg.includes('connect fail') ||
    msg.includes('request:fail') ||
    msg.includes('network') ||
    msg.includes('timeout') ||
    error?.code === 'ECONNREFUSED'
}

function normalizeError(error) {
  if (!error) return { message: '网络请求失败' }
  if (typeof error === 'string') return { message: error }
  const rawMessage = error.message || error.errMsg || ''
  if (isConnectionError(error) || rawMessage.includes('fail')) {
    return {
      code: error.code || error.errCode || error.statusCode || 'ECONNREFUSED',
      message: isApiOffline()
        ? '本地演示模式：API 未连接，部分功能使用离线数据'
        : '无法连接服务端，请确认已启动 API（pnpm dev:server）',
      raw: error,
      offline: true
    }
  }
  if (rawMessage.includes('timeout')) {
    return {
      code: error.code || error.errCode || error.statusCode || -1,
      message: '网络响应超时，请检查网络后重试',
      raw: error
    }
  }
  return {
    code: error.code || error.errCode || error.statusCode || -1,
    message: rawMessage || '网络请求失败',
    raw: error
  }
}

function request(options) {
  const config = getConfig()
  const { apiBaseUrl } = config
  const { url, method = 'GET', data = {}, header = {}, showError = true, timeout = 15000, retry = 1 } = options

  // If offline already marked, or mock fallback is on, reject immediately without network call
  if (isApiOffline() || config.useMockFallback) {
    const error = {
      code: 'OFFLINE',
      message: '本地演示模式：API 未连接',
      offline: true
    }
    return Promise.reject(error)
  }

  const targetUrl = url.startsWith('http') ? url : `${apiBaseUrl}${url}`

  if (!url.startsWith('http') && !apiBaseUrl) {
    const error = { message: 'API 地址未配置，已阻止无效网络请求' }
    if (showError) wx.showToast({ title: error.message, icon: 'none' })
    return Promise.reject(error)
  }

  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('authToken') || wx.getStorageSync('token')

    function send(remainingRetry) {
      wx.request({
        url: targetUrl,
        method,
        data,
        timeout,
        header: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...header
        },
        success(res) {
          const body = res.data || {}
          const okStatus = res.statusCode >= 200 && res.statusCode < 300
          const okBusiness = body.code === undefined || body.code === 0 || body.code === 200

          if (okStatus && okBusiness) {
            resolve(body.data !== undefined ? body.data : body)
          } else {
            const error = normalizeError({
              ...body,
              statusCode: res.statusCode,
              message: body.message || body.msg || '请求失败'
            })
            if (showError && !error.offline) wx.showToast({ title: error.message, icon: 'none' })
            reject(error)
          }
        },
        fail(err) {
          const error = normalizeError(err)
          if (error.offline && !isApiOffline()) {
            markApiOffline()
          }
          // Only retry if there are retries left and it's a connection/timeout error
          if (remainingRetry > 0 && (error.offline || error.message.includes('超时'))) {
            send(remainingRetry - 1)
            return
          }
          // Don't show toast for offline errors — caller handles it
          if (showError && !error.offline) {
            wx.showToast({ title: error.message, icon: 'none' })
          }
          reject(error)
        }
      })
    }

    send(retry)
  })
}

function get(url, data, options = {}) {
  return request({ url, method: 'GET', data, ...options })
}

function post(url, data, options = {}) {
  return request({ url, method: 'POST', data, ...options })
}

module.exports = {
  request,
  get,
  post
}
