const { get, post } = require('../../../utils/request')
const { getConfig } = require('../../../utils/config')
const mock = require('../../../api/mock')
const { matchByCity, getAppLocation } = require('../../../utils/location')

function getClueList(params = {}) {
  if (getConfig().useMockFallback) {
    const type = params.type || 'all'
    let list = type === 'all'
      ? mock.clues
      : mock.clues.filter(item => item.type === type)
    if (params.city) {
      list = list.filter(item => item.city === params.city)
    } else {
      list = matchByCity(list, getAppLocation())
    }
    return Promise.resolve(list)
  }
  return get('/clues', params)
}
function getClueDetail(id) {
  if (getConfig().useMockFallback) {
    return Promise.resolve(mock.clues.find(item => String(item.id) === String(id)) || mock.clues[0])
  }
  return get(`/clues/${id}`)
}

function createClue(data) {
  if (getConfig().useMockFallback) {
    return Promise.resolve({
      id: Date.now(),
      verified_status: 'pending',
      status: '待审核',
      ...data
    })
  }
  return post('/clues', data)
}

module.exports = {
  getClueList,
  getClueDetail,
  createClue
}
