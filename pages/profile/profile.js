const app = getApp()
const { getOaDashboard, getDocuments } = require('../../api/profile')
const { getMyIntakeList } = require('../../api/intake')
const { getUnreadCount } = require('../../api/notification')
const { preloadForPage } = require('../../utils/subpackagePreload')

Page({
  data: {
    userInfo: null,
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
    docItems: [],
    oaStats: [],
    unreadCount: 0,
    recentIntakes: [],
    complianceNote: '亮叶企服仅提供金融信息咨询与居间撮合服务，不从事放贷业务，不承诺审批结果。'
  },

  onShow() {
    preloadForPage('pages/profile/profile')
    this.loadUserInfo()
    this.loadProfileData()
  },

  loadUserInfo() {
    const stored = wx.getStorageSync('userInfo')
    if (stored) {
      this.setData({ userInfo: stored })
      app.globalData.userInfo = stored
    } else if (app.globalData.userInfo) {
      this.setData({ userInfo: app.globalData.userInfo })
    } else {
      this.setData({
        userInfo: {
          nickName: '亮叶用户',
          avatarUrl: '/images/avatar.webp',
          verified: false
        }
      })
    }
  },

  loadProfileData() {
    let progress = 0
    try {
      const store = require('../../subpackages/intake/utils/store')
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
      this.setData({
        docItems: docs || [],
        'quickStats[3].value': String((docs || []).length)
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
    wx.navigateTo({ url: `/subpackages/profile/pages/docs/docs?category=${itemId}` })
  }
})
