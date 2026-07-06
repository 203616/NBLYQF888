const { post } = require('../utils/request')
const { getConfig, isApiOffline } = require('../utils/config')

function sendSmsCode(phone) {
  if (getConfig().useMockFallback) {
    return Promise.resolve({ code: 200, message: '验证码已发送' })
  }
  return post('/auth/sms-code', { phone }, { showError: false })
    .catch(err => {
      if (err?.offline || isApiOffline()) {
        return { code: 200, message: '验证码已发送（演示模式）' }
      }
      return Promise.reject(err)
    })
}

function localPhoneLogin(phone) {
  return {
    token: `token_${Date.now()}`,
    userInfo: {
      phone,
      nickName: `亮叶用户${phone.slice(-4)}`,
      avatarUrl: '/images/avatar.webp',
      verified: true
    }
  }
}

function loginByPhone(phone, password) {
  if (getConfig().useMockFallback) {
    return Promise.resolve(localPhoneLogin(phone))
  }
  return post('/auth/login', { phone, password }, { showError: false })
    .then(res => ({
      token: res.token,
      userInfo: {
        phone: res.user.phone,
        nickName: res.user.nickName || res.user.nickname,
        avatarUrl: res.user.avatarUrl || '/images/avatar.webp',
        verified: !!res.user.is_verified
      }
    }))
    .catch(err => {
      if (err?.offline || isApiOffline()) return localPhoneLogin(phone)
      return Promise.reject(err)
    })
}

function registerByPhone(phone, smsCode, password) {
  if (getConfig().useMockFallback) {
    if (!/^\d{4,6}$/.test(smsCode)) {
      return Promise.reject({ message: '验证码格式错误' })
    }
    return Promise.resolve(localPhoneLogin(phone))
  }
  return post('/auth/register', { phone, smsCode, password }).then(res => ({
    token: res.token,
    userInfo: {
      phone: res.user.phone,
      nickName: res.user.nickName || res.user.nickname,
      avatarUrl: res.user.avatarUrl || '/images/avatar.webp',
      verified: !!res.user.is_verified
    }
  }))
}

function localWechatLogin() {
  return {
    token: `wx_token_${Date.now()}`,
    userInfo: {
      nickName: '微信用户',
      avatarUrl: '/images/avatar.webp',
      verified: false
    }
  }
}

function loginByWechat(code) {
  if (getConfig().useMockFallback) {
    return Promise.resolve(localWechatLogin())
  }
  return post('/auth/wechat-login', { code }, { showError: false })
    .then(res => ({
      token: res.token,
      userInfo: {
        nickName: res.user.nickName || res.user.nickname || '微信用户',
        avatarUrl: res.user.avatarUrl || '/images/avatar.webp',
        verified: !!res.user.is_verified
      }
    }))
    .catch(err => {
      if (err?.offline || isApiOffline()) return localWechatLogin()
      return Promise.reject(err)
    })
}

function resetPassword(phone, smsCode, password) {
  if (getConfig().useMockFallback) {
    return Promise.resolve({ code: 200, message: '密码重置成功' })
  }
  return post('/auth/reset-password', { phone, smsCode, password })
}

module.exports = {
  sendSmsCode,
  loginByPhone,
  registerByPhone,
  loginByWechat,
  resetPassword
}
