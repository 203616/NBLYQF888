const { getClueList } = require('../../api/clue')
const { getAppLocation, chooseLocation, requestLocation } = require('../../../../utils/location')

const STATUS_MAP = {
  '跟进中': { color: '#22c55e', bg: '#E8F5E9', icon: '🔄' },
  '材料待补': { color: '#f59e0b', bg: '#FFF8E1', icon: '📋' },
  '待评估': { color: '#3b82f6', bg: '#E3F2FD', icon: '📊' },
  '已完成': { color: '#6b7280', bg: '#F3F4F6', icon: '✅' },
  '已关闭': { color: '#ef4444', bg: '#FEE2E2', icon: '🚫' },
  '待联系': { color: '#8b5cf6', bg: '#F3E8FF', icon: '📞' }
}

Page({
  data: {
    activeType: 'all',
    types: [
      { id: 'all', name: '全部' },
      { id: 'new', name: '🚗 新车' },
      { id: 'used', name: '🔄 二手车' },
      { id: 'mortgage', name: '🔑 车抵' },
      { id: 'lease', name: '📋 以租代购' },
      { id: 'business', name: '🏢 企业贷' },
      { id: 'personal', name: '👤 个人贷' },
      { id: 'mortgage_house', name: '🏠 房贷' },
      { id: 'other', name: '💼 其它贷款' }
    ],
    entryCards: [
      { id: 'lease', title: '以租代购', icon: '📋', path: '/subpackages/clue/pages/list/list?type=lease' },
      { id: 'business', title: '企业贷', icon: '🏢', path: '/subpackages/clue/pages/list/list?type=business' },
      { id: 'personal', title: '个人贷', icon: '👤', path: '/subpackages/clue/pages/list/list?type=personal' },
      { id: 'mortgage_house', title: '房贷', icon: '🏠', path: '/subpackages/clue/pages/list/list?type=mortgage_house' },
      { id: 'other', title: '其它贷款', icon: '💼', path: '/subpackages/clue/pages/list/list?type=other' }
    ],
    clues: [],
    location: null,
    loading: true,
    stats: []
  },

  onLoad(options) {
    this.setData({ activeType: options.type || 'all' })
    requestLocation({ showError: false })
      .catch(() => null)
      .finally(() => {
        this.setData({ location: getAppLocation() })
        this.loadClues()
      })
  },

  updateStats(clues) {
    const pending = clues.filter(c => c.status === '跟进中' || c.status === '材料待补' || c.status === '待评估').length
    this.setData({
      stats: [
        { label: '线索', value: String(clues.length) },
        { label: '待跟进', value: String(pending) },
        { label: '城市', value: this.data.location?.city?.slice(0, 3) || '-' }
      ]
    })
  },

  getStatusStyle(status) {
    return STATUS_MAP[status] || { color: '#666', bg: '#F5F5F5', icon: '📌' }
  },

  enrichClues(clues) {
    return clues.map(c => ({
      ...c,
      _statusStyle: this.getStatusStyle(c.status)
    }))
  },

  loadClues() {
    this.setData({ loading: true })
    getClueList({ type: this.data.activeType, city: this.data.location?.city }).then(clues => {
      this.setData({ clues: this.enrichClues(clues), loading: false })
      this.updateStats(clues)
    })
  },

  switchType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ activeType: type }, () => this.loadClues())
  },

  handleChooseCity() {
    chooseLocation().then(location => {
      this.setData({ location })
      this.loadClues()
    })
  },

  goEntry(e) {
    const path = e.currentTarget.dataset.path
    if (path) wx.navigateTo({ url: path })
  },

  goDetail(e) {
    wx.navigateTo({ url: `/subpackages/clue/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  }
})
