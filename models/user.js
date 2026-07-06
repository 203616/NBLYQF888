class User {
  constructor(data = {}) {
    this.id = data.id || ''
    this.openid = data.openid || ''
    this.phone = data.phone || ''
    this.nickname = data.nickname || '亮叶用户'
    this.avatarUrl = data.avatarUrl || '/images/avatar.webp'
    this.isVerified = data.isVerified || false
  }

  static fromStorage() {
    const stored = wx.getStorageSync('userInfo')
    return stored ? new User(stored) : null
  }

  save() {
    wx.setStorageSync('userInfo', {
      id: this.id,
      openid: this.openid,
      phone: this.phone,
      nickname: this.nickname,
      avatarUrl: this.avatarUrl,
      isVerified: this.isVerified
    })
  }

  clear() {
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('authToken')
    wx.removeStorageSync('token')
    wx.removeStorageSync('openid')
  }
}

module.exports = User
