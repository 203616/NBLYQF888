const { getChannelList } = require('../../api/channel')
const { getAppLocation, chooseLocation, requestLocation } = require('../../../../utils/location')

Page({
  data: {
    location: null,
    partners: [],
    filteredPartners: [],
    activeTag: 'all',
    loading: true,
    stats: []
  },

  onLoad() {
    requestLocation({ showError: false })
      .catch(() => null)
      .finally(() => {
        this.setData({ location: getAppLocation() })
        this.loadPartners()
      })
  },

  updateStats(partners) {
    const verified = partners.filter(p => p.verified).length
    const totalCases = partners.reduce((s, p) => s + (p.cases || 0), 0)
    this.setData({
      stats: [
        { label: '渠道', value: String(partners.length) },
        { label: '已认证', value: String(verified) },
        { label: '累计案例', value: String(totalCases) }
      ]
    })
  },

  applyFilter() {
    const { partners, activeTag } = this.data
    let filtered = partners
    if (activeTag !== 'all') {
      filtered = partners.filter(p => (p.tags || []).some(t => t.includes(activeTag)))
    }
    this.setData({ filteredPartners: filtered })
  },

  loadPartners() {
    this.setData({ loading: true })
    getChannelList({ city: this.data.location?.city }).then(partners => {
      this.setData({ partners, loading: false })
      this.updateStats(partners)
      this.applyFilter()
    })
  },

  switchTag(e) {
    this.setData({ activeTag: e.currentTarget.dataset.tag }, () => this.applyFilter())
  },

  handleChooseCity() {
    chooseLocation().then(location => {
      this.setData({ location })
      this.loadPartners()
    })
  },

  contactPartner(e) {
    const id = e.currentTarget.dataset.id
    const partner = this.data.partners.find(p => p.id === id)
    if (!partner) return
    wx.showModal({
      title: partner.name,
      content: `联系人：${partner.contact}\n城市：${partner.city}\n\n平台将记录您的联系意向，请通过官方渠道合规对接。`,
      confirmText: '联系客服',
      success: (res) => {
        if (res.confirm) this.navigateToService()
      }
    })
  },

  goIntake() {
    const { goIntake } = require('../../../../utils/intakeNav')
    goIntake({ productType: 'business', productName: '助融渠道进件' })
  },

  navigateToApply() {
    wx.navigateTo({ url: '/subpackages/channel/pages/apply/apply' })
  },

  navigateToService() {
    wx.navigateTo({ url: '/subpackages/service/pages/chat/chat' })
  }
})
