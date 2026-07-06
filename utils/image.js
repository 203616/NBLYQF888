/**
 * 图片 URL 解析：WebP 优先、PNG 回退、生产 CDN 可选
 * 不删除本地资源，仅做路径拼接与回退映射
 */
const { getConfig } = require('./config')

/** 主包 WebP → 分包 PNG 回退（主包不放大图 PNG） */
const MAIN_FALLBACK_MAP = {
  '/images/banner1.webp': '/subpackages/banner/images/banner1.png',
  '/images/banner2.webp': '/subpackages/banner/images/banner2.png',
  '/images/banner3.webp': '/subpackages/banner/images/banner3.png',
  '/images/logo.webp': '/subpackages/banner/images/logo.png',
  '/images/avatar.webp': '/subpackages/banner/images/avatar.png'
}

function preferWebp(path) {
  if (!path || typeof path !== 'string') return path
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.endsWith('.webp')) return path
  return path.replace(/\.(png|jpe?g)$/i, '.webp')
}

function toLocalPath(urlPath) {
  if (!urlPath || typeof urlPath !== 'string') return urlPath
  const { cdnBaseUrl } = getConfig()
  const base = (cdnBaseUrl || '').replace(/\/$/, '')
  if (base && urlPath.startsWith(base)) {
    const rest = urlPath.slice(base.length)
    return rest.startsWith('/') ? rest : `/${rest}`
  }
  return urlPath.startsWith('/') ? urlPath : `/${urlPath}`
}

function getFallbackPath(path) {
  const local = toLocalPath(path)
  if (MAIN_FALLBACK_MAP[local]) return MAIN_FALLBACK_MAP[local]
  if (local.endsWith('.webp')) return local.replace(/\.webp$/i, '.png')
  return local
}

function getImageUrl(localPath) {
  if (!localPath || typeof localPath !== 'string') return localPath
  if (localPath.startsWith('http://') || localPath.startsWith('https://')) return localPath
  const { cdnBaseUrl, useCdnImages } = getConfig()
  const normalized = preferWebp(localPath.startsWith('/') ? localPath : `/${localPath}`)
  if (useCdnImages && cdnBaseUrl) {
    const base = cdnBaseUrl.replace(/\/$/, '')
    return `${base}${normalized}`
  }
  return normalized
}

function normalizeImageField(value) {
  if (!value || typeof value !== 'string') return value
  return getImageUrl(preferWebp(value))
}

function normalizeMediaInObject(obj) {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(normalizeMediaInObject)
  const IMAGE_KEYS = /^(cover|img|image|avatar|icon|heroImage|src|banner|photo|thumbnail|fallback)$/i
  const URL_SUFFIX = /(cover|image|avatar|icon|photo|banner|thumbnail|src|img)$/i
  const out = {}
  Object.keys(obj).forEach(key => {
    const val = obj[key]
    if (typeof val === 'string' && (IMAGE_KEYS.test(key) || URL_SUFFIX.test(key) || val.includes('/images/') || val.includes('/subpackages/'))) {
      if (/\.(webp|png|jpe?g|gif)$/i.test(val) || val.includes('/images/') || val.includes('/subpackages/')) {
        out[key] = normalizeImageField(val)
        return
      }
    }
    if (Array.isArray(val) && key === 'images') {
      out[key] = val.map(v => (typeof v === 'string' ? normalizeImageField(v) : normalizeMediaInObject(v)))
      return
    }
    out[key] = normalizeMediaInObject(val)
  })
  return out
}

module.exports = {
  MAIN_FALLBACK_MAP,
  preferWebp,
  toLocalPath,
  getFallbackPath,
  getImageUrl,
  normalizeImageField,
  normalizeMediaInObject
}
