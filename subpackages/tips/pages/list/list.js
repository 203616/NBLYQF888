const { getTipsList } = require('../../../../api/content')

Page({
  data: {
    riskLevel: 0,
    tipsList: [],
    filteredList: [],
    statList: []
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: '避坑指南' })
    getTipsList().then(tipsList => {
      const statList = [
        { label: '指南', value: String(tipsList.length) },
        { label: '高风险', value: String(tipsList.filter(i => i.level === 'high').length) },
        { label: '总阅读', value: this.formatViews(tipsList.reduce((s, i) => s + (i.views || 0), 0)) }
      ]
      this.setData({ tipsList, statList }, () => this.filterList())
    })
  },

  formatViews(n) {
    return n >= 10000 ? (n / 10000).toFixed(1) + '万' : String(n)
  },

  filterList() {
    const { tipsList, riskLevel } = this.data
    let list = [...tipsList]
    if (riskLevel > 0) {
      const levelMap = { 1: 'high', 2: 'medium', 3: 'low' }
      list = list.filter(item => item.level === levelMap[riskLevel])
    }
    this.setData({ filteredList: list })
  },

  filterByRisk(e) {
    this.setData({ riskLevel: Number(e.currentTarget.dataset.level) }, () => this.filterList())
  },

  navigateToDetail(e) {
    wx.navigateTo({ url: `/subpackages/tips/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  goExposure() {
    wx.navigateTo({ url: '/subpackages/exposure/pages/list/list' })
  },

  goReport() {
    wx.navigateTo({ url: '/subpackages/exposure/pages/report/report' })
  }
})
