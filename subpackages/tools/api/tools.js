const { get, post } = require('../../../utils/request')
const { getConfig } = require('../../../utils/config')
const mock = require('../../../api/mock')
const { getAppLocation } = require('../../../utils/location')

function getFuelPrices(city) {
  if (getConfig().useMockFallback) {
    const currentCity = city || getAppLocation().city
    const item = mock.fuelPrices.items.find(entry => entry.city === currentCity) || mock.fuelPrices.items[0]
    return Promise.resolve({ ...mock.fuelPrices, current: item })
  }
  return get('/tools/fuel', { city })
}

function estimateVehicle(data) {
  if (getConfig().useMockFallback) {
    return Promise.resolve(mock.estimateCarValue(data))
  }
  return post('/tools/valuation', data)
}

function getValuationBrands() {
  if (getConfig().useMockFallback) {
    return Promise.resolve(mock.valuationBrands)
  }
  return get('/tools/valuation/brands')
}

function submitValuation(data) {
  if (getConfig().useMockFallback) {
    const estimate = mock.estimateCarValue(data)
    const record = { ...estimate, synced: false, id: Date.now(), createdAt: new Date().toISOString() }
    const history = wx.getStorageSync('valuation_history') || []
    history.unshift(record)
    wx.setStorageSync('valuation_history', history.slice(0, 20))
    return Promise.resolve(record)
  }
  return post('/tools/valuation/submit', data)
}

module.exports = { getFuelPrices, estimateVehicle, getValuationBrands, submitValuation }
