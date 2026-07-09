const { getAppLocation, chooseLocation } = require('../../utils/location')
const { preloadForPage } = require('../../utils/subpackagePreload')

const catalog = require('../../data/auto-finance-catalog')

Page({
  data: {
    products: catalog.autoFinanceProducts.slice(0, 6),
    allProducts: catalog.autoFinanceProducts,    tools: [
      { id: 'calculator', title: '金融计算器', icon: '🧮', url: '/subpackages/tools/pages/calculator/calculator' },
      { id: 'valuation', title: '车辆估值', icon: '🔍', url: '/subpackages/tools/pages/valuation/valuation' },
      { id: 'fuel', title: '油价查询', icon: '⛽', url: '/subpackages/tools/pages/fuel/fuel' },
      { id: 'cars', title: '靠谱好车', icon: '🚗', url: '/subpackages/cars/pages/list/list' }
    ],
    location: null,
    stats: [
      { label: '机构产品', value: `${catalog.autoFinanceProducts.length}+` },
      { label: '车主工具', value: '4' },
      { label: '合作车商', value: '20+' }
    ],  },

  onShow() {
    preloadForPage('pages/autoService/autoService')
    this.setData({ location: getAppLocation() })
  },

  handleChooseCity() {
    chooseLocation().then(location => this.setData({ location }))
  },

  handleProductTap(e) {
    const product = this.data.products.find(p => p.id === e.currentTarget.dataset.id)
    if (product?.url) wx.navigateTo({ url: product.url })
  },

  handleToolTap(e) {
    const url = e.currentTarget.dataset.url
    if (url) wx.navigateTo({ url })
  },

  handleServiceTap(e) {
    const { type, index } = e.currentTarget.dataset
    if (type === 'clue') {
      const clueTypes = ['new', 'mortgage']
      wx.navigateTo({ url: `/subpackages/clue/pages/list/list?type=${clueTypes[index] || 'all'}` })
    } else {
      const types = ['basic', 'premium']
      wx.navigateTo({ url: `/subpackages/autoFinance/pages/warranty/warranty?type=${types[index] || 'basic'}` })
    }
  },

  navigateToPrepayment() {
    wx.navigateTo({ url: '/subpackages/autoFinance/pages/prepayment/prepayment' })
  },

  navigateToList() {
    wx.navigateTo({ url: '/subpackages/autoFinance/pages/list/list' })
  },

  goClueList() {
    wx.navigateTo({ url: '/subpackages/clue/pages/list/list' })
  },

  goWarranty() {
    wx.navigateTo({ url: '/subpackages/autoFinance/pages/warranty/warranty' })
  },

  goIntake() {
    const { goIntake } = require('../../utils/intakeNav')
    goIntake({ productType: 'autoFinance', productName: '汽车金融进件' })
  },

  goChat() {
    wx.navigateTo({ url: '/subpackages/service/pages/chat/chat' })
  }
})
