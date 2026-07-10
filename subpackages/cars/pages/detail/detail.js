const { getCarDetail } = require('../../api/cars')

Page({
  data: {
    car: null,
    contact: '',
    submitting: false
  },

  onLoad(options) {
    getCarDetail(options.id).then(car => {
      this.setData({ car })
      wx.setNavigationBarTitle({ title: `${car.brand} ${car.model}` })
    })
  },

  handleInput(e) {
    this.setData({ contact: e.detail.value })
  },

  handleApply() {
    if (this.data.submitting || !this.data.car) return
    if (!this.data.contact) {
      wx.showToast({ title: '请填写联系方式', icon: 'none' })
      return
    }
    const car = this.data.car
    const name = `${car.brand} ${car.model}`
    const url = `/subpackages/intake/pages/index/index?productType=usedCar&productName=${encodeURIComponent(name)}&brand=${encodeURIComponent(car.brand)}&model=${encodeURIComponent(car.model)}&price=${encodeURIComponent(car.price)}&mobile=${encodeURIComponent(this.data.contact)}`
    wx.navigateTo({ url })
  },

  navigateToCalculator() {
    wx.navigateTo({ url: '/subpackages/tools/pages/calculator/calculator' })
  },

  navigateToValuation() {
    wx.navigateTo({ url: '/subpackages/tools/pages/valuation/valuation' })
  },

  goIntake() {
    const { goIntake } = require('../../../../utils/intakeNav')
    goIntake({ productType: 'autoFinance', productName: '好车进件' })
  },

  onShareAppMessage() {
    const car = this.data.car || {}
    return {
      title: car.brand || car.model ? `${car.brand || ''} ${car.model || ''} - 亮叶好车` : '亮叶好车',
      path: `/subpackages/cars/pages/detail/detail?id=${car.id || ''}`,
      desc: (car.price ? `${car.price} ` : '') + (car.desc || '') || '亮叶企服精选车源详情'
    }
  },

  onShareTimeline() {
    const car = this.data.car || {}
    return {
      title: car.brand || car.model ? `${car.brand || ''} ${car.model || ''} - 亮叶好车` : '亮叶好车'
    }
  }
})
