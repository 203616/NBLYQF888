const app = getApp()
const { loginByWechat, sendSmsCode, loginByPhone } = require('../../api/auth')
const { isApiOffline } = require('../../utils/config')
const { syncAfterOnboarding } = require('../../utils/appBootstrap')

function finishEntry(res, phone) {
  wx.setStorageSync('authToken', res.token)
  wx.setStorageSync('token', res.token)
  wx.setStorageSync('userInfo', res.userInfo)
  if (phone) wx.setStorageSync('userPhone', phone)
  app.globalData.userInfo = res.userInfo
  app.globalData.authStatus = true
  wx.setStorageSync('onboardingCompleted', true)
  wx.setStorageSync('privacyAgreedAt', new Date().toISOString())
  syncAfterOnboarding().finally(() => {
    wx.switchTab({ url: '/pages/home/home' })
  })
}

Page({
  data: {
    authType: 'wechat',
    phone: '',
    smsCode: '',
    codeSending: false,
    codeText: '获取验证码',
    loggingIn: false,
    agreedPrivacy: false,
    agreedService: false,
    agreedContract: false
  },

  onLoad() {
    const token = wx.getStorageSync('authToken')
    const done = wx.getStorageSync('onboardingCompleted')
    if (token && done) {
      setTimeout(() => {
        wx.switchTab({ url: '/pages/home/home' })
      }, 80)
    }
  },

  togglePrivacy() {
    this.setData({ agreedPrivacy: !this.data.agreedPrivacy })
  },

  toggleService() {
    this.setData({ agreedService: !this.data.agreedService })
  },

  viewPrivacy() {
    wx.navigateTo({ url: '/subpackages/auth/privacy/privacy?type=privacy' })
  },

  viewService() {
    wx.navigateTo({ url: '/subpackages/auth/privacy/privacy?type=service' })
  },

  toggleContract() {
    this.setData({ agreedContract: !this.data.agreedContract })
  },

  viewContract() {
    wx.navigateTo({ url: '/subpackages/profile/pages/docs/docs?tab=contract' })
  },

  validateAgreements() {
    if (!this.data.agreedPrivacy || !this.data.agreedService || !this.data.agreedContract) {
      wx.showToast({ title: '请先勾选全部协议', icon: 'none' })
      return false
    }
    return true
  },

  handleWechatAuth() {
    if (this.data.loggingIn || !this.validateAgreements()) return
    this.setData({ loggingIn: true })
    wx.showLoading({ title: '登录中...', mask: true })
    app.login()
      .then(code => loginByWechat(code))
      .then(res => {
        if (isApiOffline()) wx.showToast({ title: '演示模式', icon: 'none', duration: 1200 })
        finishEntry(res, this.data.phone || wx.getStorageSync('userPhone'))
      })
      .catch(err => {
        console.warn('[login] wechat auth failed', err)
        wx.showToast({ title: '登录失败', icon: 'none' })
      })
      .finally(() => {
        this.setData({ loggingIn: false })
        wx.hideLoading()
      })
  },

  switchAuthType(e) {
    this.setData({ authType: e.currentTarget.dataset.type })
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value })
  },

  onCodeInput(e) {
    this.setData({ smsCode: e.detail.value })
  },

  sendSmsCode() {
    if (!/^1\d{10}$/.test(this.data.phone)) {
      return wx.showToast({ title: '请输入正确手机号', icon: 'none' })
    }
    this.setData({ codeSending: true, codeText: '发送中...' })
    sendSmsCode(this.data.phone)
      .then(() => wx.showToast({ title: '验证码已发送', icon: 'success' }))
      .catch(() => wx.showToast({ title: '发送失败', icon: 'none' }))
      .finally(() => this.setData({ codeSending: false, codeText: '获取验证码' }))
  },

  handlePhoneLogin() {
    if (this.data.loggingIn || !this.validateAgreements()) return
    if (!/^1\d{10}$/.test(this.data.phone)) {
      return wx.showToast({ title: '请输入手机号', icon: 'none' })
    }
    if (!this.data.smsCode) {
      return wx.showToast({ title: '请输入验证码', icon: 'none' })
    }
    this.setData({ loggingIn: true })
    wx.showLoading({ title: '登录中...', mask: true })
    loginByPhone(this.data.phone, this.data.smsCode)
      .then(res => finishEntry(res, this.data.phone))
      .catch(err => {
        console.warn('[login] phone login failed', err)
        wx.showToast({ title: '登录失败', icon: 'none' })
      })
      .finally(() => {
        this.setData({ loggingIn: false })
        wx.hideLoading()
      })
  },

  guestEnter() {
    if (!this.validateAgreements()) return
    wx.setStorageSync('onboardingCompleted', true)
    wx.setStorageSync('privacyAgreedAt', new Date().toISOString())
    wx.setStorageSync('isGuest', true)
    wx.switchTab({ url: '/pages/home/home' })
  }
})
