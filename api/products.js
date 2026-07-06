const { get } = require('../utils/request')
const { getConfig } = require('../utils/config')
const mock = require('./mock')

function getProducts(params = {}) {
  if (getConfig().useMockFallback) {
    const category = params.category || 'all'
    const list = category === 'all'
      ? mock.products
      : mock.products.filter(item => item.category === category)
    return Promise.resolve(list)
  }
  return get('/products', params)
}

function getProductDetail(id) {
  if (getConfig().useMockFallback) {
    const product = mock.products.find(item => String(item.id) === String(id)) || mock.products[0]
    return Promise.resolve(mock.createProductDetail(product))
  }
  return get(`/products/${id}`)
}

function submitApplication(data) {
  if (getConfig().useMockFallback) {
    return Promise.resolve({
      id: Date.now(),
      status: '已提交',
      createdAt: new Date().toISOString().slice(0, 10),
      ...data
    })
  }
  const { post } = require('../utils/request')
  return post('/applications', data)
}

module.exports = {
  getProducts,
  getProductDetail,
  submitApplication
}
