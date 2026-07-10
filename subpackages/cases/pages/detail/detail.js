const { getCaseDetail } = require('../../api/cases')

Page({
  data: {
    caseDetail: null,
    loading: true
  },

  onLoad(options) {
    getCaseDetail(options.id || '1').then(item => {
      this.setData({ caseDetail: item, loading: false })
      wx.setNavigationBarTitle({ title: item.title || '服务案例' })
    }).catch(() => {
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  goRelated() {
    const path = this.data.caseDetail?.relatedPath
    if (!path) return
    if (path.startsWith('/pages/')) {
      wx.switchTab({ url: path.split('?')[0] })
    } else {
      wx.navigateTo({ url: path })
    }
  },

  goIntake() {
    const { goIntake } = require('../../../../utils/intakeNav')
    goIntake({ productType: 'workflow', productName: '案例关联进件' })
  },

  onShareAppMessage() {
    const detail = this.data.caseDetail || {}
    return {
      title: detail.title || '亮叶服务案例',
      path: `/subpackages/cases/pages/detail/detail?id=${detail.id || ''}`,
      desc: detail.result || '亮叶企服服务案例详情'
    }
  },

  onShareTimeline() {
    const detail = this.data.caseDetail || {}
    return {
      title: detail.title || '亮叶服务案例'
    }
  }
})
