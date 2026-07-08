const { getTipDetail } = require('../../api/tips')
const mock = require('../../../../api/mock')

Page({
  data: {
    tip: null,
    relatedExposures: [],
    relatedKnowledge: [],
    loading: true
  },

  onLoad(options) {
    this.loadTipDetail(options.id)
  },

  loadTipDetail(id) {
    this.setData({ loading: true })
    getTipDetail(id).then(tip => {
      const item = tip || {
        level: 'low',
        levelText: '一般',
        title: '内容不存在',
        content: '<p>您查看的内容不存在或已被删除</p>',
        case: '暂无',
        preventions: ['请返回列表页查看其他内容']
      }
      this.setData({
        tip: item,
        relatedExposures: mock.exposures.slice(0, 2),
        relatedKnowledge: mock.knowledge.slice(0, 2),
        loading: false
      })
      wx.setNavigationBarTitle({ title: item.title })
    }).catch(() => {
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  navigateToExposure(e) {
    wx.navigateTo({ url: `/subpackages/exposure/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  navigateToKnowledge(e) {
    wx.navigateTo({ url: `/subpackages/knowledge/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  goReport() {
    wx.navigateTo({ url: '/subpackages/exposure/pages/report/report' })
  },

  goChat() {
    wx.navigateTo({ url: '/subpackages/service/pages/chat/chat' })
  }
})
