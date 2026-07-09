// 部署时修改 PRODUCTION_API_BASE 为实际 HTTPS 域名
const PRODUCTION_API_BASE = 'https://api.liangyeqf.com/api/v1'
// 生产 CDN（留空则始终使用本地分包资源，不影响编译）
const PRODUCTION_CDN_BASE = 'https://cdn.liangyeqf.com'
// 生产是否走 CDN 图片（默认 false；由 pnpm sync:prod 根据 deploy.config.json 同步）
const PRODUCTION_USE_CDN = false

// 手动覆盖环境：设为 'development' | 'production' | 'local'，留空则自动检测
const MANUAL_ENV = 'development'

function detectEnv() {
  if (MANUAL_ENV) return MANUAL_ENV
  try {
    const info = wx.getAccountInfoSync()
    const envVersion = info.miniProgram.envVersion
    if (envVersion === 'release' || envVersion === 'trial') {
      return 'production'
    }
  } catch (e) {
    // 非微信环境（如单元测试）回退 local
  }
  return 'local'
}

const ENV = detectEnv()

let apiOffline = false

const config = {
  local: {
    apiBaseUrl: '',
    useMockFallback: true,
    appMode: 'local-content',
    cdnBaseUrl: '',
    useCdnImages: false
  },
  development: {
    apiBaseUrl: 'http://localhost:4008/api/v1',
    useMockFallback: false,
    appMode: 'api-content',
    cdnBaseUrl: '',
    useCdnImages: false
  },
  production: {
    apiBaseUrl: PRODUCTION_API_BASE,
    useMockFallback: false,
    appMode: 'api-content',
    cdnBaseUrl: PRODUCTION_CDN_BASE,
    useCdnImages: PRODUCTION_USE_CDN
  }
}

function markApiOffline() {
  apiOffline = true
}

function isApiOffline() {
  return apiOffline
}

function resolveEffectiveEnv() {
  try {
    const { getEnvOverride } = require('./runtimeEnv')
    const override = getEnvOverride()
    if (override && config[override]) return override
  } catch (e) {
    // 非小程序环境（Node 脚本）忽略
  }
  return ENV
}

function getConfig() {
  const envKey = resolveEffectiveEnv()
  const base = config[envKey] || config.local
  let useMockFallback = base.useMockFallback || (envKey === 'development' && apiOffline)

  let useCdnImages = base.useCdnImages
  try {
    const { getUseCdnOverride } = require('./runtimeEnv')
    const cdnOverride = getUseCdnOverride()
    if (cdnOverride !== null) useCdnImages = cdnOverride
  } catch (e) {
    // ignore
  }

  return {
    env: envKey,
    ...base,
    useCdnImages,
    useMockFallback,
    apiOffline,
    envVersionAuto: ENV !== envKey ? ENV : null
  }
}

module.exports = {
  ENV,
  PRODUCTION_API_BASE,
  PRODUCTION_CDN_BASE,
  PRODUCTION_USE_CDN,
  getConfig,
  markApiOffline,
  isApiOffline
}
