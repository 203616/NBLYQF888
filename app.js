function getSystemInfoCompat() {
  try {
    const { getDeviceProfile } = require('./utils/device')
    return getDeviceProfile()
  } catch (e) {
    try {
      return wx.getSystemInfoSync()
    } catch (err) {
      return {}
    }
  }
}

App({
  onLaunch() {
    try {
      const { attachDeviceToApp } = require('./utils/device')
      attachDeviceToApp(this)
    } catch (e) {
      this.globalData.systemInfo = getSystemInfoCompat()
    }
    const token = wx.getStorageSync('authToken')
    this.globalData.authStatus = !!token
    this.globalData._bootstrapDone = false
    if (token && wx.getStorageSync('onboardingCompleted')) {
      setTimeout(() => {
        try {
          require('./utils/appBootstrap').syncAfterOnboarding()
        } catch (e) {}
      }, 500)
    }
  },

  onShow() {
    const now = Date.now()
    if (!this.globalData.lastSessionCheckAt || now - this.globalData.lastSessionCheckAt > 5 * 60 * 1000) {
      this.globalData.lastSessionCheckAt = now
      this.checkUserAuthStatus()
    }
    if (wx.getStorageSync('onboardingCompleted')) {
      try {
        const { flushPendingSync } = require('./api/intake')
        flushPendingSync().catch(() => null)
      } catch (e) { /* ignore */ }
    }
  },

  globalData: {
    userInfo: null,
    authStatus: false,
    lastSessionCheckAt: 0,
    location: null,
    unreadCount: 0,
    _bootstrapDone: false,
    systemInfo: null,
    deviceProfile: null
  },

  checkUserAuthStatus() {
    wx.checkSession({
      success: () => { this.globalData.authStatus = true },
      fail: () => {
        wx.removeStorageSync('authToken')
        this.globalData.authStatus = false
      }
    })
  },

  login() {
    return new Promise(resolve => {
      wx.login({
        success: (res) => {
          const sessionCode = res.code || `local_session_${Date.now()}`
          wx.setStorageSync('openid', sessionCode)
          resolve(sessionCode)
        },
        fail: () => {
          const sessionCode = `local_session_${Date.now()}`
          wx.setStorageSync('openid', sessionCode)
          resolve(sessionCode)
        }
      })
    })
  }
})
