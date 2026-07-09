const { getHomeData } = require('../../api/home')
const { getAppLocation, chooseLocation } = require('../../utils/location')
const { preloadForPage } = require('../../utils/subpackagePreload')
const { normalizeImageField } = require('../../utils/image')

const SERVICE_GRID = [
  { icon: '🏢', title: '经营贷', path: '/pages/products/products?category=business' },
  { icon: '👤', title: '消费贷', path: '/pages/products/products?category=personal' },
  { icon: '🏠', title: '抵押贷', path: '/pages/products/products?category=property' },
  { icon: '⚙️', title: '融资租赁', path: '/pages/products/products?category=lease' },
  { icon: '🚗', title: '新车按揭', path: '/subpackages/autoFinance/pages/newCar/newCar' },
  { icon: '🔄', title: '二手车贷', path: '/subpackages/autoFinance/pages/usedCar/usedCar' },
  { icon: '🔑', title: '车辆抵押', path: '/subpackages/autoFinance/pages/carMortgage/carMortgage' },
  { icon: '🛡️', title: '汽车延保', path: '/subpackages/autoFinance/pages/warranty/warranty' },
  { icon: '🧮', title: '计算器', path: '/subpackages/tools/pages/calculator/calculator' },
  { icon: '🚙', title: '亮叶好车', path: '/subpackages/cars/pages/list/list' },
  { icon: '📊', title: '车辆估值', path: '/subpackages/tools/pages/valuation/valuation' },
  { icon: '⛽', title: '油价查询', path: '/subpackages/tools/pages/fuel/fuel' },
  { icon: '💬', title: '智能客服', path: '/subpackages/service/pages/chat/chat' },
  { icon: '📈', title: '地区数据', path: '/subpackages/stats/pages/region/region' },
  { icon: '🤝', title: '助融渠道', path: '/subpackages/channel/pages/list/list' },
  { icon: '💡', title: '易融圈', path: '/pages/financeCircle/financeCircle' }
]

function withCover(item) {
  if (!item) return item
  return {
    ...item,
    cover: item.cover ? normalizeImageField(item.cover) : '',
    img: item.img ? normalizeImageField(item.img) : item.img
  }
}

Page({
  data: {
    serviceGrid: SERVICE_GRID,
    banners: [],
    stats: [],
    newsList: [],
    productList: [],
    institutions: [],
    cases: [],
    demandList: [],
    searchValue: '',
    loading: true,
    location: null
  },

  onLoad() {
    if (!wx.getStorageSync('onboardingCompleted')) {
      wx.redirectTo({ url: '/pages/welcome/welcome' })
      return
    }
    preloadForPage('pages/home/home')
    this.setData({ location: getAppLocation() })
    this.loadHomeData()
  },

  onShow() {
    if (wx.getStorageSync('onboardingCompleted')) {
      this.setData({ location: getAppLocation() })
    }
  },

  onPullDownRefresh() {
    this.loadHomeData()
  },

  loadHomeData() {
    getHomeData()
      .then(data => {
        if (!data || typeof data !== 'object') {
          this.setData({ loading: false })
          wx.stopPullDownRefresh()
          return
        }
        const safe = (arr) => Array.isArray(arr) ? arr : []
        const safeMap = (arr) => safe(arr).map(withCover)
        this.setData({
          banners: safeMap(data.banners).filter(b => b.img),
          stats: safe(data.stats),
          newsList: safeMap(data.newsList).slice(0, 4),
          productList: safeMap(data.products || data.productList).slice(0, 8),
          institutions: safe(data.institutions),
          demandList: safeMap(data.demands || data.demandList).slice(0, 2),
          cases: safeMap(data.cases).slice(0, 3),
          loading: false
        })
        wx.stopPullDownRefresh()
      })
      .catch(() => {
        this.setData({ loading: false })
        wx.stopPullDownRefresh()
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

  navigateGrid(e) {
    const path = e.currentTarget.dataset.path
    if (!path) return
    if (path.startsWith('/pages/')) {
      const tabPath = path.split('?')[0]
      wx.switchTab({ url: tabPath })
      if (path.includes('category=')) {
        wx.setStorageSync('productsCategory', path.split('category=')[1].split('&')[0])
      }
    } else {
      wx.navigateTo({ url: path })
    }
  },

  navigateToProducts() {
    wx.switchTab({ url: '/pages/products/products' })
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
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: `/subpackages/demand/pages/detail/detail?id=${id}` })
  },

  navigateToDemand() {
    wx.switchTab({ url: '/pages/financeCircle/financeCircle' })
  },

  handleChooseCity() {
    chooseLocation().then(location => {
      this.setData({ location })
    })
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
  }
})
