const { get } = require('../utils/request')
const { getConfig } = require('../utils/config')
const { normalizeMediaInObject } = require('../utils/image')
const mock = require('./mock')

const CATEGORY_LABELS = {
  business: '企业经营贷',
  personal: '个人消费贷',
  property: '房产抵押贷',
  auto: '汽车金融',
  lease: '融资租赁',
  warranty: '汽车延保'
}

function buildCategorySections(products) {
  return ['business', 'personal', 'property', 'auto', 'lease', 'warranty'].map(id => ({
    id,
    title: CATEGORY_LABELS[id],
    products: products.filter(p => p.category === id).slice(0, 3)
  })).filter(s => s.products.length > 0)
}

function getHomeData() {
  if (getConfig().useMockFallback) {
    const featured = mock.products.filter(p => p.category !== 'workflow').slice(0, 8)
    const categoryProducts = {
      business: mock.products.filter(p => p.category === 'business').slice(0, 3),
      personal: mock.products.filter(p => p.category === 'personal').slice(0, 3),
      property: mock.products.filter(p => p.category === 'property').slice(0, 3),
      auto: mock.products.filter(p => p.category === 'auto').slice(0, 3),
      lease: mock.products.filter(p => p.category === 'lease').slice(0, 3),
      warranty: mock.products.filter(p => p.category === 'warranty').slice(0, 3)
    }
    return Promise.resolve(normalizeMediaInObject({
      banners: mock.banners,
      stats: mock.stats,
      serviceScenes: mock.serviceScenes,
      newsList: mock.news.slice(0, 4),
      products: featured,
      categoryProducts,
      categorySections: buildCategorySections(mock.products),
      categoryNav: mock.homeCategoryNav,
      institutions: mock.ningboInstitutions,
      demands: mock.demands.slice(0, 3),
      cases: mock.cases
    }))
  }
  return get('/home', {}, { showError: false, timeout: 8000 })
    .then(data => normalizeMediaInObject(data))
    .catch(() => {
    const featured = mock.products.filter(p => p.category !== 'workflow').slice(0, 8)
    return normalizeMediaInObject({
      banners: mock.banners,
      stats: mock.stats,
      serviceScenes: mock.serviceScenes,
      newsList: mock.news.slice(0, 4),
      products: featured,
      categoryProducts: {},
      categorySections: buildCategorySections(mock.products),
      categoryNav: mock.homeCategoryNav,
      institutions: mock.ningboInstitutions,
      demands: mock.demands.slice(0, 3),
      cases: mock.cases
    })
  })
}

function getBannerDetail(id) {
  if (getConfig().useMockFallback) {
    return Promise.resolve(mock.createBannerDetail(mock.findById(mock.banners, id)))
  }
  return get(`/home/banners/${id}`, {}, { showError: false }).catch(() =>
    mock.createBannerDetail(mock.findById(mock.banners, id))
  )
}

module.exports = {
  getHomeData,
  getBannerDetail
}
