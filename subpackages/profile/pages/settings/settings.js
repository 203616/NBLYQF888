const { getSettings } = require('../../../../api/profile')
const { getNotifications } = require('../../../../api/notification')
const { getTrialVersion } = require('../../../../api/config')
const { getConfig } = require('../../../../utils/config')
const {
  ENV_OPTIONS,
  getEnvOptionLabel,
  setEnvOverride,
  setUseCdnOverride,
  clearOverrides,
  getRuntimeSummary
} = require('../../../../utils/runtimeEnv')

const SETTING_ICONS = {
  account: '🔐',
  privacy: '🛡️',
  notice: '🔔',
  service: '📞'
}

Page({
  data: {
    settings: [],
    servicePhone: '400-888-7777',
    userInfo: {},
    quickStats: [
      { icon: '✅', label: '安全', value: '正常' },
      { icon: '🔔', label: '通知', value: '开启' },
      { icon: '📬', label: '未读', value: '0' }
    ],
    envOptions: ENV_OPTIONS,
    envPickerIndex: 0,
    envPickerLabel: '自动检测',
    useCdnImages: false,
    runtimeSummary: '',
    showDevPanel: false,
    showTrialPanel: false,
    trialInfo: null,
    deviceSummary: ''
  },

  onLoad() {
    this.loadUserInfo()
    this.loadSettings()
    this.loadUnreadCount()
    this.initDevPanel()
    this.loadTrialInfo()
    this.loadDeviceInfo()
  },

  loadDeviceInfo() {
    try {
      const { getDeviceProfile } = require('../../../../utils/device')
      const p = getDeviceProfile()
      const platformMap = { ios: 'iOS', android: 'Android', harmony: '鸿蒙', devtools: '开发者工具' }
      const name = platformMap[p.platform] || p.platform
      this.setData({
        deviceSummary: `${name} · ${p.model || p.system || '-'} · 安全区底 ${p.safeAreaInsets?.bottom || 0}px`
      })
    } catch (e) {
      this.setData({ deviceSummary: '' })
    }
  },

  initDevPanel() {
    let showDevPanel = false
    try {
      const info = wx.getAccountInfoSync()
      showDevPanel = info.miniProgram.envVersion !== 'release'
    } catch (e) {
      showDevPanel = true
    }
    const stored = wx.getStorageSync('runtime_env_override') || 'auto'
    const idx = Math.max(0, ENV_OPTIONS.findIndex(o => o.id === stored))
    const cfg = getConfig()
    this.setData({
      showDevPanel,
      envPickerIndex: idx,
      envPickerLabel: getEnvOptionLabel(stored),
      useCdnImages: cfg.useCdnImages,
      runtimeSummary: getRuntimeSummary(cfg)
    })
  },

  refreshRuntimeSummary() {
    this.setData({ runtimeSummary: getRuntimeSummary(getConfig()) })
  },

  loadTrialInfo() {
    let showTrialPanel = false
    try {
      const info = wx.getAccountInfoSync()
      showTrialPanel = info.miniProgram.envVersion !== 'release'
    } catch {
      showTrialPanel = true
    }
    if (!showTrialPanel) return
    getTrialVersion().then(meta => {
      if (!meta?.version) return
      const updatedAtLabel = meta.updatedAt
        ? String(meta.updatedAt).replace('T', ' ').slice(0, 16)
        : '-'
      this.setData({ showTrialPanel: true, trialInfo: { ...meta, updatedAtLabel } })
    }).catch(() => null)
  },

  onEnvPickerChange(e) {
    const idx = Number(e.detail.value)
    const option = ENV_OPTIONS[idx]
    setEnvOverride(option.id === 'auto' ? 'auto' : option.id)
    this.setData({ envPickerIndex: idx, envPickerLabel: option.label })
    this.refreshRuntimeSummary()
    wx.showModal({
      title: '环境已切换',
      content: `${option.label}\n\n${option.desc}\n\n部分页面需重新进入后生效。`,
      showCancel: false
    })
  },

  onCdnSwitchChange(e) {
    setUseCdnOverride(e.detail.value)
    this.setData({ useCdnImages: e.detail.value })
    this.refreshRuntimeSummary()
    wx.showToast({
      title: e.detail.value ? 'CDN 已开' : 'CDN 已关',
      icon: 'none'
    })
  },

  resetRuntimeEnv() {
    clearOverrides()
    this.initDevPanel()
    wx.showToast({ title: '已恢复自动', icon: 'success' })
  },

  onShow() {
    this.loadUnreadCount()
    this.refreshRuntimeSummary()
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    const phone = wx.getStorageSync('userPhone') || userInfo.phone || ''
    this.setData({
      userInfo: {
        ...userInfo,
        phone: phone ? this.maskPhone(phone) : ''
      }
    })
  },

  maskPhone(phone) {
    const s = String(phone)
    if (s.length >= 11) return s.slice(0, 3) + '****' + s.slice(-4)
    return s
  },

  loadSettings() {
    getSettings().then(settings => {
      const enriched = (settings || []).map(item => ({
        ...item,
        icon: item.icon || SETTING_ICONS[item.id] || '⚙️',
        hasSwitch: item.id === 'notice' || item.id === 'privacy'
      }))
      const noticeOn = enriched.find(s => s.id === 'notice')?.enabled !== false
      this.setData({
        settings: enriched,
        'quickStats[1].value': noticeOn ? '开启' : '关闭'
      })
    })
  },

  loadUnreadCount() {
    getNotifications().then(list => {
      const unread = (list || []).filter(n => n.status === 'unread').length
      this.setData({ 'quickStats[2].value': String(unread) })
    }).catch(() => {})
  },

  noop() {},

  handleSettingTap(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.settings.find(setting => setting.id === id)
    if (!item) return
    if (id === 'notice') {
      this.goNotifications()
      return
    }
    if (id === 'service') {
      this.callService()
      return
    }
    wx.showModal({
      title: item.title,
      content: `${item.desc}\n\n当前设置将用于账号安全、授权记录和服务通知管理，保存后会同步到用户中心。`,
      showCancel: false
    })
  },

  handleSwitchChange(e) {
    const id = e.currentTarget.dataset.id
    const enabled = e.detail.value
    const settings = this.data.settings.map(item => item.id === id ? { ...item, enabled } : item)
    this.setData({
      settings,
      'quickStats[1].value': settings.find(s => s.id === 'notice')?.enabled ? '开启' : '关闭'
    })
    wx.showToast({ title: enabled ? '已开启提醒' : '已关闭提醒', icon: 'success' })
  },

  goNotifications() {
    wx.navigateTo({ url: '/subpackages/profile/pages/notifications/notifications' })
  },

  callService() {
    wx.navigateTo({ url: '/subpackages/service/pages/chat/chat' })
  },

  openPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们仅在提供服务所必需范围内收集位置、相册、联系方式等信息，用于需求撮合、材料审核与合规提醒。您可随时在设置中撤回授权。',
      showCancel: false
    })
  },

  openAgreement() {
    wx.showModal({
      title: '服务协议',
      content: '亮叶企服提供金融信息咨询与居间撮合服务，不直接发放贷款。具体审批、额度与费用以持牌机构审核及正式合同为准。',
      showCancel: false
    })
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确认清除本地登录状态？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('authToken')
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          wx.reLaunch({ url: '/pages/login/login' })
        }
      }
    })
  }
})
