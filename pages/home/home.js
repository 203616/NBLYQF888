const { getHomeData } = require('../../api/home')
const { getAppLocation, chooseLocation, requestLocation } = require('../../utils/location')
const { preloadForPage } = require('../../utils/subpackagePreload')

Page({
  data: {
    banners: [],
    stats: [],
    newsList: [],
    productList: [],
    categoryNav: [],
    institutions: [],
    categorySections: [],
    cases: [],
    demandData: null,
    services: [],
    searchValue: '',
    loading: true,
    location: null,
    toolEntries: [
      { title: '计算器', desc: '多产品还款测算', path: '/subpackages/tools/pages/calculator/calculator', icon: '/images/icon/calculator.png' },
      { title: '亮叶好车', desc: '本地精选车源', path: '/subpackages/cars/pages/list/list', icon: '/images/icon/car-finance.png' },
      { title: '车辆估值', desc: '快速参考估值', path: '/subpackages/tools/pages/valuation/valuation', icon: '/images/icon/car-clue.png' },
      { title: '油价查询', desc: '本地油价参考', path: '/subpackages/tools/pages/fuel/fuel', icon: '/images/icon/fuel.png' }
    ]
  },

  onLoad() {
    if (!wx.getStorageSync('onboardingCompleted')) return
    preloadForPage('pages/home/home')
    this.initLocation()
    this.loadHomeData()
  },

  onShow() {
    if (wx.getStorageSync('onboardingCompleted')) {
      this.setData({ location: getAppLocation() })
    }
  },

  initLocation() {
    requestLocation({ showError: false })
      .catch(() => null)
      .finally(() => {
        this.setData({ location: getAppLocation() })
      })
  },

  loadHomeData() {
    getHomeData()
      .then(data => {
        this.setData({
          banners: data.banners || [],
          stats: data.stats || [],
          services: data.serviceScenes || [],
          newsList: data.newsList || [],
          productList: data.products || [],
          categoryNav: data.categoryNav || [],
          institutions: data.institutions || [],
          categoryProducts: data.categoryProducts || {},
          categorySections: data.categorySections || [],
          demandList: data.demands || [],
          demandData: (data.demands && data.demands[0]) || null,
          cases: data.cases || [],
          loading: false
        })
      })
      .catch(() => {
        this.setData({ loading: false })
      })
  },

  handleSearchInput(e) {
    this.setData({ searchValue: e.detail.value })
  },

  handleSearch(e) {
    const value = (e.detail.value || this.data.searchValue || '').trim()
    if (!value) {
      wx.showToast({ title: '请输入搜索关键词', icon: 'none' })
      return
    }
    wx.navigateTo({
      url: `/subpackages/search/pages/result/result?keyword=${encodeURIComponent(value)}`
    })
  },

  handleBannerTap(e) {
    const index = e.detail?.index ?? e.currentTarget?.dataset?.index
    const banner = this.data.banners[index]
    if (banner && banner.link) {
      wx.navigateTo({ url: banner.link })
    }
  },

  navigateToService(e) {
    const path = e.currentTarget.dataset.path
    if (path) {
      if (path.startsWith('/pages/')) {
        const tabPath = path.split('?')[0]
        wx.switchTab({ url: tabPath })
        if (path.includes('category=')) {
          wx.setStorageSync('productsCategory', path.split('category=')[1].split('&')[0])
        }
      } else {
        wx.navigateTo({ url: path })
      }
    }
  },

  navigateToNews() {
    wx.navigateTo({ url: '/subpackages/news/pages/list/list' })
  },

  navigateToProduct(e) {
    const path = e.currentTarget.dataset.path
    if (path && path.startsWith('/subpackages/')) {
      wx.navigateTo({ url: path })
    } else {
      wx.switchTab({ url: '/pages/products/products' })
    }
  },

  navigateToDemandDetail(e) {
    const id = e.currentTarget.dataset.id || (this.data.demandData && this.data.demandData.id)
    if (id) wx.navigateTo({ url: `/subpackages/demand/pages/detail/detail?id=${id}` })
  },

  navigateToDemand() {
    wx.switchTab({ url: '/pages/financeCircle/financeCircle' })
  },

  navigateToProducts() {
    wx.switchTab({ url: '/pages/products/products' })
  },

  navigateToServiceChat() {
    wx.navigateTo({ url: '/subpackages/service/pages/chat/chat' })
  },

  navigateToRegionStats() {
    wx.navigateTo({ url: '/subpackages/stats/pages/region/region' })
  },

  handleChooseCity() {
    chooseLocation().then(location => {
      this.setData({ location })
    })
  },

  navigateToTool(e) {
    const path = e.currentTarget.dataset.path
    if (path) wx.navigateTo({ url: path })
  },

  navigateToNewsDetail(e) {
    const id = e.detail.id
    if (id) {
      wx.navigateTo({ url: `/subpackages/news/pages/detail/detail?id=${id}` })
    }
  },

  navigateToCase(e) {
    const path = e.currentTarget.dataset.path
    if (!path) return
    if (path.startsWith('/pages/')) {
      wx.switchTab({ url: path })
    } else {
      wx.navigateTo({ url: path })
    }
  },

  navigateToCategory(e) {
    const path = e.currentTarget.dataset.path
    if (!path) return
    if (path.startsWith('/pages/')) {
      wx.switchTab({ url: path.split('?')[0] })
      if (path.includes('category=')) {
        wx.setStorageSync('productsCategory', path.split('category=')[1])
      }
    } else {
      wx.navigateTo({ url: path })
    }
  },

  navigateToCategoryProducts(e) {
    const category = e.currentTarget.dataset.category
    if (category) {
      wx.setStorageSync('productsCategory', category)
      wx.switchTab({ url: '/pages/products/products' })
    }
  },

  navigateToInstitutionProduct(e) {
    const name = e.currentTarget.dataset.name
    const map = {
      '宁波银行': '/subpackages/product/pages/detail/detail?id=11',
      '工商银行宁波市分行': '/subpackages/product/pages/detail/detail?id=17',
      '农业银行宁波市分行': '/subpackages/product/pages/detail/detail?id=12',
      '建设银行宁波市分行': '/subpackages/product/pages/detail/detail?id=13',
      '中国银行宁波市分行': '/subpackages/product/pages/detail/detail?id=16',
      '邮储银行宁波市分行': '/subpackages/product/pages/detail/detail?id=19',
      '浙江海港融资租赁': '/subpackages/product/pages/detail/detail?id=20'
    }
    const url = map[name] || '/pages/products/products'
    if (url.startsWith('/pages/')) wx.switchTab({ url })
    else wx.navigateTo({ url })
  },

  navigateToChannel() {
    wx.navigateTo({ url: '/subpackages/channel/pages/list/list' })
  }
})