const { get } = require('../../../utils/request')
const { getConfig } = require('../../../utils/config')
const mock = require('../../../api/mock')

function getNewsList(params = {}) {
  if (getConfig().useMockFallback) {
    const keyword = params.keyword || ''
    const list = keyword
      ? mock.news.filter(item => item.title.includes(keyword) || item.summary.includes(keyword))
      : mock.news
    return Promise.resolve(list)
  }
  return get('/content/news', params)
}

function getNewsDetail(id) {
  if (getConfig().useMockFallback) {
    return Promise.resolve(mock.createNewsDetail(mock.findById(mock.news, id)))
  }
  return get(`/content/articles/news/${id}`)
}

module.exports = {
  getNewsList,
  getNewsDetail
}
