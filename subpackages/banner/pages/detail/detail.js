const { getBannerDetail } = require('../../../../api/home')
const mock = require('../../../../api/mock')

Page({
  data: {
    bannerDetail: null,
    relatedProducts: [],
    loading: true
  },

  onLoad(options) {
    this.loadBannerDetail(options.id)
  },

  loadBannerDetail(id) {
    this.setData({ loading: true })
    getBannerDetail(id).then(detail => {
      const relatedProducts = mock.products.slice(0, 4).map(p => ({
        id: p.id,
        name: p.name,
        cover: p.cover,
        path: p.path
      }))
      this.setData({ bannerDetail: detail || {}, relatedProducts, loading: false })
      if (detail?.title) wx.setNavigationBarTitle({ title: detail.title })
    }).catch(() => {
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  handleAction() {
    this.navigateToLink()
  },

  navigateToLink() {
    const url = this.data.bannerDetail?.link
    if (!url) {
      wx.showToast({ title: '暂无跳转链接', icon: 'none' })
      return
    }
    if (url.startsWith('/pages/')) {
      const tabPath = url.split('?')[0]
      wx.switchTab({ url: tabPath })
      if (url.includes('category=')) {
        wx.setStorageSync('productsCategory', url.split('category=')[1].split('&')[0])
      }
      return
    }
    wx.navigateTo({ url })
  },

  navigateToProduct(e) {
    const id = e.currentTarget.dataset.id
    const product = this.data.relatedProducts.find(p => p.id === id)
    if (!product?.path) {
      wx.navigateTo({ url: `/subpackages/product/pages/detail/detail?id=${id}` })
      return
    }
    if (product.path.startsWith('/pages/')) {
      wx.switchTab({ url: product.path })
    } else {
      wx.navigateTo({ url: product.path })
    }
  }
})
