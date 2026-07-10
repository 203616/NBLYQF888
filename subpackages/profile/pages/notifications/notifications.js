const { getNotifications, markNotificationRead, markAllNotificationsRead } = require('../../../../api/notification')
const { refreshSubscribeTemplates } = require('../../../../utils/subscribe')

const STORAGE_KEY = 'notify_read_ids'

// ===== MOCK Data =====
const MOCK_NOTIFICATIONS = [
  { id: 'mock_1', type: 'system', title: '系统升级公告', content: '亮叶企服平台将于7月15日凌晨2:00-5:00进行系统升级维护，期间进件提交和查询功能将暂停使用，请提前安排好您的业务操作。', createdAt: '2026-07-08 10:30', status: 'unread', link: '' },
  { id: 'mock_2', type: 'demand', title: '需求匹配通知', content: '您发布的「新车按揭」需求已匹配到3家宁波合作金融机构，点击查看机构详情与利率方案。', createdAt: '2026-07-07 14:20', status: 'unread', link: '/subpackages/demand/pages/detail/detail?id=demand_001' },
  { id: 'mock_3', type: 'intake', title: '进件审核通过', content: '您的进件（编号：IJ20260707001）已通过初审，合作机构正在安排终审，预计3-5个工作日出结果。', createdAt: '2026-07-06 09:15', status: 'read', link: '/subpackages/intake/pages/status/status?section=audit' },
  { id: 'mock_4', type: 'clue', title: '新车线索跟进提醒', content: '客户张先生（浙B·12345）有意向购买新能源车，请及时联系跟进，线索来源：官网表单。', createdAt: '2026-07-05 16:45', status: 'unread', link: '/subpackages/clue/pages/detail/detail?id=clue_008' },
  { id: 'mock_5', type: 'finance_circle', title: '融圈新帖子', content: '您关注的「宁波车贷交流圈」有新的讨论：新能源车贷利率对比，点击查看最新回复。', createdAt: '2026-07-04 11:00', status: 'read', link: '/subpackages/financeCircle/financeCircle' },
  { id: 'mock_6', type: 'system', title: '隐私政策更新', content: '我们已更新隐私政策，涉及数据存储与第三方共享条款的变更，请仔细阅读并确认。', createdAt: '2026-07-03 08:00', status: 'read' },
  { id: 'mock_7', type: 'intake', title: '进件材料补正提醒', content: '您的进件材料中「银行流水」不清晰，请重新上传清晰扫描件，以免影响审核进度。', createdAt: '2026-07-02 13:30', status: 'unread', link: '/subpackages/intake/pages/form/form?section=uploads' },
  { id: 'mock_8', type: 'risk', title: '合规风险提示', content: '合作机构反馈您名下有2笔未结清贷款，负债率偏高，建议补充收入证明以提升审批通过率。', createdAt: '2026-07-01 10:00', status: 'unread' },
  { id: 'mock_9', type: 'demand', title: '需求过期提醒', content: '您发布的「二手车融资」需求即将过期（7月20日），如需延长请及时更新需求信息。', createdAt: '2026-06-30 15:20', status: 'read' },
  { id: 'mock_10', type: 'system', title: '收益到账通知', content: '您的推荐奖励￥200.00已发放至钱包余额，感谢您推荐朋友使用亮叶企服平台。', createdAt: '2026-06-29 09:00', status: 'unread' },
  { id: 'mock_11', type: 'intake', title: '放款成功通知', content: '恭喜！您的进件已完成终审，贷款金额￥150,000.00已放款至您绑定的银行账户，请注意查收。', createdAt: '2026-06-28 11:45', status: 'read', link: '/subpackages/intake/pages/status/status?section=disbursement' },
  { id: 'mock_12', type: 'clue', title: '车抵贷线索分配', content: '系统为您分配了一条车抵贷线索（北仑区），客户意向明确，请尽快联系跟进。', createdAt: '2026-06-27 08:30', status: 'read' }
]

const TYPE_META = {
  demand: { icon: '🤝', label: '需求', badge: '#0F3D2E', bg: '#E6F2EC' },
  clue: { icon: '🚗', label: '线索', badge: '#1a6bb5', bg: '#E3F2FD' },
  intake: { icon: '📋', label: '进件', badge: '#c77a00', bg: '#FFF3E0' },
  finance_circle: { icon: '💬', label: '融圈', badge: '#7B1FA2', bg: '#F3E5F5' },
  risk: { icon: '⚠️', label: '合规', badge: '#c0392b', bg: '#FDE8E8' },
  system: { icon: '📢', label: '系统', badge: '#666', bg: '#F0F0F0' },
  reward: { icon: '💰', label: '收益', badge: '#D4A84B', bg: '#FFF8E1' },
  activity: { icon: '🎉', label: '活动', badge: '#E91E63', bg: '#FCE4EC' }
}

Page({
  data: {
    notifications: [],
    filteredList: [],
    loading: true,
    filterType: 'all',
    summary: [],
    unreadCount: 0,
    showDetail: false,
    detailItem: null
  },

  onLoad() {
    this.loadNotifications()
  },

  onShow() {
    this.loadNotifications()
  },

  getReadIds() {
    try {
      const raw = wx.getStorageSync(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  },

  saveReadIds(ids) {
    wx.setStorageSync(STORAGE_KEY, JSON.stringify(ids))
  },

  enrichList(list) {
    const readIds = this.getReadIds()
    return (list || []).map((item, index) => {
      const meta = TYPE_META[item.type] || { icon: '📬', label: item.type || '', badge: '#666', bg: '#F0F0F0' }
      return {
        ...item,
        id: String(item.id || index),
        icon: item.icon || meta.icon,
        typeLabel: item.typeLabel || meta.label,
        _typeBadge: meta.badge,
        _typeBg: meta.bg,
        status: readIds.includes(String(item.id || index)) ? 'read' : (item.status || 'unread'),
        _summary: (item.content || '').length > 60 ? (item.content || '').slice(0, 60) + '...' : (item.content || '')
      }
    })
  },

  updateSummary(list) {
    const unread = list.filter(n => n.status === 'unread').length
    const today = new Date().toISOString().slice(0, 10)
    this.setData({
      unreadCount: unread,
      summary: [
        { label: '全部', value: String(list.length) },
        { label: '未读', value: String(unread) },
        { label: '今日', value: String(list.filter(n => String(n.createdAt || '').includes(today)).length) }
      ]
    })
    const app = getApp()
    if (app.globalData) app.globalData.unreadCount = unread
  },

  applyFilter() {
    const { notifications, filterType } = this.data
    let filtered = notifications
    if (filterType === 'unread') {
      filtered = notifications.filter(n => n.status === 'unread')
    } else if (filterType !== 'all') {
      filtered = notifications.filter(n => n.type === filterType)
    }
    this.setData({ filteredList: filtered })
  },

  loadNotifications() {
    this.setData({ loading: true })
    getNotifications().then(list => {
      const notifications = this.enrichList(list)
      this.setData({ notifications, loading: false })
      this.updateSummary(notifications)
      this.applyFilter()
    }).catch(() => {
      // Fallback to MOCK data when API fails
      const notifications = this.enrichList(MOCK_NOTIFICATIONS)
      this.setData({ notifications, loading: false })
      this.updateSummary(notifications)
      this.applyFilter()
    })
  },

  switchFilter(e) {
    this.setData({ filterType: e.currentTarget.dataset.type }, () => this.applyFilter())
  },

  openNotification(e) {
    const id = String(e.currentTarget.dataset.id)
    const item = this.data.notifications.find(n => String(n.id) === String(id))
    if (!item) return

    // Mark as read locally with storage persistence
    const readIds = this.getReadIds()
    if (!readIds.includes(id)) {
      readIds.push(id)
      this.saveReadIds(readIds)
    }

    const notifications = this.data.notifications.map(n =>
      String(n.id) === id ? { ...n, status: 'read' } : n
    )
    this.setData({ notifications })
    this.updateSummary(notifications)
    this.applyFilter()

    // Show detail modal
    this.setData({ showDetail: true, detailItem: item })
  },

  closeDetail() {
    this.setData({ showDetail: false, detailItem: null })
  },

  goDetailLink() {
    const { detailItem } = this.data
    if (!detailItem) return
    this.closeDetail()
    if (detailItem.link) {
      if (detailItem.link.startsWith('/pages/')) {
        wx.switchTab({ url: detailItem.link })
      } else {
        wx.navigateTo({ url: detailItem.link })
      }
    }
  },

  markAllRead() {
    // Mark all as read via API
    markAllNotificationsRead().then(() => {
      const notifications = this.data.notifications.map(n => ({ ...n, status: 'read' }))
      const allIds = notifications.map(n => String(n.id))
      this.saveReadIds(allIds)
      this.setData({ notifications })
      this.updateSummary(notifications)
      this.applyFilter()
      wx.showToast({ title: '已全部标为已读', icon: 'success' })
    }).catch(() => {
      // Fallback: mark all locally
      const notifications = this.data.notifications.map(n => ({ ...n, status: 'read' }))
      const allIds = notifications.map(n => String(n.id))
      this.saveReadIds(allIds)
      this.setData({ notifications })
      this.updateSummary(notifications)
      this.applyFilter()
      wx.showToast({ title: '已全部标为已读', icon: 'success' })
    })
  },

  subscribe() {
    refreshSubscribeTemplates().then(ids => {
      const tmplIds = [ids.intakeAudit, ids.intakeDisburse, ids.financeReview]
        .filter(id => id && !String(id).includes('TEMPLATE_ID'))
      if (!tmplIds.length) {
        wx.showToast({ title: '请在后台配置模板ID', icon: 'none' })
        return
      }
      if (!wx.requestSubscribeMessage) {
        wx.showToast({ title: '当前环境不支持订阅', icon: 'none' })
        return
      }
      wx.requestSubscribeMessage({
        tmplIds,
        success: () => wx.showToast({ title: '订阅成功', icon: 'success' }),
        fail: () => wx.showToast({ title: '订阅未完成', icon: 'none' })
      })
    })
  }
})
