const app = getApp()
const { getOaDashboard, getDocuments } = require('../../api/profile')
const { getMyIntakeList } = require('../../api/intake')
const { getUnreadCount } = require('../../api/notification')
const { preloadForPage } = require('../../utils/subpackagePreload')

Page({
  data: {
    userInfo: null,
    /** 敏感信息显示开关 */
    sensitiveDisplay: true,
    /** 实名认证面板 */
    showAuthPanel: false,
    authStatus: 'none', // 'none' | 'pending' | 'verified'
    authForm: { realName: '', idNo: '' },
    maskedRealName: '',
    maskedIdNo: '',
    authVerifiedTime: '',
    idType: '居民身份证',
    /** 手机绑定面板 */
    showPhonePanel: false,
    phoneForm: { newPhone: '', verifyCode: '' },
    phoneFormError: false,
    maskedPhone: '',
    phoneBoundTime: '',
    verifyCodeSent: false,
    countdown: 0,
    modules: [
      { id: 'intake', title: '我的进件', icon: 'icon-folder', desc: '材料填报、审核放款进度', path: '/subpackages/intake/pages/list/list', wide: true },
      { id: 'finance', title: '汽车金融', icon: 'icon-oa', desc: '新车/二手车/车抵方案', path: '/subpackages/autoFinance/pages/list/list' },
      { id: 'business', title: '企业经营贷', icon: 'icon-demand', desc: '宁波银行·农行·建行小微贷', path: '/pages/products/products', tab: true, category: 'business' },
      { id: 'warranty', title: '延保服务', icon: 'icon-demand', desc: '新能源/豪华/营运延保', path: '/subpackages/autoFinance/pages/warranty/warranty' },
      { id: 'clues', title: '汽车线索', icon: 'icon-oa', desc: '宁波本地购车线索跟进', path: '/subpackages/clue/pages/list/list' },
      { id: 'financeCircle', title: '易融圈', icon: 'icon-demand', desc: '发布融资需求与机构供给', path: '/pages/financeCircle/financeCircle', tab: true },
      { id: 'oa', title: 'OA系统', icon: 'icon-oa', desc: '查看待办、会议、审批', path: '/subpackages/profile/pages/oa/oa' },
      { id: 'demands', title: '我的需求', icon: 'icon-demand', desc: '查看已发布融资需求', path: '/pages/financeCircle/financeCircle', tab: true },
      { id: 'docs', title: '文档中心', icon: 'icon-folder', desc: '管理材料、合同与视频', path: '/subpackages/profile/pages/docs/docs' },
      { id: 'settings', title: '系统设置', icon: 'icon-setting', desc: '账号、安全与隐私设置', path: '/subpackages/profile/pages/settings/settings' },
      { id: 'notifications', title: '消息通知', icon: 'icon-notice', desc: '审批、需求、系统公告', path: '/subpackages/profile/pages/notifications/notifications', wide: true }
    ],
    quickStats: [
      { label: '待办', value: '0' },
      { label: '进件', value: '1' },
      { label: '消息', value: '0' },
      { label: '文档', value: '0' }
    ],
    docItems: [
      { id: 'contract', name: '居间服务合同', desc: '金融信息居间服务合同', icon: '📜', tab: 'contract' }
    ],
    oaStats: [],
    unreadCount: 0,
    recentIntakes: [],
    complianceNote: '亮叶企服仅提供金融信息咨询与居间撮合服务，不从事放贷业务，不承诺审批结果。'
  },

  onShow() {
    preloadForPage('pages/profile/profile')
    this.loadUserInfo()
    this.loadUserProfile()
    this.loadProfileData()
    this.setData({
      sensitiveDisplay: wx.getStorageSync('sensitiveDisplay') !== false
    })
  },

  loadUserInfo() {
    const stored = wx.getStorageSync('userInfo')
    const customAvatar = wx.getStorageSync('userAvatar')
    if (stored) {
      if (customAvatar) stored.avatarUrl = customAvatar
      this.setData({ userInfo: stored })
      app.globalData.userInfo = stored
    } else if (app.globalData.userInfo) {
      if (customAvatar) app.globalData.userInfo.avatarUrl = customAvatar
      this.setData({ userInfo: app.globalData.userInfo })
    } else {
      this.setData({
        userInfo: {
          nickName: '亮叶用户',
          avatarUrl: customAvatar || '/images/avatar.webp',
          verified: false
        }
      })
    }
  },

  /** 从本地存储加载额外的用户资料（签名、电话、实名） */
  loadUserProfile() {
    const profile = wx.getStorageSync('userProfile')
    if (profile) {
      const userInfo = { ...this.data.userInfo }
      if (profile.signature) userInfo.signature = profile.signature
      if (profile.phone) userInfo.phone = profile.phone
      if (profile.realName) userInfo.realName = profile.realName
      if (profile.realNameId) userInfo.realNameId = profile.realNameId
      if (profile.realNameVerified !== undefined) userInfo.realNameVerified = profile.realNameVerified
      this.setData({ userInfo })
      // 计算脱敏显示值
      this.computeMaskedValues(profile)
    }
  },

  /** 计算脱敏显示值 */
  computeMaskedValues(profile) {
    const p = profile || wx.getStorageSync('userProfile') || {}
    const maskedRealName = p.realName ? this.maskName(p.realName) : ''
    const maskedIdNo = p.realNameId ? this.maskIdNo(p.realNameId) : ''
    const maskedPhone = p.phone ? this.maskPhone(p.phone) : ''
    const authStatus = p.realNameVerified === true ? 'verified' : p.realNameVerified === 'pending' ? 'pending' : 'none'
    this.setData({
      maskedRealName,
      maskedIdNo,
      maskedPhone,
      authStatus,
      authVerifiedTime: p.verifiedTime || '',
      phoneBoundTime: p.phoneBoundTime || ''
    })
  },

  /** 姓名脱敏：2字显示首字+*，3字及以上显示首尾+中间* */
  maskName(name) {
    if (!name) return ''
    if (name.length <= 2) return name.charAt(0) + '*'
    return name.charAt(0) + name.slice(1, -1).replace(/./g, '*') + name.slice(-1)
  },

  /** 身份证脱敏：显示前3位+***********+后4位 */
  maskIdNo(id) {
    if (!id) return ''
    if (id.length < 8) return id
    return id.slice(0, 3) + '***********' + id.slice(-4)
  },

  /** 手机号脱敏：显示前3位+****+后4位 */
  maskPhone(phone) {
    if (!phone) return ''
    if (phone.length < 7) return phone
    return phone.slice(0, 3) + '****' + phone.slice(-4)
  },

  /** 切换敏感信息显示 */
  toggleSensitiveDisplay() {
    const val = !this.data.sensitiveDisplay
    wx.setStorageSync('sensitiveDisplay', val)
    this.setData({ sensitiveDisplay: val })
    wx.showToast({
      title: val ? '敏感信息已显示' : '敏感信息已隐藏',
      icon: 'none'
    })
  },

  /** 保存用户资料到本地存储 */
  saveUserProfile(fields) {
    const profile = wx.getStorageSync('userProfile') || {}
    Object.assign(profile, fields)
    wx.setStorageSync('userProfile', profile)
    const userInfo = { ...this.data.userInfo, ...fields }
    this.setData({ userInfo })
    this.computeMaskedValues(profile)
    wx.showToast({ title: '保存成功', icon: 'success' })
  },

  loadProfileData() {
    let progress = 0
    try {
      const store = require('../../utils/intakeStore')
      progress = store.getData().meta?.progress || 0
    } catch (e) {}

    getMyIntakeList().then(list => {
      const auditing = list.filter(i => i.status === 'auditing').length
      this.setData({
        recentIntakes: list.slice(0, 3),
        'quickStats[1].label': '进件',
        'quickStats[1].value': list.length ? `${list.length}笔` : `${progress}%`
      })
    }).catch(() => null)

    getUnreadCount().then(count => {
      const app = getApp()
      if (app.globalData) app.globalData.unreadCount = count
      this.setData({
        unreadCount: count,
        'quickStats[2].label': '未读消息',
        'quickStats[2].value': String(count)
      })
      const modules = this.data.modules.map(m =>
        m.id === 'notifications' ? { ...m, desc: count ? `${count} 条未读消息` : '审批、需求、系统公告' } : m
      )
      this.setData({ modules })
    }).catch(() => null)

    getOaDashboard().then(data => {
      const stats = data.stats || []
      const todoCount = stats.find(s => s.name?.includes('待办'))?.count || stats[0]?.count || 0
      this.setData({
        oaStats: stats,
        quickStats: [
          { label: '待办', value: String(todoCount) },
          { label: '进件进度', value: `${progress}%` },
          { label: '未读消息', value: String(this.data.unreadCount || 0) },
          { label: '文档', value: String(this.data.docItems.length) }
        ]
      })
    }).catch(() => null)
    getDocuments().then(docs => {
      const contractItem = { id: 'contract', name: '居间服务合同', desc: '金融信息居间服务合同', icon: '📜', tab: 'contract' }
      const merged = [contractItem, ...(docs || [])]
      this.setData({
        docItems: merged,
        'quickStats[3].value': String(merged.length)
      })
    }).catch(() => null)
  },

  goServiceChat() {
    wx.navigateTo({ url: '/subpackages/service/pages/chat/chat' })
  },

  goStat(e) {
    const idx = e.currentTarget.dataset.idx
    const routes = [
      '/subpackages/profile/pages/oa/oa',
      '/subpackages/intake/pages/list/list',
      '/subpackages/profile/pages/notifications/notifications',
      '/subpackages/profile/pages/docs/docs'
    ]
    if (routes[idx]) wx.navigateTo({ url: routes[idx] })
  },

  goIntakeDetail(e) {
    const no = e.currentTarget.dataset.no
    if (no) {
      wx.navigateTo({ url: `/subpackages/intake/pages/status/status?applicationNo=${no}` })
    } else {
      wx.navigateTo({ url: '/subpackages/intake/pages/list/list' })
    }
  },

  editProfile() {
    wx.navigateTo({ url: '/subpackages/profile/pages/settings/settings' })
  },

  /** 头像编辑：拍照或从相册选，裁剪后存储 */
  editAvatar() {
    wx.showActionSheet({
      itemList: ['拍照', '从手机相册选择'],
      success: (res) => {
        const sourceType = res.tapIndex === 0 ? ['camera'] : ['album']
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType,
          success: (res) => {
            const tempPath = res.tempFilePaths[0]
            if (wx.cropImage) {
              wx.cropImage({
                src: tempPath,
                cropScale: '1:1',
                success: (cropRes) => {
                  this.saveAvatar(cropRes.tempFilePath)
                },
                fail: () => {
                  this.saveAvatar(tempPath)
                }
              })
            } else {
              this.saveAvatar(tempPath)
            }
          },
          fail: () => {
            wx.showToast({ title: '取消选择', icon: 'none' })
          }
        })
      }
    })
  },

  /** 保存头像到本地存储并更新显示 */
  saveAvatar(filePath) {
    wx.setStorageSync('userAvatar', filePath)
    const userInfo = { ...(wx.getStorageSync('userInfo') || {}), avatarUrl: filePath }
    wx.setStorageSync('userInfo', userInfo)
    getApp().globalData.userInfo = userInfo
    this.setData({ userInfo })
    wx.showToast({ title: '头像已更新', icon: 'success' })
  },

  /** 编辑昵称 */
  editNickName() {
    const current = this.data.userInfo.nickName || ''
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入昵称',
      content: current,
      success: (res) => {
        if (res.confirm && res.content && res.content.trim()) {
          this.saveUserProfile({ nickName: res.content.trim() })
        }
      }
    })
  },

  /** 编辑个性签名 */
  editSignature() {
    const current = this.data.userInfo.signature || ''
    wx.showModal({
      title: '修改个性签名',
      editable: true,
      placeholderText: '介绍一下自己',
      content: current,
      success: (res) => {
        if (res.confirm) {
          this.saveUserProfile({ signature: (res.content || '').trim() })
        }
      }
    })
  },

  /** 切换手机绑定面板 */
  togglePhonePanel() {
    const showing = !this.data.showPhonePanel
    this.setData({
      showPhonePanel: showing,
      showAuthPanel: false,
      phoneForm: { newPhone: '', verifyCode: '' },
      phoneFormError: false,
      verifyCodeSent: false,
      countdown: 0
    })
  },

  /** 手机号输入 */
  onPhoneInput(e) {
    const val = (e.detail.value || '').replace(/\D/g, '')
    const hasError = val.length > 0 && !/^1\d{10}$/.test(val)
    this.setData({ 'phoneForm.newPhone': val, phoneFormError: hasError })
  },

  /** 验证码输入 */
  onVerifyCodeInput(e) {
    const val = (e.detail.value || '').replace(/\D/g, '')
    this.setData({ 'phoneForm.verifyCode': val })
  },

  /** 发送验证码（模拟） */
  sendVerifyCode() {
    const phone = this.data.phoneForm.newPhone
    if (!phone || !/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '请输入正确的11位手机号', icon: 'none' })
      return
    }
    if (this.data.countdown > 0) return
    wx.showToast({ title: '验证码已发送', icon: 'success' })
    this.setData({ verifyCodeSent: true, countdown: 60 })
    const timer = setInterval(() => {
      if (this.data.countdown <= 1) {
        clearInterval(timer)
        this.setData({ countdown: 0 })
      } else {
        this.setData({ countdown: this.data.countdown - 1 })
      }
    }, 1000)
  },

  /** 确认更换手机 */
  submitPhoneChange() {
    const phone = this.data.phoneForm.newPhone
    const code = this.data.phoneForm.verifyCode
    if (!phone || !/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '请输入正确的11位手机号', icon: 'none' })
      return
    }
    if (!code || code.length < 4) {
      wx.showToast({ title: '请输入4-6位验证码', icon: 'none' })
      return
    }
    this.saveUserProfile({
      phone,
      phoneBoundTime: new Date().toLocaleString('zh-CN', { hour12: false })
    })
    this.setData({ showPhonePanel: false })
  },

  /** 切换实名认证面板 */
  toggleAuthPanel() {
    const showing = !this.data.showAuthPanel
    this.setData({
      showAuthPanel: showing,
      showPhonePanel: false,
      authForm: { realName: '', idNo: '' }
    })
  },

  /** 实名认证姓名输入 */
  onAuthNameInput(e) {
    this.setData({ 'authForm.realName': e.detail.value })
  },

  /** 实名认证身份证号输入 */
  onAuthIdNoInput(e) {
    this.setData({ 'authForm.idNo': (e.detail.value || '').toUpperCase() })
  },

  /** 提交实名认证 */
  submitAuth() {
    const name = (this.data.authForm.realName || '').trim()
    const idNo = (this.data.authForm.idNo || '').trim()
    if (!name || name.length < 2) {
      wx.showToast({ title: '请输入正确的姓名', icon: 'none' })
      return
    }
    if (name.length > 20) {
      wx.showToast({ title: '姓名过长', icon: 'none' })
      return
    }
    if (idNo.length === 15) {
      if (!/^\d{15}$/.test(idNo)) {
        wx.showToast({ title: '请输入正确的15位身份证号', icon: 'none' })
        return
      }
    } else if (idNo.length === 18) {
      if (!/^\d{17}[\dXx]$/.test(idNo)) {
        wx.showToast({ title: '请输入正确的18位身份证号', icon: 'none' })
        return
      }
    } else {
      wx.showToast({ title: '请输入15或18位身份证号码', icon: 'none' })
      return
    }
    this.saveUserProfile({
      realName: name,
      realNameId: idNo,
      realNameVerified: true,
      verifiedTime: new Date().toLocaleString('zh-CN', { hour12: false }),
      idType: '居民身份证'
    })
    this.setData({ showAuthPanel: false })
  },

  /** 重新认证（已认证状态下重新提交） */
  reAuth() {
    this.setData({
      showAuthPanel: true,
      authForm: { realName: '', idNo: '' }
    })
  },

  navigateToModule(e) {
    const moduleId = e.currentTarget.dataset.id
    const module = this.data.modules.find(item => item.id === moduleId)
    if (!module) return
    if (module.tab) {
      if (module.id === 'demands') wx.setStorageSync('financeCircleFilter', 'mine')
      if (module.category) wx.setStorageSync('productsCategory', module.category)
      wx.switchTab({ url: module.path })
      return
    }
    wx.navigateTo({ url: module.path })
  },

  handleDocItemTap(e) {
    const itemId = e.currentTarget.dataset.id
    const item = this.data.docItems.find(d => d.id === itemId)
    if (item && item.tab) {
      wx.navigateTo({ url: `/subpackages/profile/pages/docs/docs?tab=${item.tab}` })
    } else {
      wx.navigateTo({ url: `/subpackages/profile/pages/docs/docs?category=${itemId}` })
    }
  },

  onShareAppMessage() {
    return {
      title: '亮叶个人中心',
      path: '/pages/profile/profile',
      desc: '管理我的进件、汽车金融、文档中心、消息通知等。'
    }
  },

  onShareTimeline() {
    return {
      title: '亮叶个人中心'
    }
  }
})
