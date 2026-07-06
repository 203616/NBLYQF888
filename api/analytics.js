const { get } = require('../utils/request')
const { getConfig } = require('../utils/config')
const mock = require('./mock')

function getRegionStats(city) {
  if (getConfig().useMockFallback) {
    const districts = city ? (mock.regionDistricts[city] || []) : []
    return Promise.resolve({
      updatedAt: mock.regionStats[0] ? mock.regionStats[0].updatedAt : '',
      source: '国家统计局国家数据、浙江省公共数据开放平台、亮叶企服审核业务数据汇总',
      list: mock.regionStats,
      districts
    })
  }
  const params = city ? { city } : {}
  return get('/analytics/regions', params).then(data => ({
    ...data,
    districts: data.districts || mock.regionDistricts[city] || []
  }))
}

module.exports = {
  getRegionStats
}
