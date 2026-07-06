const { getOaDashboard } = require('../../../../api/profile')

Page({
  data: {
    stats: [],
    tasks: [],
    filteredTasks: [],
    meetings: [],
    taskFilter: 'all',
    taskFilterLabel: '全部'
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: 'OA工作台' })
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  parseMeetingTime(timeStr = '') {
    const parts = String(timeStr).split(' ')
    return {
      dayLabel: parts[0] || '待定',
      timeShort: parts[1] || timeStr
    }
  },

  loadData() {
    getOaDashboard().then(data => {
      const meetings = (data.meetings || []).map(m => ({
        ...m,
        ...this.parseMeetingTime(m.time)
      }))
      const tasks = (data.tasks || []).map(t => ({
        ...t,
        priorityKey: { '高': 'high', '中': 'medium', '低': 'low' }[t.priority] || 'medium'
      }))
      this.setData({
        stats: data.stats || [],
        tasks,
        meetings
      }, () => this.applyTaskFilter())
    })
  },

  applyTaskFilter() {
    const { tasks, taskFilter } = this.data
    let filtered = tasks
    if (taskFilter === 'pending') {
      filtered = tasks.filter(t => t.status === '待处理' || t.status === '待沟通')
    } else if (taskFilter === 'processing') {
      filtered = tasks.filter(t => t.status === '进行中')
    }
    this.setData({ filteredTasks: filtered })
  },

  toggleTaskFilter() {
    const next = this.data.taskFilter === 'all' ? 'pending' : this.data.taskFilter === 'pending' ? 'processing' : 'all'
    const labels = { all: '全部', pending: '待处理', processing: '进行中' }
    this.setData({ taskFilter: next, taskFilterLabel: labels[next] }, () => this.applyTaskFilter())
  },

  onStatTap(e) {
    wx.showToast({ title: e.currentTarget.dataset.name, icon: 'none' })
  },

  handleTaskTap(e) {
    const task = this.data.tasks.find(item => String(item.id) === String(e.currentTarget.dataset.id))
    if (!task) return
    wx.showModal({
      title: task.title,
      content: `${task.desc}\n\n类型：${task.type}\n截止：${task.due}\n状态：${task.status}${task.assignee ? '\n负责人：' + task.assignee : ''}`,
      confirmText: '标记跟进',
      cancelText: '关闭',
      success: (res) => {
        if (res.confirm) wx.showToast({ title: '已更新跟进状态', icon: 'success' })
      }
    })
  },

  handleMeetingTap(e) {
    const meeting = this.data.meetings.find(m => String(m.id) === String(e.currentTarget.dataset.id))
    if (!meeting) return
    wx.showModal({
      title: meeting.title,
      content: `时间：${meeting.time}\n地点：${meeting.place}\n主持：${meeting.host}\n${meeting.agenda ? '\n议程：' + meeting.agenda : ''}`,
      showCancel: false
    })
  },

  goIntake() {
    wx.navigateTo({ url: '/subpackages/intake/pages/index/index?productType=workflow' })
  },

  goFinanceCircle() {
    wx.switchTab({ url: '/pages/financeCircle/financeCircle' })
  },

  goDocs() {
    wx.navigateTo({ url: '/subpackages/profile/pages/docs/docs' })
  },

  goChat() {
    wx.navigateTo({ url: '/subpackages/service/pages/chat/chat' })
  }
})
