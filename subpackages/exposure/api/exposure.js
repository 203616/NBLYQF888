const { get, post } = require('../../../utils/request')
const { getConfig } = require('../../../utils/config')
const mock = require('../../../api/mock')

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

function submitReport(data) {
  if (getConfig().useMockFallback) {
    return Promise.resolve({ id: Date.now(), ...data })
  }
  return post('/exposure/reports', data)
}

module.exports = {
  getExposureList,
  getExposureDetail,
  submitReport
}
