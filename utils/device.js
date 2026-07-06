/**
 * 多端设备适配：微信小程序 × iOS / Android / 鸿蒙（HarmonyOS）/ 开发者工具
 * 鸿蒙端运行在微信客户端内，使用同一套 wx API；此处做平台识别与安全区注入。
 */

function readWindowInfo() {
  try {
    if (wx.getWindowInfo) return wx.getWindowInfo()
  } catch (e) { /* ignore */ }
  try {
    const legacy = wx.getSystemInfoSync()
    return {
      screenWidth: legacy.screenWidth,
      screenHeight: legacy.screenHeight,
      windowWidth: legacy.windowWidth,
      windowHeight: legacy.windowHeight,
      statusBarHeight: legacy.statusBarHeight,
      safeArea: legacy.safeArea,
      safeAreaInsets: legacy.safeAreaInsets || {
        top: legacy.statusBarHeight || 0,
        bottom: legacy.screenHeight - (legacy.safeArea?.bottom || legacy.screenHeight),
        left: 0,
        right: 0
      }
    }
  } catch (e) {
    return {}
  }
}

function readDeviceInfo() {
  try {
    if (wx.getDeviceInfo) return wx.getDeviceInfo()
  } catch (e) { /* ignore */ }
  try {
    const legacy = wx.getSystemInfoSync()
    return {
      brand: legacy.brand,
      model: legacy.model,
      system: legacy.system,
      platform: legacy.platform
    }
  } catch (e) {
    return {}
  }
}

function readAppBaseInfo() {
  try {
    if (wx.getAppBaseInfo) return wx.getAppBaseInfo()
  } catch (e) { /* ignore */ }
  try {
    const legacy = wx.getSystemInfoSync()
    return {
      SDKVersion: legacy.SDKVersion,
      version: legacy.version,
      language: legacy.language,
      theme: legacy.theme
    }
  } catch (e) {
    return {}
  }
}

function normalizePlatform(rawPlatform, system = '') {
  const p = String(rawPlatform || '').toLowerCase()
  const sys = String(system || '').toLowerCase()
  if (p === 'ios' || sys.includes('ios')) return 'ios'
  if (p === 'android' || sys.includes('android')) return 'android'
  if (p === 'ohos' || p === 'harmony' || sys.includes('harmony') || sys.includes('openharmony')) return 'harmony'
  if (p === 'devtools') return 'devtools'
  if (p === 'windows') return 'windows'
  if (p === 'mac') return 'mac'
  return p || 'unknown'
}

function getDeviceProfile() {
  const windowInfo = readWindowInfo()
  const deviceInfo = readDeviceInfo()
  const appInfo = readAppBaseInfo()
  const platform = normalizePlatform(deviceInfo.platform, deviceInfo.system)
  const insets = windowInfo.safeAreaInsets || {}
  const safeBottom = Number(insets.bottom || 0)
  const safeTop = Number(insets.top || windowInfo.statusBarHeight || 0)

  return {
    platform,
    system: deviceInfo.system || '',
    brand: deviceInfo.brand || '',
    model: deviceInfo.model || '',
    sdkVersion: appInfo.SDKVersion || '',
    wechatVersion: appInfo.version || '',
    screenWidth: windowInfo.screenWidth || 375,
    screenHeight: windowInfo.screenHeight || 667,
    statusBarHeight: windowInfo.statusBarHeight || safeTop,
    safeAreaInsets: {
      top: safeTop,
      bottom: safeBottom,
      left: Number(insets.left || 0),
      right: Number(insets.right || 0)
    },
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isHarmony: platform === 'harmony',
    isDevtools: platform === 'devtools',
    isMobile: ['ios', 'android', 'harmony'].includes(platform),
    tabBarExtraBottom: safeBottom > 0 ? `${safeBottom}px` : '0px',
    pageBottomPadding: safeBottom > 0 ? `calc(${safeBottom}px + 24rpx)` : '24rpx'
  }
}

function injectPageSafeAreaStyle(profile) {
  const p = profile || getDeviceProfile()
  return [
    `--safe-top:${p.safeAreaInsets.top}px`,
    `--safe-bottom:${p.safeAreaInsets.bottom}px`,
    `--page-bottom-padding:${p.pageBottomPadding}`
  ].join(';')
}

function attachDeviceToApp(app) {
  const profile = getDeviceProfile()
  app.globalData = app.globalData || {}
  app.globalData.deviceProfile = profile
  app.globalData.systemInfo = { ...profile, ...readWindowInfo(), ...readDeviceInfo(), ...readAppBaseInfo() }
  return profile
}

module.exports = {
  getDeviceProfile,
  injectPageSafeAreaStyle,
  attachDeviceToApp,
  normalizePlatform
}
