import request from './request'

export function getRegionStats() {
  return request.get('/analytics/regions')
}

export function getDataSources() {
  return request.get('/analytics/sources')
}
