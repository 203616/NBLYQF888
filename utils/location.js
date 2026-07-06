const STORAGE_KEY = 'userLocation'

const CITY_BUCKETS = [
  { city: '宁波市', province: '浙江省', minLng: 121.2, maxLng: 122.2, minLat: 29.6, maxLat: 30.2 },
  { city: '杭州市', province: '浙江省', minLng: 119.8, maxLng: 120.6, minLat: 29.9, maxLat: 30.6 },
  { city: '绍兴市', province: '浙江省', minLng: 120.3, maxLng: 121.0, minLat: 29.7, maxLat: 30.3 },
  { city: '温州市', province: '浙江省', minLng: 120.3, maxLng: 121.2, minLat: 27.6, maxLat: 28.5 },
  { city: '上海市', province: '上海市', minLng: 121.0, maxLng: 122.0, minLat: 30.9, maxLat: 31.6 },
  { city: '南京市', province: '江苏省', minLng: 118.5, maxLng: 119.2, minLat: 31.8, maxLat: 32.3 }
]

const DEFAULT_LOCATION = {
  province: '浙江省',
  city: '宁波市',
  district: '鄞州区',
  address: '浙江省宁波市',
  latitude: 29.8683,
  longitude: 121.544,
  source: 'default'
}

function guessCityByCoordinate(latitude, longitude) {
  const matched = CITY_BUCKETS.find(item =>
    longitude >= item.minLng &&
    longitude <= item.maxLng &&
    latitude >= item.minLat &&
    latitude <= item.maxLat
  )
  if (!matched) return { province: '浙江省', city: '宁波市' }
  return { province: matched.province, city: matched.city }
}

function normalizeLocation(payload = {}) {
  const province = payload.province || DEFAULT_LOCATION.province
  const city = payload.city || DEFAULT_LOCATION.city
  const district = payload.district || ''
  const address = payload.address || [province, city, district].filter(Boolean).join('')
  return {
    province,
    city,
    district,
    address,
    latitude: payload.latitude || DEFAULT_LOCATION.latitude,
    longitude: payload.longitude || DEFAULT_LOCATION.longitude,
    source: payload.source || 'cache',
    updatedAt: payload.updatedAt || new Date().toISOString()
  }
}

function getCachedLocation() {
  const cached = wx.getStorageSync(STORAGE_KEY)
  return cached ? normalizeLocation(cached) : null
}

function saveLocation(location) {
  const normalized = normalizeLocation(location)
  wx.setStorageSync(STORAGE_KEY, normalized)
  const app = getApp()
  if (app) {
    app.globalData.location = normalized
  }
  return normalized
}

function getAppLocation() {
  const app = getApp()
  if (app && app.globalData.location) {
    return app.globalData.location
  }
  return getCachedLocation() || DEFAULT_LOCATION
}

function requestLocation(options = {}) {
  const { showError = true } = options
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      isHighAccuracy: true,
      success(res) {
        const cityInfo = guessCityByCoordinate(res.latitude, res.longitude)
        const location = saveLocation({
          ...cityInfo,
          latitude: res.latitude,
          longitude: res.longitude,
          source: 'gps'
        })
        resolve(location)
      },
      fail(err) {
        const cached = getCachedLocation()
        if (cached) {
          resolve(cached)
          return
        }
        const fallback = saveLocation(DEFAULT_LOCATION)
        if (showError) {
          wx.showToast({ title: '定位失败，已使用默认城市', icon: 'none' })
        }
        reject({ ...err, fallback })
      }
    })
  })
}

function chooseLocation() {
  return new Promise((resolve, reject) => {
    wx.chooseLocation({
      success(res) {
        const cityInfo = guessCityByCoordinate(res.latitude, res.longitude)
        const location = saveLocation({
          ...cityInfo,
          district: res.name || '',
          address: res.address || res.name || '',
          latitude: res.latitude,
          longitude: res.longitude,
          source: 'manual'
        })
        resolve(location)
      },
      fail: reject
    })
  })
}

function ensureLocation(options = {}) {
  const cached = getCachedLocation()
  if (cached && !options.force) {
    return Promise.resolve(cached)
  }
  return requestLocation(options)
}

function matchByCity(list, location) {
  const current = location || getAppLocation()
  if (!current || !current.city) return list
  const local = list.filter(item => item.city === current.city || (item.location && item.location.includes(current.city)))
  return local.length ? local : list
}

module.exports = {
  DEFAULT_LOCATION,
  getCachedLocation,
  getAppLocation,
  saveLocation,
  requestLocation,
  chooseLocation,
  ensureLocation,
  matchByCity,
  guessCityByCoordinate,
  normalizeLocation
}
