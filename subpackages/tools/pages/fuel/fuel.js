const { getFuelPrices } = require('../../api/tools')
const { getAppLocation, chooseLocation, requestLocation } = require('../../../../utils/location')

Page({
  data: {
    location: null,
    fuelData: null
  },

  onLoad() {
    this.initLocation()
  },

  initLocation() {
    requestLocation({ showError: false })
      .catch(() => null)
      .finally(() => {
        const location = getAppLocation()
        this.setData({ location })
        this.loadFuel(location.city)
      })
  },

  loadFuel(city) {
    getFuelPrices(city).then(fuelData => {
      this.setData({ fuelData })
    })
  },

  handleChooseCity() {
    chooseLocation().then(location => {
      this.setData({ location })
      this.loadFuel(location.city)
    })
  },

  onShareAppMessage() {
    return {
      title: '宁波油价查询',
      path: '/subpackages/tools/pages/fuel/fuel',
      desc: '查询宁波地区最新汽油、柴油价格信息。'
    }
  },

  onShareTimeline() {
    return {
      title: '宁波油价查询'
    }
  }
})
