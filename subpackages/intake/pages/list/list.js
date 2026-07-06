const { getMyIntakeList, loadIntakeAsActive, useIntakeApi } = require('../../../../api/intake')
const store = require('../../utils/store')

const TYPE_LABEL = {
  newCar: '新车', usedCar: '二手车', mortgage: '车抵', business: '经营贷',
  personal: '个人贷', warranty: '延保', property: '抵押贷', lease: '租赁', workflow: '综合'
}

Page({
  data: {
    list: [],
    filteredList: [],
    loading: true,
    stats: [],
    filterStatus: 'all'
  },

  onLoad() {
    this.loadList()
  },

  onShow() {
    this.loadList()
  },

  onPullDownRefresh() {
    this.loadList().finally(() => wx.stopPullDownRefresh())
  },

  loadList() {
    this.setData({ loading: true })
    return getMyIntakeList().then(list => {
      const auditing = list.filter(i => i.status === 'auditing').length
      const done = list.filter(i => ['approved', 'disbursed', 'archived'].includes(i.status)).length
      this.setData({
        list,
        filteredList: this.filterList(list, this.data.filterStatus),
        loading: false,
        stats: [
          { label: '全部', value: String(list.length) },
          { label: '审核中', value: String(auditing) },
          { label: '已通过', value: String(done) }
        ]
      })
    }).catch(() => this.setData({ loading: false }))
  },

  filterList(list, filterStatus) {
    if (filterStatus === 'all') return list
    if (filterStatus === 'auditing') return list.filter(i => i.status === 'auditing')
    if (filterStatus === 'done') return list.filter(i => ['approved', 'disbursed', 'archived'].includes(i.status))
    return list.filter(i => i.status === 'draft')
  },

  switchFilter(e) {
    const filterStatus = e.currentTarget.dataset.status
    this.setData({
      filterStatus,
      filteredList: this.filterList(this.data.list, filterStatus)
    })
  },

  openIntake(e) {
    const { type, no, name } = e.currentTarget.dataset
    const open = () => {
      wx.showLoading({ title: '加载进件...' })
      const chain = no && useIntakeApi() ? loadIntakeAsActive(no) : Promise.resolve()
      chain
        .then(() => this.goIntake(type, name, no))
        .catch(() => {
          wx.showToast({ title: '加载失败，将打开本地数据', icon: 'none' })
          this.goIntake(type, name, no)
        })
        .finally(() => wx.hideLoading())
    }
    if (no && no !== store.getData().meta.applicationNo) {
      wx.showModal({
        title: '切换进件',
        content: `将加载进件 ${no} 到本机继续编辑，当前本地草稿会被替换。`,
        success: res => { if (res.confirm) open() }
      })
      return
    }
    open()
  },

  goIntake(productType, productName, applicationNo) {
    const type = productType || 'workflow'
    const name = encodeURIComponent(productName || '进件申请')
    let url = `/subpackages/intake/pages/index/index?productType=${type}&productName=${name}`
    if (applicationNo) url += `&applicationNo=${applicationNo}`
    wx.navigateTo({ url })
  },

  createIntake() {
    wx.showActionSheet({
      itemList: ['汽车金融进件', '企业经营贷', '个人消费贷', '延保服务'],
      success: res => {
        const map = [
          { productType: 'newCar', productName: '新能源车购车咨询' },
          { productType: 'business', productName: '企业经营贷进件' },
          { productType: 'personal', productName: '个人消费贷进件' },
          { productType: 'warranty', productName: '汽车延保进件' }
        ]
        const item = map[res.tapIndex]
        if (item) this.goIntake(item.productType, item.productName)
      }
    })
  },

  formatType(type) {
    return TYPE_LABEL[type] || type || '综合'
  }
})
