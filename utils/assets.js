/** 全局图片资源路径 — 主包仅保留 tabBar/登录横幅，内容图在分包 */
const MEDIA = '/subpackages'

const ASSETS = {
  logo: '/images/logo.webp',
  avatar: '/images/avatar.webp',
  banner1: '/images/banner1.webp',
  banner2: '/images/banner2.webp',
  banner3: '/images/banner3.webp',
  product: (id) => `${MEDIA}/product/images/products/product-${id}.webp`,
  news: (id) => `${MEDIA}/news/images/news/news-${id}.webp`,
  car: (id) => `${MEDIA}/cars/images/cars/car-${id}.webp`,
  knowledge: (id) => `${MEDIA}/knowledge/images/knowledge/knowledge-${id}.webp`,
  tips: (id) => `${MEDIA}/tips/images/tips/tips-${id}.webp`,
  exposure: (id) => `${MEDIA}/exposure/images/exposure/exposure-${id}.webp`,
  channelAvatar: (id) => `${MEDIA}/channel/images/channel/avatar-${id}.webp`,
  case: (id) => `${MEDIA}/cases/images/cases/case-${id}.webp`,
  intake: (id) => `${MEDIA}/intake/images/intake/${id}.webp`,
  warrantyBasic: `${MEDIA}/autoFinance/images/warranty-basic.webp`,
  warrantyPremium: `${MEDIA}/autoFinance/images/warranty-premium.webp`,
  icon: {
    location: '/images/icon/location.png',
    calculator: '/images/icon/calculator.png',
    fuel: '/images/icon/fuel.png',
    carFinance: '/images/icon/car-finance.png',
    carNew: '/images/icon/car-new.png',
    carUsed: '/images/icon/car-used.png',
    carLoan: '/images/icon/car-loan.png',
    knowledge: '/images/icon/knowledge.png',
    tip: '/images/icon/tip.png'
  }
}

function resolveImage(path) {
  const { preferWebp, getImageUrl, getFallbackPath } = require('./image')
  return getImageUrl(preferWebp(path))
}

module.exports = { ASSETS, resolveImage, preferWebp: require('./image').preferWebp, getFallbackPath: require('./image').getFallbackPath }
