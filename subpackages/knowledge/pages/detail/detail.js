const { getKnowledgeDetail } = require('../../../../api/content')
const mock = require('../../../../api/mock')

Page({
  data: {
    knowledge: null,
    testQuestion: null,
    selectedOption: null,
    relatedProducts: [],
    relatedTips: [],
    loading: true
  },

  onLoad(options) {
    this.loadKnowledgeDetail(options.id)
  },

  loadKnowledgeDetail(id) {
    this.setData({ loading: true, selectedOption: null })
    getKnowledgeDetail(id).then(knowledge => {
      const item = knowledge || {
        title: '内容不存在',
        level: '-',
        date: '-',
        views: 0,
        content: '<p>您查看的内容不存在或已被删除</p>',
        testQuestion: { question: '暂无测试题', options: ['返回列表'], answer: 0 }
      }
      this.setData({
        knowledge: item,
        testQuestion: item.testQuestion,
        relatedProducts: mock.products.slice(0, 2),
        relatedTips: mock.tips.slice(0, 2),
        loading: false
      })
      wx.setNavigationBarTitle({ title: item.title })
    }).catch(() => {
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  selectOption(e) {
    const index = e.currentTarget.dataset.index
    const isCorrect = index === this.data.testQuestion.answer
    this.setData({ selectedOption: index })
    wx.showToast({
      title: isCorrect ? '回答正确！' : '再想想',
      icon: isCorrect ? 'success' : 'none'
    })
  },

  navigateToProduct(e) {
    const path = e.currentTarget.dataset.path
    if (path && path.startsWith('/subpackages/')) {
      wx.navigateTo({ url: path })
    } else {
      wx.switchTab({ url: '/pages/products/products' })
    }
  },

  navigateToTip(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/subpackages/tips/pages/detail/detail?id=${id}` })
  }
})
