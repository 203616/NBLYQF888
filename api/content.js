const { get, post } = require('../utils/request')
const { getConfig } = require('../utils/config')
const mock = require('./mock')

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

function getKnowledgeList() {
  if (getConfig().useMockFallback) {
    return Promise.resolve(mock.knowledge)
  }
  return get('/content/knowledge')
}

function getKnowledgeDetail(id) {
  if (getConfig().useMockFallback) {
    return Promise.resolve(mock.createKnowledgeDetail(mock.findById(mock.knowledge, id)))
  }
  return get(`/content/articles/knowledge/${id}`)
}

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

function getExposureList(params = {}) {
  if (getConfig().useMockFallback) {
    const list = params.type && params.type !== 'all'
      ? mock.exposures.filter(item => item.type === params.type)
      : mock.exposures
    return Promise.resolve(list)
  }
  return get('/exposure/list', params)
}

function getExposureDetail(id) {
  if (getConfig().useMockFallback) {
    return Promise.resolve(mock.createExposureDetail(mock.findById(mock.exposures, id)))
  }
  return get(`/exposure/${id}`)
}

function search(keyword, type = 'all') {
  if (getConfig().useMockFallback) {
    return Promise.resolve(mock.searchAll(keyword, type))
  }
  return get('/content/search', { keyword, type })
}

function submitReport(data) {
  if (getConfig().useMockFallback) {
    return Promise.resolve({ id: Date.now(), ...data })
  }
  return post('/exposure/reports', data)
}

module.exports = {
  getNewsList,
  getNewsDetail,
  getKnowledgeList,
  getKnowledgeDetail,
  getTipsList,
  getTipDetail,
  getExposureList,
  getExposureDetail,
  search,
  submitReport
}
