const { sendSmsCode, registerByPhone } = require('../../../api/auth')

Page({
  data: {
    phone: '',
    smsCode: '',
    password: '',
    countdown: 0
  },

  bindPhoneInput(e) {
    this.setData({ phone: e.detail.value })
  },

  bindSmsInput(e) {
    this.setData({ smsCode: e.detail.value })
  },

  bindPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  // 发送验证码
  async sendSmsCode() {
    const { phone } = this.data
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return wx.showToast({ title: '手机号格式错误', icon: 'none' })
    }

    wx.showLoading({ title: '发送中...' })
    try {
      await sendSmsCode(phone)
      this.startCountdown()
      wx.showToast({ title: '验证码已发送', icon: 'success' })
    } catch (e) {
      wx.showToast({ title: '发送失败，请重试', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  // 倒计时逻辑
  startCountdown() {
    this.setData({ countdown: 60 })
    const timer = setInterval(() => {
      if (this.data.countdown <= 1) {
        clearInterval(timer)
        this.setData({ countdown: 0 })
      } else {
        this.setData({ countdown: this.data.countdown - 1 })
      }
    }, 1000)
  },

  // 注册提交
  async handleRegister() {
    const { phone, smsCode, password } = this.data
    if (!phone || !smsCode || !password) {
      return wx.showToast({ title: '请填写完整信息', icon: 'none' })
    }
    if (password.length < 6 || password.length > 20) {
      return wx.showToast({ title: '密码长度6-20位', icon: 'none' })
    }

    wx.showLoading({ title: '注册中...' })
    try {
      const res = await registerByPhone(phone, smsCode, password)
      wx.setStorageSync('authToken', res.token)
      wx.setStorageSync('token', res.token)
      wx.setStorageSync('userInfo', res.userInfo)
      getApp().globalData.userInfo = res.userInfo
      getApp().globalData.authStatus = true
      wx.showToast({ title: '注册成功', icon: 'success' })
      wx.reLaunch({ url: '/pages/home/home' })
    } catch (e) {
      wx.showToast({ title: '注册失败，请重试', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  navigateToLogin() {
    wx.redirectTo({ url: '/pages/login/login' })
  }
})