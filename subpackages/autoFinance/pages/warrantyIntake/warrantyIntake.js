const { submitWarrantyApplication, getWarrantyContract, getWarrantyContractPdfUrl } = require('../../../../api/warranty')

Page({
  data: {
    step: 0,
    steps: ['车辆信息', '保险信息', '车主信息', '延保产品', '合同预览'],
    form: {
      brand: '', model: '', trim: '', year: '', invoicePrice: '', purchaseDate: '',
      registerCity: '宁波市', plateNo: '', financeAmount: '', financeTerm: '',
      compulsoryExpiry: '', commercialExpiry: '', commercialItems: '',
      ownerName: '', phone: '', address: '', emergencyContact: '',
      planId: 'basic', channel: '亮叶企服小程序', salesName: ''
    },
    photos: {},
    plan: null,
    submittedId: null,
    contractPreview: ''
  },

  onLoad(options) {
    const planId = options.type || options.planId || 'basic'
    const phone = options.phone || wx.getStorageSync('userPhone') || ''
    this.setData({ 'form.planId': planId, 'form.phone': phone })
    wx.setNavigationBarTitle({ title: '延保进件系统' })
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  choosePhoto(e) {
    const key = e.currentTarget.dataset.key
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        this.setData({ [`photos.${key}`]: res.tempFiles[0].tempFilePath })
      }
    })
  },

  nextStep() {
    if (this.data.step < this.data.steps.length - 1) {
      this.setData({ step: this.data.step + 1 })
      if (this.data.step === 4) this.loadContractPreview()
    }
  },

  prevStep() {
    if (this.data.step > 0) this.setData({ step: this.data.step - 1 })
  },

  loadContractPreview() {
    const id = this.data.submittedId
    if (id) {
      getWarrantyContract(id).then(res => {
        this.setData({ contractPreview: res.content || '' })
      })
      return
    }
    this.setData({
      contractPreview: `《汽车延保服务合同》预览\n套餐：${this.data.form.planId}\n车主：${this.data.form.ownerName || '-'}\n车辆：${this.data.form.brand} ${this.data.form.model}\n\n保障范围以正式签署版为准。`
    })
  },

  reportAccident() {
    wx.navigateTo({ url: '/subpackages/autoFinance/pages/warrantyClaim/warrantyClaim' })
  },

  submitApplication() {
    if (!/^1\d{10}$/.test(this.data.form.phone)) {
      return wx.showToast({ title: '请填写车主电话', icon: 'none' })
    }
    wx.showLoading({ title: '提交中...' })
    submitWarrantyApplication({ ...this.data.form, photos: this.data.photos })
      .then(res => {
        wx.setStorageSync('userPhone', this.data.form.phone)
        const history = wx.getStorageSync('warranty_applications') || []
        history.unshift({ id: res.id, phone: this.data.form.phone, plan_id: this.data.form.planId, contract_no: res.contractNo, status: res.status })
        wx.setStorageSync('warranty_applications', history)
        this.setData({ submittedId: res.id })
        wx.showModal({
          title: '延保申请已提交',
          content: `合同编号：${res.contractNo || '-'}\n顾问将联系您完成检测与签约。`,
          confirmText: '查看合同',
          cancelText: '返回',
          success: (r) => {
            if (r.confirm) {
              this.setData({ step: 4 })
              this.loadContractPreview()
            } else {
              wx.navigateBack()
            }
          }
        })
      })
      .finally(() => wx.hideLoading())
  },

  previewContract() {
    this.loadContractPreview()
    wx.showModal({
      title: '延保合同预览',
      content: this.data.contractPreview || '加载中…',
      confirmText: '复制合同',
      success: (res) => {
        if (res.confirm && this.data.contractPreview) {
          wx.setClipboardData({ data: this.data.contractPreview })
        }
      }
    })
  },

  downloadContract() {
    const id = this.data.submittedId
    if (!id) {
      return wx.showToast({ title: '请先提交申请', icon: 'none' })
    }
    wx.showLoading({ title: '生成PDF...' })
    getWarrantyContractPdfUrl(id)
      .then(res => {
        const url = res.url
        if (!url) throw new Error('无下载地址')
        wx.downloadFile({
          url,
          success: dl => {
            if (dl.statusCode === 200) {
              wx.openDocument({ filePath: dl.tempFilePath, fileType: 'pdf', showMenu: true })
            } else {
              wx.showToast({ title: '下载失败', icon: 'none' })
            }
          },
          fail: () => wx.showToast({ title: '下载失败', icon: 'none' })
        })
      })
      .catch(err => {
        const content = this.data.contractPreview
        if (content) {
          wx.setClipboardData({ data: content, success: () => wx.showToast({ title: '已复制合同文本', icon: 'none' }) })
        } else {
          wx.showToast({ title: err.message || '导出失败', icon: 'none' })
        }
      })
      .finally(() => wx.hideLoading())
  }
})
