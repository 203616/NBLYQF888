const { getProducts } = require('../../api/products')
const { preloadForPage } = require('../../utils/subpackagePreload')

const CATEGORY_NAMES = {
  all: '全部产品',
  auto: '汽车金融',
  business: '企业贷款',
  personal: '个人贷款',
  property: '抵押咨询',
  lease: '融资租赁',
  private: '民间风险',
  warranty: '汽车延保',
  workflow: '进件系统'
}

Page({
  data: {
    activeCategory: 'all',
    activeCategoryName: '全部产品',
    categories: [
      { id: 'all', name: '全部', icon: '全' },
      { id: 'auto', name: '汽车金融', icon: '车' },
      { id: 'business', name: '企业贷款', icon: '企' },
      { id: 'personal', name: '个人贷款', icon: '人' },
      { id: 'property', name: '抵押咨询', icon: '押' },
      { id: 'lease', name: '融资租赁', icon: '租' },
      { id: 'private', name: '民间风险', icon: '险' },
      { id: 'warranty', name: '汽车延保', icon: '保' },
      { id: 'workflow', name: '进件系统', icon: '件' }
    ],
    productList: [],
    loading: true,
    tappingId: ''
  },

  onLoad(options) {
    preloadForPage('pages/products/products')
    const category = options.category || wx.getStorageSync('productsCategory') || 'all'
    if (wx.getStorageSync('productsCategory')) wx.removeStorageSync('productsCategory')
    this.setData({
      activeCategory: category,
      activeCategoryName: CATEGORY_NAMES[category] || '全部产品'
    }, () => this.loadProducts())
  },

  onShow() {
    const pending = wx.getStorageSync('productsCategory')
    if (pending) {
      wx.removeStorageSync('productsCategory')
      this.setData({
        activeCategory: pending,
        activeCategoryName: CATEGORY_NAMES[pending] || '全部产品'
      }, () => this.loadProducts())
    }
  },

  loadProducts() {
    this.setData({ loading: true })
    getProducts({ category: this.data.activeCategory })
      .then(productList => {
        this.setData({ productList, loading: false })
      })
      .catch(() => {
        this.setData({ loading: false })
      })
  },

  handleCategoryTap(e) {
    const id = e.currentTarget.dataset.id
    if (id === this.data.activeCategory) return
    wx.vibrateShort({ type: 'light' })
    this.setData({
      activeCategory: id,
      activeCategoryName: CATEGORY_NAMES[id] || '全部产品'
    }, () => this.loadProducts())
  },

  handleProductTap(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ tappingId: id })
    setTimeout(() => this.setData({ tappingId: '' }), 200)
    const product = this.data.productList.find(item => String(item.id) === String(id))
    if (!product) return
    if (product.path && product.path.startsWith('/subpackages/')) {
      wx.navigateTo({
        url: product.path,
        fail: () => wx.showToast({ title: '页面跳转失败', icon: 'none' })
      })
      return
    }
    if (product.path && product.path.startsWith('/pages/')) {
      wx.switchTab({ url: product.path.split('?')[0] })
      return
    }
    wx.navigateTo({
      url: `/subpackages/product/pages/detail/detail?id=${id}`,
      fail: () => wx.showToast({ title: '产品详情加载失败', icon: 'none' })
    })
  },

  goIntake() {
    const { goIntake } = require('../../utils/intakeNav')
    goIntake({ productType: 'workflow', productName: '产品大全进件' })
  }
})
