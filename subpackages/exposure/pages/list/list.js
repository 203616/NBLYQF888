const { getExposureList } = require('../../api/exposure')

Page({
  data: {
    filters: [
      { id: 'all', name: '全部' },
      { id: 'fraud', name: '金融诈骗' },
      { id: 'illegal', name: '违规操作' },
      { id: 'fake', name: '虚假宣传' }
    ],
    activeFilter: 'all',
    exposureList: [],
    isLoading: false,
    stats: { total: 0, verified: 0, reports: 0 },
    statList: []
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: '曝光台' })
    this.loadExposureData()
  },

  switchFilter(e) {
    const filterId = e.currentTarget.dataset.id
    this.setData({ activeFilter: filterId }, () => this.loadExposureData())
  },

  loadExposureData() {
    if (this.data.isLoading) return
    this.setData({ isLoading: true })
    getExposureList({ type: this.data.activeFilter })
      .then(exposureList => {
        const stats = {
          total: exposureList.length,
          verified: exposureList.filter(i => i.status === '已核实' || i.status === '已处理').length,
          reports: exposureList.reduce((s, i) => s + parseInt(String(i.count).replace(/\D/g, '') || 0, 10), 0)
        }
        this.setData({
          exposureList,
          stats,
          statList: [
            { label: '曝光', value: String(stats.total) },
            { label: '已核实', value: String(stats.verified) },
            { label: '举报', value: String(stats.reports) }
          ]
        })
      })
      .finally(() => {
        this.setData({ isLoading: false })
        wx.stopPullDownRefresh()
      })
  },

  navigateToDetail(e) {
    wx.navigateTo({ url: `/subpackages/exposure/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  navigateToReport() {
    wx.navigateTo({ url: '/subpackages/exposure/pages/report/report' })
  },

  onPullDownRefresh() {
    this.loadExposureData()
  }
})
