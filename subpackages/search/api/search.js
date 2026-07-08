const { get } = require('../../../utils/request')
const { getConfig } = require('../../../utils/config')
const mock = require('../../../api/mock')

function search(keyword, type = 'all') {
  if (getConfig().useMockFallback) {
    return Promise.resolve(mock.searchAll(keyword, type))
  }
  return get('/content/search', { keyword, type })
}

module.exports = {
  search
}
