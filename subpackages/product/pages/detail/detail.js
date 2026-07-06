const { getProductDetail } = require('../../../../api/products')
const { goIntakeFromProduct } = require('../../../../utils/intakeNav')

Page({
  data: {
    product: null,
    submitting: false
  },

  onLoad(options) {
    this.loadProduct(options.id)
  },

  loadProduct(id) {
    getProductDetail(id).then(product => {
      this.setData({
        product: {
          ...product,
          highlights: product.highlights || [],
          process: product.process || [],
          materials: product.materials || [],
          faq: product.faq || []
        }
      })
      wx.setNavigationBarTitle({ title: product.name })
    })
  },

  submitApply() {
    if (this.data.submitting || !this.data.product) return
    this.setData({ submitting: true })
    goIntakeFromProduct(this.data.product)
    this.setData({ submitting: false })
  },

  goChat() {
    wx.navigateTo({ url: '/subpackages/service/pages/chat/chat' })
  }
})
