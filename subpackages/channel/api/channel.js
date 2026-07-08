const { get, post } = require('../../../utils/request')
const { getConfig } = require('../../../utils/config')
const mock = require('../../../api/mock')
const { matchByCity, getAppLocation } = require('../../../utils/location')

function getChannelList(params = {}) {
  if (getConfig().useMockFallback) {
    let list = mock.channelPartners
    if (params.city) {
      list = list.filter(item => item.city === params.city)
    } else {
      list = matchByCity(list, getAppLocation())
    }
    return Promise.resolve(list)
  }
  return get('/channels', params)
}

function applyChannel(data) {
  if (getConfig().useMockFallback) {
    return Promise.resolve({
      id: Date.now(),
      status: 'submitted',
      message: '渠道入驻申请已提交，亮叶企服将在1个工作日内联系您。'
    })
  }
  return post('/channels/apply', data)
}

module.exports = { getChannelList, applyChannel }
