const { getExposureDetail } = require('../../api/exposure')
const mock = require('../../../../api/mock')

Page({
  data: {
    exposureDetail: null,
    relatedExposures: [],
    loading: true
  },

  onLoad(options) {
    this.loadExposureDetail(options.id)
    this.loadRelatedExposures(options.id)
  },

  loadExposureDetail(id) {
    this.setData({ loading: true })
    getExposureDetail(id).then(detail => {
      this.setData({
        exposureDetail: detail || {
          id,
          title: '曝光信息不存在',
          content: '<p>您查看的内容不存在或已被删除</p>',
          status: '未知',
          statusColor: '#999'
        },
        loading: false
      })
      if (detail && detail.title) {
        wx.setNavigationBarTitle({ title: detail.title })
      }
    }).catch(() => {
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  loadRelatedExposures(currentId) {
    this.setData({
      relatedExposures: mock.exposures
        .filter(item => String(item.id) !== String(currentId))
        .slice(0, 3)
    })
  },

  navigateToReport() {
    wx.navigateTo({ url: '/subpackages/exposure/pages/report/report' })
  },

  onShareAppMessage() {
    const detail = this.data.exposureDetail || {}
    return {
      title: detail.title || '亮叶企服曝光台',
      path: `/subpackages/exposure/pages/detail/detail?id=${detail.id}`,
      imageUrl: '/images/banner2.webp'
    }
  },

  previewImage(e) {
    const index = e.currentTarget.dataset.index
    const urls = this.data.exposureDetail.evidence || []
    if (!urls.length) return
    wx.previewImage({ current: urls[index], urls })
  },

  navigateToRelated(e) {
    const id = e.currentTarget.dataset.id
    this.loadExposureDetail(id)
    this.loadRelatedExposures(id)
  }
})
