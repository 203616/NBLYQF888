const { search } = require('../../api/search')

const TYPE_LABELS = {
  product: '产品',
  news: '资讯',
  knowledge: '知识',
  tips: '避坑',
  exposure: '曝光',
  car: '车源',
  channel: '渠道'
}

Page({
  data: {
    keyword: '',
    results: [],
    searchTypes: [
      { name: '全部', type: 'all', active: true },
      { name: '产品', type: 'product', active: false },
      { name: '资讯', type: 'news', active: false },
      { name: '服务', type: 'service', active: false }
    ]
  },

  onLoad(options) {
    const keyword = decodeURIComponent(options.keyword || '')
    this.setData({ keyword })
    this.search(keyword)
  },

  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  switchType(e) {
    const type = e.currentTarget.dataset.type
    const searchTypes = this.data.searchTypes.map(item => ({ ...item, active: item.type === type }))
    this.setData({ searchTypes })
    this.search(this.data.keyword, type)
  },

  doSearch(e) {
    const keyword = (e.detail.value || this.data.keyword || '').trim()
    this.setData({ keyword })
    const active = this.data.searchTypes.find(item => item.active)
    this.search(keyword, active ? active.type : 'all')
  },

  goBack() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/home/home' }) })
  },

  goProducts() {
    wx.switchTab({ url: '/pages/products/products' })
  },

  search(keyword, type = 'all') {
    search(keyword, type).then(results => {
      const enriched = (results || []).map(item => ({
        ...item,
        typeLabel: TYPE_LABELS[item.type] || item.type
      }))
      this.setData({ results: enriched })
    })
  },

  navigateToDetail(e) {
    const item = this.data.results[e.currentTarget.dataset.index]
    if (!item?.path) return
    const tabPaths = ['/pages/home/home', '/pages/autoService/autoService', '/pages/products/products', '/pages/financeCircle/financeCircle', '/pages/profile/profile']
    const base = item.path.split('?')[0]
    if (tabPaths.includes(base)) {
      wx.switchTab({ url: base })
    } else {
      wx.navigateTo({ url: item.path })
    }
  }
})
