const { getDemandDetail } = require('../../../../api/demand')
const { goIntakeFromDemand } = require('../../../../utils/intakeNav')

Page({
  data: {
    demand: null
  },

  onLoad(options) {
    getDemandDetail(options.id).then(demand => {
      this.setData({
        demand: {
          ...demand,
          recommendedProducts: demand.recommendedProducts || []
        }
      })
      wx.setNavigationBarTitle({ title: demand.title })
    })
  },

  contact() {
    wx.showModal({
      title: '联系需求方',
      content: `将通过平台记录您的联系意向，专员将协助对接。\n\n联系方式：${this.data.demand?.contact || '-'}`,
      confirmText: '确认联系',
      success: (res) => {
        if (res.confirm) wx.showToast({ title: '已记录联系意向', icon: 'success' })
      }
    })
  },

  goIntake() {
    goIntakeFromDemand(this.data.demand)
  },

  goProduct(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/subpackages/product/pages/detail/detail?id=${id}` })
  }
})
