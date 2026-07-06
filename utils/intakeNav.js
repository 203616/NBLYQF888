const PRODUCT_TYPE_MAP = {
  1: 'newCar',
  2: 'usedCar',
  3: 'mortgage',
  4: 'business',
  5: 'property',
  6: 'personal',
  7: 'lease',
  8: 'workflow',
  9: 'warranty',
  10: 'autoFinance'
}

const CATEGORY_TYPE_MAP = {
  auto: 'newCar',
  business: 'business',
  personal: 'personal',
  property: 'property',
  lease: 'lease',
  warranty: 'warranty',
  private: 'workflow',
  workflow: 'autoFinance'
}

function goIntake(options = {}) {
  const parts = []
  if (options.productType) parts.push(`productType=${options.productType}`)
  if (options.productName) parts.push(`productName=${encodeURIComponent(options.productName)}`)
  if (options.productId) parts.push(`productId=${options.productId}`)
  if (options.applicationNo) parts.push(`applicationNo=${options.applicationNo}`)
  if (options.demandId) parts.push(`demandId=${options.demandId}`)
  const query = parts.length ? `?${parts.join('&')}` : ''
  wx.navigateTo({ url: `/subpackages/intake/pages/index/index${query}` })
}

function goIntakeFromProduct(product) {
  if (!product) return
  const productType = product.intakeType || PRODUCT_TYPE_MAP[product.id] || CATEGORY_TYPE_MAP[product.category] || 'newCar'
  goIntake({
    productType,
    productName: product.name,
    productId: product.id
  })
}

function goIntakeFromDemand(demand) {
  if (!demand) return
  const { initIntakeFromDemand } = require('../api/intake')
  wx.showLoading({ title: '准备进件...' })
  initIntakeFromDemand(demand)
    .then(() => {
      goIntake({
        productType: 'business',
        productName: `易融圈-${demand.title || '经营贷进件'}`,
        demandId: demand.id
      })
    })
    .finally(() => wx.hideLoading())
}

module.exports = {
  goIntake,
  goIntakeFromProduct,
  goIntakeFromDemand,
  PRODUCT_TYPE_MAP,
  CATEGORY_TYPE_MAP
}
