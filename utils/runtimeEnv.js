/**
 * 运行时环境覆盖（仅存本地 Storage，不改源码 config.js）
 * 用于体验版/开发版联调生产 API 或 CDN
 */
const KEYS = {
  envOverride: 'runtime_env_override',
  useCdnImages: 'runtime_use_cdn_images'
}

const ENV_OPTIONS = [
  { id: 'auto', label: '自动检测', desc: '正式/体验版走生产，开发版走 development' },
  { id: 'local', label: '本地演示', desc: 'Mock 数据，无需 API' },
  { id: 'development', label: '开发 API', desc: 'localhost:3000' },
  { id: 'production', label: '生产 API', desc: 'api.liangyeqf.com' }
]

function hasWx() {
  return typeof wx !== 'undefined' && typeof wx.getStorageSync === 'function'
}

function safeGet(key) {
  if (!hasWx()) return ''
  try {
    return wx.getStorageSync(key)
  } catch {
    return ''
  }
}

function safeSet(key, value) {
  if (!hasWx()) return
  try {
    wx.setStorageSync(key, value)
  } catch (e) {
    console.warn('runtimeEnv save failed', e)
  }
}

function getEnvOverride() {
  const v = safeGet(KEYS.envOverride)
  if (!v || v === 'auto') return null
  if (['local', 'development', 'production'].includes(v)) return v
  return null
}

function setEnvOverride(value) {
  safeSet(KEYS.envOverride, value || 'auto')
}

function getUseCdnOverride() {
  const v = safeGet(KEYS.useCdnImages)
  if (v === '' || v === undefined || v === null) return null
  return !!v
}

function setUseCdnOverride(enabled) {
  safeSet(KEYS.useCdnImages, !!enabled)
}

function clearOverrides() {
  if (!hasWx()) return
  try {
    wx.removeStorageSync(KEYS.envOverride)
    wx.removeStorageSync(KEYS.useCdnImages)
  } catch (e) {
    console.warn('runtimeEnv clear failed', e)
  }
}

function getEnvOptionLabel(id) {
  return ENV_OPTIONS.find(o => o.id === id)?.label || id
}

function getRuntimeSummary(config) {
  const override = safeGet(KEYS.envOverride) || 'auto'
  const cdn = getUseCdnOverride()
  const lines = [
    `环境: ${config.env}${override !== 'auto' ? ` (覆盖→${getEnvOptionLabel(override)})` : ''}`,
    `API: ${config.apiBaseUrl || 'Mock'}`,
    `CDN图片: ${config.useCdnImages ? '开' : '关'}${cdn !== null ? ' (手动)' : ''}`
  ]
  return lines.join('\n')
}

module.exports = {
  KEYS,
  ENV_OPTIONS,
  getEnvOverride,
  setEnvOverride,
  getUseCdnOverride,
  setUseCdnOverride,
  clearOverrides,
  getEnvOptionLabel,
  getRuntimeSummary
}
