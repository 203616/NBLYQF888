const { get } = require('../../../utils/request')
const { getConfig } = require('../../../utils/config')
const mock = require('../../../api/mock')

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

module.exports = {
  getKnowledgeList,
  getKnowledgeDetail
}
