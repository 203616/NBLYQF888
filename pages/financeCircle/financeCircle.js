const { getDemandList, getMyDemands, submitDemand } = require('../../api/demand')
const { getFeedPosts, likePost, addComment, publishPost, uploadFeedImage } = require('../../api/financeCircle')
const { requestFinanceSubscribe } = require('../../utils/subscribe')
const { getAppLocation, chooseLocation, requestLocation } = require('../../utils/location')
const { preloadForPage } = require('../../utils/subpackagePreload')
const mock = require('../../api/mock')

Page({
  data: {
    demands: [],
    filteredDemands: [],
    filterType: 'all',
    location: null,
    institutions: [],
    hotPurposes: [],
    guides: [],
    institutionSupply: [],
    stats: [
      { label: '今日发布', value: '12' },
      { label: '匹配中', value: '8' },
      { label: '可咨询', value: '15' },
      { label: '合作机构', value: '20+' }
    ],
    flowSteps: [
      { title: '发布需求', desc: '填写金额、期限和联系方式' },
      { title: '方案匹配', desc: '按产品和机构偏好筛选' },
      { title: '专员跟进', desc: '确认材料与办理节奏' }
    ],
    demandTypes: [
      { label: '资金需求（找资金）', value: 'funding' },
      { label: '资金提供（供资金）', value: 'loan' }
    ],
    purposes: ['经营周转', '购车消费', '设备购置', '装修升级', '库存周转', '纳税合规周转', '备货采购', '其他合规用途'],
    periods: ['6个月', '1年', '2年', '3年', '5年'],
    newDemand: {
      type: 'funding',
      amount: '',
      period: '1年',
      purpose: '经营周转',
      contact: '',
      city: '',
      remark: ''
    },
    selectedTypeIndex: 0,
    selectedPurposeIndex: 0,
    selectedPeriodIndex: 1,
    submitting: false,
    feedPosts: [],
    showPublish: false,
    publishContent: '',
    publishImages: [],
    commentPostId: null,
    commentInput: '',
    userName: '亮叶用户'
  },

  onLoad() {
    preloadForPage('pages/financeCircle/financeCircle')
    const userInfo = wx.getStorageSync('userInfo')
    const extras = mock.financeCircleExtras || {}
    this.setData({
      institutions: mock.ningboInstitutions || [],
      hotPurposes: extras.hotPurposes || [],
      guides: extras.guides || [],
      institutionSupply: extras.institutionSupply || [],
      userName: userInfo?.nickName || '亮叶用户'
    })
    this.loadFeed()
    requestLocation({ showError: false })
      .catch(() => null)
      .finally(() => {
        const location = getAppLocation()
        const phone = wx.getStorageSync('userPhone')
        this.setData({
          location,
          'newDemand.city': location.city,
          'newDemand.contact': phone || ''
        })
        this.loadDemands()
      })
  },

  onShow() {
    const pendingFilter = wx.getStorageSync('financeCircleFilter')
    if (pendingFilter) {
      wx.removeStorageSync('financeCircleFilter')
      this.setData({ filterType: pendingFilter }, () => this.loadDemands())
      return
    }
    this.loadDemands()
  },

  loadFeed() {
    getFeedPosts().then(feedPosts => this.setData({ feedPosts }))
  },

  togglePublish() {
    this.setData({ showPublish: !this.data.showPublish })
  },

  onPublishInput(e) {
    this.setData({ publishContent: e.detail.value })
  },

  choosePublishImage() {
    const remain = 3 - this.data.publishImages.length
    if (remain <= 0) return wx.showToast({ title: '最多 3 张图片', icon: 'none' })
    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      success: (res) => {
        wx.showLoading({ title: '上传中' })
        const tasks = res.tempFiles.map(f => uploadFeedImage(f.tempFilePath))
        Promise.all(tasks).then(urls => {
          this.setData({ publishImages: [...this.data.publishImages, ...urls].slice(0, 3) })
          wx.showToast({ title: '图片已上传', icon: 'success' })
        }).catch(() => {
          wx.showToast({ title: '上传失败，请重试', icon: 'none' })
        }).finally(() => wx.hideLoading())
      }
    })
  },

  submitPublish() {
    const content = this.data.publishContent.trim()
    if (!content) return wx.showToast({ title: '请输入动态内容', icon: 'none' })
    requestFinanceSubscribe().finally(() => {
      publishPost({
        content,
        images: this.data.publishImages,
        userName: this.data.userName,
        userPhone: wx.getStorageSync('userPhone') || '',
        avatar: wx.getStorageSync('userInfo')?.avatarUrl || '/images/avatar.webp'
      }).then(res => {
        const status = res?.reviewStatus || 'pending'
        const toastMap = {
          pending: '已提交审核',
          approved: '发布成功',
          rejected: '未通过审核'
        }
        wx.showToast({
          title: toastMap[status] || '发布成功',
          icon: status === 'rejected' ? 'none' : 'success'
        })
        this.setData({ publishContent: '', publishImages: [], showPublish: false })
        if (status === 'approved') this.loadFeed()
      })
    })
  },

  handleLike(e) {
    const id = e.currentTarget.dataset.id
    likePost(id).then(res => {
      const feedPosts = this.data.feedPosts.map(p =>
        String(p.id) === String(id) ? { ...p, likes: res.likes, liked: true } : p
      )
      this.setData({ feedPosts })
    })
  },

  openComment(e) {
    this.setData({ commentPostId: e.currentTarget.dataset.id, commentInput: '' })
  },

  closeComment() {
    this.setData({ commentPostId: null, commentInput: '' })
  },

  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value })
  },

  submitComment() {
    const content = this.data.commentInput.trim()
    if (!content || !this.data.commentPostId) return
    addComment(this.data.commentPostId, content, this.data.userName).then(() => {
      wx.showToast({ title: '评论成功', icon: 'success' })
      this.setData({ commentPostId: null, commentInput: '' })
      this.loadFeed()
    })
  },

  previewFeedImage(e) {
    const url = e.detail?.url || e.currentTarget?.dataset?.url
    const urls = (e.detail?.previewUrls?.length ? e.detail.previewUrls : e.currentTarget?.dataset?.urls) || (url ? [url] : [])
    if (!url) return
    wx.previewImage({ urls, current: url })
  },

  applyFilter() {
    const { demands, filterType } = this.data
    let filtered = demands
    if (filterType === 'funding' || filterType === 'loan') {
      filtered = demands.filter(d => d.type === filterType)
    } else if (filterType === 'mine') {
      const phone = wx.getStorageSync('userPhone') || this.data.newDemand.contact || ''
      filtered = phone
        ? demands.filter(d => String(d.contact || '').includes(String(phone).slice(-4)))
        : demands.slice(0, 0)
    }
    this.setData({ filteredDemands: filtered })
  },

  switchFilter(e) {
    const filterType = e.currentTarget.dataset.type
    if (filterType === 'mine') {
      return this.loadMyDemands()
    }
    this.setData({ filterType }, () => this.applyFilter())
  },

  loadMyDemands() {
    this.setData({ filterType: 'mine' })
    getMyDemands().then(demands => {
      this.setData({ demands, filteredDemands: demands }, () => {
        this.setData({
          'stats[0].value': String(demands.length),
          'stats[1].value': String(demands.filter(d => d.status === '匹配中' || d.status === '初审中').length)
        })
      })
    })
  },

  loadDemands() {
    const city = this.data.location?.city
    const loader = this.data.filterType === 'mine'
      ? getMyDemands()
      : getDemandList(city ? { city } : {})
    loader.then(demands => {
      const matching = demands.filter(d => d.status === '匹配中' || d.status === '初审中').length
      this.setData({
        demands,
        'stats[1].value': String(matching),
        'stats[0].value': String(demands.length)
      }, () => this.applyFilter())
    }).catch(() => {
      wx.showToast({ title: '加载需求失败', icon: 'none' })
    })
  },

  navigateToFeedDetail(e) {
    wx.navigateTo({ url: `/subpackages/social/pages/feedDetail/feedDetail?id=${e.currentTarget.dataset.id}` })
  },

  navigateToDemandDetail(e) {
    wx.navigateTo({ url: `/subpackages/demand/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  handleSubmit() {
    if (this.data.submitting) return
    const { type, amount, period, contact, purpose, remark } = this.data.newDemand
    if (!amount || !contact) {
      return wx.showToast({ title: '请填写金额和联系方式', icon: 'none' })
    }
    this.setData({ submitting: true })
    submitDemand({
      type,
      title: type === 'funding' ? `寻求${amount}融资` : `提供${amount}融资方案`,
      amount,
      period,
      contact,
      purpose,
      remark,
      city: this.data.newDemand.city || this.data.location?.city,
      status: '初审中',
      progress: 15,
      tags: [purpose]
    }).then(newDemand => {
      if (!newDemand || !newDemand.id) throw new Error('发布失败')
      const demands = [newDemand, ...this.data.demands]
      this.setData({
        demands,
        newDemand: {
          type: 'funding', amount: '', period: '1年', purpose: '经营周转',
          contact: wx.getStorageSync('userPhone') || '', city: this.data.location?.city || '', remark: ''
        },
        selectedTypeIndex: 0,
        selectedPurposeIndex: 0,
        selectedPeriodIndex: 1
      }, () => this.applyFilter())
      wx.showModal({
        title: '需求发布成功',
        content: '是否立即提交经营贷进件？系统将自动带入金额、用途与联系方式。',
        confirmText: '去进件',
        cancelText: '稍后',
        success: (res) => {
          if (res.confirm) {
            const { goIntakeFromDemand } = require('../../utils/intakeNav')
            goIntakeFromDemand(newDemand)
          }
        }
      })
    }).catch(err => {
      wx.showToast({ title: err.message || '发布失败', icon: 'none' })
    }).finally(() => this.setData({ submitting: false }))
  },

  handleChooseCity() {
    chooseLocation().then(location => {
      this.setData({ location, 'newDemand.city': location.city })
    })
  },

  navigateToChannel() {
    wx.navigateTo({ url: '/subpackages/channel/pages/list/list' })
  },

  navigateToServiceChat() {
    wx.navigateTo({ url: '/subpackages/service/pages/chat/chat' })
  },

  goIntake() {
    const { goIntake } = require('../../utils/intakeNav')
    goIntake({ productType: 'business', productName: '易融圈融资需求' })
  },

  handleInputChange(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [`newDemand.${field}`]: e.detail.value })
  },

  handleTypeChange(e) {
    const index = Number(e.detail.value)
    this.setData({
      selectedTypeIndex: index,
      'newDemand.type': this.data.demandTypes[index].value
    })
  },

  handlePurposeChange(e) {
    const index = Number(e.detail.value)
    this.setData({
      selectedPurposeIndex: index,
      'newDemand.purpose': this.data.purposes[index]
    })
  },

  handlePeriodChange(e) {
    const index = Number(e.detail.value)
    this.setData({
      selectedPeriodIndex: index,
      'newDemand.period': this.data.periods[index]
    })
  }
})
