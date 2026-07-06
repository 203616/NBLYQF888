Page({
  onLoad() {
    const done = wx.getStorageSync('onboardingCompleted')
    const token = wx.getStorageSync('authToken')
    if (done && token) {
      wx.switchTab({ url: '/pages/home/home' })
    } else {
      wx.redirectTo({ url: '/pages/login/login' })
    }
  }
})
