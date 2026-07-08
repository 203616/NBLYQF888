const { getRegionStats } = require('../../api/analytics')
const { getAppLocation, chooseLocation, requestLocation } = require('../../../../utils/location')

Page({
  data: {
    list: [],
    districts: [],
    provinces: [],
    updatedAt: '',
    source: '',
    maxValue: 1,
    location: null,
    currentCity: null,
    activeProvince: '全部',
    viewLevel: 'city',
    selectedCity: '',
    dataSources: [
      { name: '国家统计局国家数据', url: 'https://data.stats.gov.cn/', desc: '宏观经济与行业统计数据' },
      { name: '浙江省公共数据开放平台', url: 'https://data.zj.gov.cn/', desc: '浙江省政务公开数据' },
      { name: '上海市公共数据开放平台', url: 'https://data.sh.gov.cn/', desc: '上海市政务公开数据' },
      { name: '亮叶企服审核业务数据', url: '', desc: '平台线索、需求与进件审核汇总（脱敏）' }
    ]
  },

  onLoad() {
    requestLocation({ showError: false })
      .catch(() => null)
      .finally(() => {
        const location = getAppLocation()
        this.setData({ location })
        this.loadStats(location.city)
      })
  },

  loadStats(city) {
    getRegionStats().then(data => {
      const list = data.list || []
      const provinces = ['全部', ...Array.from(new Set(list.map(i => i.province)))]
      const currentCity = list.find(item => item.city === city) || list[0]
      const maxValue = Math.max(...list.map(item => item.clues + item.demands + item.applications), 1)
      const districts = data.districts || []
      this.setData({
        list,
        districts,
        provinces,
        currentCity,
        selectedCity: currentCity?.city || '',
        updatedAt: data.updatedAt || '',
        source: data.source || '',
        maxValue
      })
    }).catch(() => {
      wx.showToast({ title: '地区数据加载较慢，请稍后重试', icon: 'none' })
    })
  },

  handleChooseCity() {
    chooseLocation().then(location => {
      this.setData({ location, viewLevel: 'city', activeProvince: '全部' })
      this.loadStats(location.city)
    })
  },

  switchProvince(e) {
    const province = e.currentTarget.dataset.province
    this.setData({ activeProvince: province, viewLevel: 'city', districts: [] })
  },

  selectCity(e) {
    const city = e.currentTarget.dataset.city
    getRegionStats(city).then(data => {
      const item = (data.list || []).find(i => i.city === city)
      this.setData({
        selectedCity: city,
        currentCity: item || null,
        districts: data.districts || [],
        viewLevel: 'district'
      })
    })
  },

  backToCity() {
    this.setData({ viewLevel: 'city', districts: [] })
  },

  openSource(e) {
    const url = e.currentTarget.dataset.url
    if (!url) {
      return wx.showToast({ title: '内部业务数据', icon: 'none' })
    }
    wx.setClipboardData({
      data: url,
      success: () => wx.showToast({ title: '链接已复制', icon: 'success' })
    })
  },

  getFilteredList() {
    const { list, activeProvince } = this.data
    if (activeProvince === '全部') return list
    return list.filter(i => i.province === activeProvince)
  }
})
