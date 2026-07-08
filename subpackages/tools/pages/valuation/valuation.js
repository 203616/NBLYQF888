const { getValuationBrands, estimateVehicle, submitValuation } = require('../../api/tools')
const { uploadValuationPhoto, ocrValuationPhoto } = require('../../utils/valuationUpload')
const { getAppLocation, chooseLocation } = require('../../../../utils/location')

const PHOTO_SLOTS = [
  { key: 'licenseFront', label: '行驶证首页', required: true, ocr: true },
  { key: 'licenseBack', label: '行驶证副页', required: true },
  { key: 'register1', label: '登记证书1-2页', required: true },
  { key: 'register2', label: '登记证书3-4页', required: false },
  { key: 'register3', label: '登记证书5-6页', required: false },
  { key: 'register4', label: '登记证书7-8页', required: false }
]

Page({
  data: {
    location: null,
    brands: [],
    brandIndex: 0,
    photoSlots: PHOTO_SLOTS,
    photos: {},
    uploadedUrls: {},
    form: {
      brand: '比亚迪',
      model: '',
      purchasePrice: 150000,
      year: 2022,
      mileage: 3,
      phone: '',
      registerCity: '宁波市',
      vin: ''
    },
    result: null,
    submitting: false,
    ocrLoading: '',
    photoTip: '请确保四角完整露出、无反光、文字清晰'
  },

  onLoad() {
    const phone = wx.getStorageSync('userPhone')
    const loc = getAppLocation()
    this.setData({
      location: loc,
      'form.registerCity': loc.city || '宁波市',
      'form.phone': phone || ''
    })
    getValuationBrands().then(brands => {
      this.setData({ brands, 'form.brand': brands[0]?.brand || '比亚迪' })
    })
  },

  handleBrandChange(e) {
    const index = Number(e.detail.value)
    this.setData({ brandIndex: index, 'form.brand': this.data.brands[index].brand })
  },

  handleInput(e) {
    const { field } = e.currentTarget.dataset
    const val = e.detail.value
    this.setData({ [`form.${field}`]: field === 'phone' || field === 'model' || field === 'vin' || field === 'registerCity' ? val : Number(val) || val })
  },

  choosePhoto(e) {
    const key = e.currentTarget.dataset.key
    const slot = PHOTO_SLOTS.find(s => s.key === key)
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        const path = res.tempFiles[0].tempFilePath
        this.setData({ [`photos.${key}`]: path, ocrLoading: slot?.ocr ? key : '' })
        uploadValuationPhoto({ docKey: key, filePath: path })
          .then(uploadRes => {
            if (uploadRes?.url) this.setData({ [`uploadedUrls.${key}`]: uploadRes.url })
          })
          .catch(() => null)
        if (slot?.ocr) {
          ocrValuationPhoto({ docKey: key, filePath: path }).then(ocrRes => {
            const f = ocrRes.vehicleFields || {}
            const patch = {}
            if (f.vin) patch.vin = f.vin
            if (f.brand) patch.brand = f.brand
            if (f.model) patch.model = f.model
            if (Object.keys(patch).length) {
              this.setData({
                form: { ...this.data.form, ...patch },
                ocrLoading: ''
              })
              wx.showToast({ title: '行驶证已识别', icon: 'success' })
            } else {
              this.setData({ ocrLoading: '' })
            }
          }).catch(() => this.setData({ ocrLoading: '' }))
        }
      }
    })
  },

  previewPhoto(e) {
    const key = e.currentTarget.dataset.key
    const url = this.data.photos[key]
    if (url) wx.previewImage({ urls: [url], current: url })
  },

  handleEstimate() {
    if (!/^1\d{10}$/.test(String(this.data.form.phone))) {
      return wx.showToast({ title: '请填写手机号', icon: 'none' })
    }
    const required = PHOTO_SLOTS.filter(s => s.required)
    for (const slot of required) {
      if (!this.data.photos[slot.key]) {
        return wx.showToast({ title: `请上传${slot.label}`, icon: 'none' })
      }
    }
    this.setData({ submitting: true })
    const payload = {
      ...this.data.form,
      photos: this.data.photos,
      uploadedUrls: this.data.uploadedUrls,
      city: this.data.location?.city
    }
    submitValuation(payload)
      .then(result => {
        this.setData({ result })
        wx.showToast({ title: result.synced !== false ? '已同步服务器' : '估值完成', icon: 'success' })
      })
      .catch(() => {
        estimateVehicle(this.data.form).then(result => this.setData({ result }))
      })
      .finally(() => this.setData({ submitting: false }))
  },

  handleChooseCity() {
    chooseLocation().then(location => {
      this.setData({ location, 'form.registerCity': location.city })
    })
  },

  goIntake() {
    const { goIntake } = require('../../../../utils/intakeNav')
    goIntake({ productType: 'autoFinance', productName: '车辆估值进件' })
  }
})
