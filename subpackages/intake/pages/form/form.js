const store = require('../../utils/store')
const { SECTION_MAP, rebuildSectionMap, filterModulesByProduct } = require('../../utils/modules')
const { syncToServer } = require('../../../../api/intake')
const { uploadIntakeFile, runIdCardOcr } = require('../../utils/intakeUpload')

/** 汽车金融进件模块填写顺序（自动化流转用） */
const AUTO_NEXT_ORDER = ['credit', 'basic', 'personal', 'vehicle', 'finance', 'work', 'income', 'uploads', 'contacts']

Page({
  data: {
    section: '',
    module: null,
    formData: {},
    pickerIndex: {},
    filledCount: 0,
    totalRequired: 0,
    ocrLoading: '',
    productType: '',
    autoNext: false,
    showFlowNav: false,
    currentStep: 1,
    totalSteps: 1
  },

  onLoad(options) {
    const section = options.section || 'basic'
    const productType = options.productType || ''
    const autoNext = options.autoNext === 'true'

    // 如果传入了productType，先初始化进件数据
    if (productType && autoNext) {
      const current = store.getData()
      if (current.meta.productType !== productType) {
        const { getSystemMeta, getPresets } = require('../../utils/modules')
        const systemMeta = getSystemMeta(productType)
        const presets = getPresets(productType)
        const preset = presets[productType] || Object.values(presets)[0] || {}
        store.initWithProduct({
          productType,
          productName: preset.productName || systemMeta.title,
          productId: '',
          systemKey: systemMeta.key
        })
        Object.keys(preset).forEach(key => {
          if (key !== 'productName' && typeof preset[key] === 'object') {
            store.saveSection(key, preset[key])
          }
        })
        if (preset.loanPurpose) store.saveSection('basic', { loanPurpose: preset.loanPurpose })
      }
    }

    const data = store.getData()
    const finalProductType = productType || data.meta.productType || 'newCar'
    rebuildSectionMap(finalProductType)

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

    // 检查是否有下一个模块，决定是否显示流程导航提示
    const allFill = this.getFillModules(finalProductType)
    const currentIdx = allFill.findIndex(m => m.id === section)
    const showFlowNav = autoNext && currentIdx >= 0 && currentIdx < allFill.length - 1

    wx.setNavigationBarTitle({ title: module.title })
    this.setData({ section, module, formData, productType: finalProductType, autoNext, showFlowNav, currentStep: currentIdx + 1, totalSteps: allFill.length })
    this.updateProgress()
  },

  /** 获取当前产品的所有可填模块列表 */
  getFillModules(productType) {
    const mods = filterModulesByProduct(productType || this.data.productType)
    return mods.filter(m => m.type === 'form' || m.type === 'upload')
  },

  /** 判断模块是否已完整填写 */
  isModuleFilled(moduleId) {
    const data = store.getData()
    const mods = this.getFillModules()
    const mod = mods.find(m => m.id === moduleId) || SECTION_MAP[moduleId]
    if (!mod) return false

    if (mod.type === 'upload') {
      const required = ['idCardFront', 'idCardBack', 'bankFlow', 'creditAuth']
      const uploads = data.uploads || {}
      const done = required.filter(k => (uploads[k] || {}).count > 0).length
      return done === required.length
    }

    const section = data[moduleId] || {}
    const requiredKeys = (mod.fields || []).filter(f => f.required).map(f => f.key)
    if (requiredKeys.length === 0) return true
    return requiredKeys.every(k => section[k] && String(section[k]).trim())
  },

  /** 查找下一个未完成的模块id */
  findNextUnfilled() {
    const allFill = this.getFillModules()
    const currentIdx = allFill.findIndex(m => m.id === this.data.section)
    for (let i = currentIdx + 1; i < allFill.length; i++) {
      if (!this.isModuleFilled(allFill[i].id)) {
        return allFill[i]
      }
    }
    return null
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
    const { section, formData, module, autoNext } = this.data

    // 必填校验
    for (const field of module.fields) {
      if (!field.required) continue
      if (field.type === 'switch') {
        if (!formData[field.key]) {
          return wx.showToast({ title: `请确认${field.label}`, icon: 'none' })
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

    // 特定校验
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

    // 保存当前模块数据
    store.saveSection(section, formData)
    syncToServer().catch(() => null)

    // 检查更新后的总进度
    const totalModules = this.getFillModules()
    const completed = totalModules.filter(m => {
      if (m.id === section) return true // 当前刚刚保存
      return this.isModuleFilled(m.id)
    }).length
    const progress = Math.round((completed / totalModules.length) * 100)
    store.saveMeta({ progress })

    // 自动流转：查找下一个未完成的模块
    if (autoNext) {
      const nextMod = this.findNextUnfilled()
      if (nextMod) {
        wx.showToast({ title: `✅ ${module.title} 已保存，进入 ${nextMod.title}`, icon: 'none', duration: 1500 })
        setTimeout(() => {
          const targetPage = nextMod.type === 'upload'
            ? `/subpackages/intake/pages/upload/upload?autoNext=true&productType=${this.data.productType}`
            : `/subpackages/intake/pages/form/form?section=${nextMod.id}&autoNext=true&productType=${this.data.productType}`
          wx.redirectTo({ url: targetPage })
        }, 1200)
        return
      }
    }

    // 所有模块完成 或 非自动模式
    if (autoNext) {
      wx.showToast({ title: '🎉 所有进件信息已填写完成！', icon: 'none', duration: 2000 })
      setTimeout(() => {
        wx.navigateBack()
      }, 2200)
    } else {
      wx.showToast({ title: '已保存', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 800)
    }
  }
})