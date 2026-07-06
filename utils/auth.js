const authPlatform = {
  checkWechatAuth() {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: res => resolve(!!res.authSetting['scope.userInfo']),
        fail: reject
      })
    })
  },

  startBioAuth() {
    return wx.startSoterAuthentication({
      requestAuthModes: ['fingerPrint', 'facial'],
      challenge: Date.now().toString()
    })
  },

  sendSmsCode(phone) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ code: 200, message: '验证码已发送' })
      }, 500)
    })
  },

  mockAccountLogin(phone, password) {
    return new Promise((resolve, reject) => {
      if (!phone || !password) {
        reject(new Error('参数不完整'))
        return
      }
      setTimeout(() => {
        resolve({
          code: 200,
          token: `token_${Date.now()}`,
          userInfo: {
            nickname: `用户${phone.slice(-4)}`,
            phone
          }
        })
      }, 800)
    })
  }
}

module.exports = {
  authPlatform
}
