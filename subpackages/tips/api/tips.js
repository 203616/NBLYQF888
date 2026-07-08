const { get } = require('../../../utils/request')
const { getConfig } = require('../../../utils/config')
const mock = require('../../../api/mock')

function getTipsList() {
  if (getConfig().useMockFallback) {
    return Promise.resolve(mock.tips)
  }
  return get('/content/tips')
}

function getTipDetail(id) {
  if (getConfig().useMockFallback) {
    return Promise.resolve(mock.createTipDetail(mock.findById(mock.tips, id)))
  }
  return get(`/content/articles/tips/${id}`)
}

module.exports = {
  getTipsList,
  getTipDetail
}
