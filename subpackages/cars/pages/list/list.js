const { getCarList } = require('../../api/cars')
const { getAppLocation, chooseLocation, requestLocation } = require('../../../../utils/location')

Page({
  data: {
    location: null,
    keyword: '',
    cars: [],
    loading: true,
    stats: []
  },

  onLoad() {
    this.initPage()
  },

  onPullDownRefresh() {
    this.loadCars().finally(() => wx.stopPullDownRefresh())
  },

  initPage() {
    requestLocation({ showError: false })
      .catch(() => null)
      .finally(() => {
        this.setData({ location: getAppLocation() })
        this.loadCars()
      })
  },

  loadCars() {
    this.setData({ loading: true })
    return getCarList({ city: this.data.location?.city, keyword: this.data.keyword })
      .then(cars => {
        this.setData({
          cars,
          loading: false,
          stats: [
            { label: '车源', value: String(cars.length) },
            { label: '城市', value: (this.data.location?.city || '-').slice(0, 3) },
            { label: '可按揭', value: String(cars.filter(c => (c.tags || []).some(t => t.includes('按揭'))).length) }
          ]
        })
      })
      .catch(() => this.setData({ loading: false }))
  },

  handleSearchInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  handleSearch() {
    this.loadCars()
  },

  handleChooseCity() {
    chooseLocation().then(location => {
      this.setData({ location })
      this.loadCars()
    })
  },

  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/subpackages/cars/pages/detail/detail?id=${id}` })
  }
})
