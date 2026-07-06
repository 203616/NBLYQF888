const { get } = require('../utils/request')
const { getConfig } = require('../utils/config')
const mock = require('./mock')
const { matchByCity, getAppLocation } = require('../utils/location')

function getCarList(params = {}) {
  if (getConfig().useMockFallback) {
    let list = mock.carListings
    if (params.city) {
      list = list.filter(item => item.city === params.city)
    } else {
      list = matchByCity(list, getAppLocation())
    }
    if (params.keyword) {
      list = list.filter(item => `${item.brand}${item.model}`.includes(params.keyword))
    }
    return Promise.resolve(list)
  }
  return get('/cars', params)
}

function getCarDetail(id) {
  if (getConfig().useMockFallback) {
    return Promise.resolve(mock.findById(mock.carListings, id))
  }
  return get(`/cars/${id}`)
}

module.exports = { getCarList, getCarDetail }
