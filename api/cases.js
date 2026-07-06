const { get } = require('../utils/request')
const { getConfig } = require('../utils/config')
const mock = require('./mock')

function getCaseDetail(id) {
  if (getConfig().useMockFallback) {
    const item = mock.cases.find(c => String(c.id) === String(id)) || mock.cases[0]
    return Promise.resolve(mock.createCaseDetail(item))
  }
  return get(`/cases/${id}`)
}

function getCaseList() {
  if (getConfig().useMockFallback) {
    return Promise.resolve(mock.cases)
  }
  return get('/cases')
}

module.exports = {
  getCaseDetail,
  getCaseList
}
