const { submitWarrantyClaim, getWarrantyClaims, getWarrantyApplications } = require('../../../../api/warranty')

Page({
  data: {
    form: {
      phone: '',
      plateNo: '',
      applicationId: '',
      faultDesc: '',
      location: ''
    },
    photos: [],
    claims: [],
    applications: [],
    submitting: false,
    claimFlow: [
      { title: '故障报修', desc: '填写故障现象并上传照片' },
      { title: '客服核实', desc: '核实保单状态与故障描述' },
      { title: '网点检修', desc: '预约合作网点检测维修' },
      { title: '理赔处理', desc: '按合同保障范围处理' }
    ]
  },

  onLoad() {
    const phone = wx.getStorageSync('userPhone') || ''
    this.setData({ 'form.phone': phone })
    this.loadData(phone)
  },

  loadData(phone) {
    getWarrantyClaims(phone).then(claims => this.setData({ claims }))
    getWarrantyApplications(phone).then(apps => {
      this.setData({
        applications: apps,
        'form.applicationId': apps[0]?.id || ''
      })
    })
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onAppPick(e) {
    const app = this.data.applications[Number(e.detail.value)]
    if (app) this.setData({ 'form.applicationId': app.id })
  },

  choosePhoto() {
    wx.chooseMedia({
      count: 3,
      mediaType: ['image'],
      success: (res) => {
        const paths = res.tempFiles.map(f => f.tempFilePath)
        this.setData({ photos: [...this.data.photos, ...paths].slice(0, 6) })
      }
    })
  },

  removePhoto(e) {
    const idx = e.currentTarget.dataset.idx
    const photos = [...this.data.photos]
    photos.splice(idx, 1)
    this.setData({ photos })
  },

  submitClaim() {
    const { phone, plateNo, faultDesc, applicationId } = this.data.form
    if (!/^1\d{10}$/.test(phone)) return wx.showToast({ title: '请填写手机号', icon: 'none' })
    if (!faultDesc.trim()) return wx.showToast({ title: '请描述故障情况', icon: 'none' })
    this.setData({ submitting: true })
    submitWarrantyClaim({
      phone,
      plateNo,
      applicationId: applicationId || null,
      faultDesc,
      location: this.data.form.location,
      photos: this.data.photos
    }).then(() => {
      wx.showToast({ title: '理赔申请已提交', icon: 'success' })
      this.setData({ 'form.faultDesc': '', photos: [] })
      this.loadData(phone)
    }).finally(() => this.setData({ submitting: false }))
  },

  callService() {
    wx.navigateTo({ url: '/subpackages/service/pages/chat/chat' })
  }
})
