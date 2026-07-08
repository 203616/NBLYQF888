Page({
  data: {
    countdown: 3,
    entering: false,
    features: [
      { icon: '🚗', title: '汽车金融', desc: '新车·二手车·车抵' },
      { icon: '🏢', title: '企业经营贷', desc: '宁波银行·工行·农行' },
      { icon: '🛡️', title: '合规撮合', desc: '信息咨询·不放贷' },
      { icon: '📋', title: '智能进件', desc: '材料清单·进度跟踪' }
    ]
  },

  _timer: null,
  _transitioned: false,

  onLoad() {
    const token = wx.getStorageSync('authToken')
    const done = wx.getStorageSync('onboardingCompleted')
    if (done && token) {
      this._transitionTo('/pages/home/home', 'switchTab')
      return
    }
    if (done && !token) {
      this._transitionTo('/pages/login/login', 'redirectTo')
      return
    }
    this.startCountdown()
  },

  onUnload() {
    if (this._timer) clearInterval(this._timer)
  },

  _transitionTo(url, method) {
    if (this._transitioned) return
    this._transitioned = true
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
    setTimeout(() => {
      if (method === 'switchTab') {
        wx.switchTab({ url })
      } else {
        wx.redirectTo({ url })
      }
    }, 100)
  },

  startCountdown() {
    this._timer = setInterval(() => {
      const next = this.data.countdown - 1
      if (next <= 0) {
        clearInterval(this._timer)
        this._timer = null
        this.goNext()
        return
      }
      this.setData({ countdown: next })
    }, 1000)
  },

  handleSkip() {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
    this.goNext()
  },

  goNext() {
    if (this.data.entering) return
    this.setData({ entering: true })
    const token = wx.getStorageSync('authToken')
    const done = wx.getStorageSync('onboardingCompleted')
    if (done && token) {
      this._transitionTo('/pages/home/home', 'switchTab')
    } else {
      this._transitionTo('/pages/login/login', 'redirectTo')
    }
  }
})
