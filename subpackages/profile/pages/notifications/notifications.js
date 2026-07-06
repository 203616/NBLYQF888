const { getNotifications, markNotificationRead, markAllNotificationsRead } = require('../../../../api/notification')
const { refreshSubscribeTemplates } = require('../../../../utils/subscribe')

const TYPE_META = {
  demand: { icon: '🤝', label: '需求' },
  clue: { icon: '🚗', label: '线索' },
  intake: { icon: '📋', label: '进件' },
  finance_circle: { icon: '💬', label: '融圈' },
  risk: { icon: '⚠️', label: '合规' },
  system: { icon: '📢', label: '系统' }
}

Page({
  data: {
    notifications: [],
    filteredList: [],
    loading: true,
    filterType: 'all',
    summary: [],
    unreadCount: 0
  },

  onLoad() {
    this.loadNotifications()
  },

  onShow() {
    this.loadNotifications()
  },

  enrichList(list) {
    return (list || []).map(item => {
      const meta = TYPE_META[item.type] || { icon: '📬', label: item.type }
      return {
        ...item,
        icon: item.icon || meta.icon,
        typeLabel: item.typeLabel || meta.label
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
      this.setData({ loading: false })
    })
  },

  switchFilter(e) {
    this.setData({ filterType: e.currentTarget.dataset.type }, () => this.applyFilter())
  },

  openNotification(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.notifications.find(n => String(n.id) === String(id))
    if (!item) return
    markNotificationRead(id).then(() => {
      const notifications = this.data.notifications.map(n =>
        String(n.id) === String(id) ? { ...n, status: 'read' } : n
      )
      this.setData({ notifications })
      this.updateSummary(notifications)
      this.applyFilter()
      if (item.link) {
        if (item.link.startsWith('/pages/')) {
          wx.switchTab({ url: item.link })
        } else {
          wx.navigateTo({ url: item.link })
        }
      } else {
        wx.showModal({
          title: item.title,
          content: item.content,
          showCancel: false
        })
      }
    })
  },

  markAllRead() {
    markAllNotificationsRead().then(() => {
      const notifications = this.data.notifications.map(n => ({ ...n, status: 'read' }))
      this.setData({ notifications })
      this.updateSummary(notifications)
      this.applyFilter()
      wx.showToast({ title: '已全部标为已读', icon: 'success' })
    }).catch(() => wx.showToast({ title: '操作失败', icon: 'none' }))
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
