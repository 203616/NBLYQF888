const store = require('../../utils/store')
const { SECTION_MAP, rebuildSectionMap } = require('../../utils/modules')
const { syncToServer } = require('../../../../api/intake')
const { uploadIntakeFile, runIdCardOcr } = require('../../utils/intakeUpload')

Page({
  data: {
    section: '',
    module: null,
    formData: {},
    pickerIndex: {},
    filledCount: 0,
    totalRequired: 0,
    ocrLoading: ''
  },

  onLoad(options) {
    const section = options.section || 'basic'
    const data = store.getData()
    const productType = data.meta.productType || 'newCar'
    rebuildSectionMap(productType)
    const module = SECTION_MAP[section]
    if (!module) {
      wx.showToast({ title: '模块不存在', icon: 'none' })
      return setTimeout(() => wx.navigateBack(), 1500)
    }
    const formData = { ...(data[section] || {}) }
    if (section === 'personal' && !formData.mobile) {
      const phone = wx.getStorageSync('userPhone')
      if (phone) formData.mobile = phone
    }
    if (section === 'credit') {
      if (!formData.mobile) {
        const phone = wx.getStorageSync('userPhone')
        if (phone) formData.mobile = phone
      }
      if (!formData.realName && data.personal?.realName) formData.realName = data.personal.realName
    }
    wx.setNavigationBarTitle({ title: module.title })
    this.setData({ section, module, formData })
    this.updateProgress()
  },

  updateProgress() {
    const { module, formData } = this.data
    const required = (module.fields || []).filter(f => f.required)
    const filled = required.filter(f => {
      const val = formData[f.key]
      if (f.type === 'switch') return !!val
      if (f.type === 'image') return !!val
      return String(val || '').trim()
    }).length
    this.setData({ filledCount: filled, totalRequired: required.length })
  },

  handleInput(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ [`formData.${key}`]: e.detail.value }, () => this.updateProgress())
  },

  handlePicker(e) {
    const key = e.currentTarget.dataset.key
    const field = this.data.module.fields.find(f => f.key === key)
    const value = field.options[e.detail.value]
    this.setData({
      [`formData.${key}`]: value,
      [`pickerIndex.${key}`]: Number(e.detail.value)
    }, () => this.updateProgress())
  },

  handleSwitch(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ [`formData.${key}`]: e.detail.value }, () => this.updateProgress())
  },

  handleDate(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ [`formData.${key}`]: e.detail.value }, () => this.updateProgress())
  },

  handleChooseImage(e) {
    const key = e.currentTarget.dataset.key
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: (res) => {
        const sourceType = res.tapIndex === 0 ? ['camera'] : ['album']
        wx.chooseMedia({
          count: 1,
          mediaType: ['image'],
          sourceType,
          success: (mediaRes) => {
            const filePath = mediaRes.tempFiles[0].tempFilePath
            this.setData({ [`formData.${key}`]: filePath, ocrLoading: key }, () => this.updateProgress())
            this.syncImageUpload(key, filePath)
          }
        })
      }
    })
  },

  handlePreviewImage(e) {
    const key = e.currentTarget.dataset.key
    const url = this.data.formData[key]
    if (url) wx.previewImage({ urls: [url], current: url })
  },

  handleRemoveImage(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ [`formData.${key}`]: '' }, () => this.updateProgress())
  },

  syncImageUpload(key, filePath) {
    const data = store.getData()
    const applicationNo = data.meta.applicationNo
    const section = this.data.section
    uploadIntakeFile({ applicationNo, docKey: key, filePath })
      .then(uploadRes => {
        if (key === 'idCardFront' || key === 'idCardBack') {
          return runIdCardOcr({
            applicationNo,
            docKey: key,
            documentId: uploadRes?.id,
            side: key === 'idCardBack' ? 'back' : 'front'
          }).then(ocrRes => {
            const fields = ocrRes.personalFields || ocrRes.ocrDetail || {}
            const patch = {}
            if (fields.realName || fields.name) patch.realName = fields.realName || fields.name
            if (fields.idCard || fields.idNumber) {
              patch.idCard = fields.idCard || fields.idNumber
              store.saveSection('personal', { idCard: patch.idCard })
              if (section === 'credit') store.saveSection('credit', { idCard: patch.idCard })
            }
            if (fields.address) {
              store.saveSection('personal', { address: fields.address })
            }
            if (Object.keys(patch).length) {
              this.setData({
                formData: { ...this.data.formData, ...patch },
                ocrLoading: ''
              }, () => this.updateProgress())
              wx.showToast({ title: section === 'credit' ? '征信影像已识别' : '身份证已识别', icon: 'success' })
            } else {
              this.setData({ ocrLoading: '' })
            }
            store.saveUpload(key, [{ path: filePath, serverId: uploadRes?.id }])
            if (section === 'credit') {
              store.saveSection('credit', { [key]: filePath })
            }
          })
        }
        store.saveUpload(key, [{ path: filePath, serverId: uploadRes?.id }])
        this.setData({ ocrLoading: '' })
      })
      .catch(() => {
        this.setData({ ocrLoading: '' })
        wx.showToast({ title: '图片已保存本地', icon: 'none' })
      })
  },

  validateIdCard(id) {
    return /^\d{17}[\dXx]$/.test(id)
  },

  validateMobile(mobile) {
    return /^1\d{10}$/.test(mobile)
  },

  handleSave() {
    const { section, formData, module } = this.data
    for (const field of module.fields) {
      if (!field.required) continue
      if (field.type === 'switch') {
        if (!formData[field.key]) {
          return wx.showToast({ title: `请开启${field.label}`, icon: 'none' })
        }
        continue
      }
      if (field.type === 'image') {
        if (!formData[field.key]) {
          return wx.showToast({ title: `请上传${field.label}`, icon: 'none' })
        }
        continue
      }
      if (!String(formData[field.key] || '').trim()) {
        return wx.showToast({ title: `请填写${field.label}`, icon: 'none' })
      }
    }
    if (section === 'credit' || section === 'personal') {
      if (formData.mobile && !this.validateMobile(formData.mobile)) {
        return wx.showToast({ title: '手机号格式不正确', icon: 'none' })
      }
    }
    if (section === 'personal' && formData.idCard && !this.validateIdCard(formData.idCard)) {
      return wx.showToast({ title: '身份证号格式不正确', icon: 'none' })
    }
    if (section === 'credit') {
      if (formData.authSigned !== '是') {
        return wx.showToast({ title: '请确认已签署授权书', icon: 'none' })
      }
      if (formData.realName) {
        store.saveSection('personal', { realName: formData.realName, mobile: formData.mobile })
      }
    }
    store.saveSection(section, formData)
    syncToServer().catch(() => null)
    wx.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 800)
  }
})
