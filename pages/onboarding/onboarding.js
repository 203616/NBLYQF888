const { requestLocation } = require('../../utils/location')
const { syncAfterOnboarding } = require('../../utils/appBootstrap')

Page({
  data: {
    step: 1,
    agreedPrivacy: false,
    agreedService: false,
    phone: '',
    phoneAuthorized: false,
    locationDone: false,
    locationCity: '',
    submitting: false
  },

  onLoad() {
    if (wx.getStorageSync('onboardingCompleted')) {
      return this.finishOnboarding()
    }
    const phone = wx.getStorageSync('userPhone')
    if (phone) {
      this.setData({ phone, phoneAuthorized: true })
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

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value, phoneAuthorized: /^1\d{10}$/.test(e.detail.value) })
  },

  handleGetPhoneNumber(e) {
    if (e.detail.errMsg && e.detail.errMsg.includes('ok') && e.detail.code) {
      wx.setStorageSync('phoneAuthCode', e.detail.code)
      this.setData({ phoneAuthorized: true })
      wx.showToast({ title: '手机号授权成功', icon: 'success' })
      return
    }
    wx.showToast({ title: '可手动输入手机号', icon: 'none' })
  },

  authorizeLocation() {
    requestLocation({ showError: true })
      .then(loc => {
        this.setData({ locationDone: true, locationCity: loc.city })
        wx.showToast({ title: `已定位：${loc.city}`, icon: 'success' })
      })
      .catch(() => {
        this.setData({ locationDone: true, locationCity: '宁波市' })
        wx.showToast({ title: '已使用默认城市', icon: 'none' })
      })
  },

  nextStep() {
    if (this.data.step === 1) {
      if (!this.data.agreedPrivacy || !this.data.agreedService) {
        return wx.showToast({ title: '请先阅读并同意协议', icon: 'none' })
      }
      this.setData({ step: 2 })
      return
    }
    if (this.data.step === 2) {
      if (!this.data.phoneAuthorized && !/^1\d{10}$/.test(this.data.phone)) {
        return wx.showToast({ title: '请授权或填写手机号', icon: 'none' })
      }
      if (/^1\d{10}$/.test(this.data.phone)) {
        wx.setStorageSync('userPhone', this.data.phone)
      }
      this.setData({ step: 3 })
      return
    }
    this.completeSetup()
  },

  completeSetup() {
    if (this.data.submitting) return
    if (!this.data.locationDone) {
      return wx.showToast({ title: '请先完成定位授权', icon: 'none' })
    }
    this.setData({ submitting: true })
    wx.setStorageSync('onboardingCompleted', true)
    wx.setStorageSync('privacyAgreedAt', new Date().toISOString())
    syncAfterOnboarding()
      .finally(() => {
        this.setData({ submitting: false })
        this.finishOnboarding()
      })
  },

  finishOnboarding() {
    wx.switchTab({ url: '/pages/home/home' })
  },

  skipLocation() {
    this.setData({ locationDone: true, locationCity: '宁波市' })
    this.completeSetup()
  }
})
