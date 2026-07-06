const store = require('../../utils/store')
const { rebuildSectionMap, filterModulesByProduct, getPresets, getSystemMeta } = require('../../utils/modules')
const { submitApplication, syncToServer, pullFromServer, prepareWorkflowData, exportApplicationPdf, initIntakeFromDemand, useIntakeApi } = require('../../../../api/intake')
const { getDemandDetail } = require('../../../../api/demand')
const { requestIntakeSubscribe } = require('../../../../utils/subscribe')

Page({
  data: {
    meta: {},
    modules: [],
    progress: 0,
    productType: 'newCar',
    systemMeta: {},
    fillModules: [],
    viewModules: []
  },

  onLoad(options) {
    const productType = options.productType || 'newCar'
    rebuildSectionMap(productType)
    const presets = getPresets(productType)
    const preset = presets[productType] || Object.values(presets)[0] || {}
    const systemMeta = getSystemMeta(productType)

    const boot = () => {
      if (options.applicationNo && useIntakeApi()) {
        return pullFromServer(options.applicationNo, { force: true }).then(() => {
          this.initPage(options, productType, preset, systemMeta)
        })
      }
      if (options.demandId) {
        return getDemandDetail(options.demandId).then(demand => {
          return initIntakeFromDemand(demand).then(() => this.initPage(options, productType, preset, systemMeta))
        })
      }
      this.initPage(options, productType, preset, systemMeta)
      return Promise.resolve()
    }

    boot().catch(() => this.initPage(options, productType, preset, systemMeta))
  },

  initPage(options, productType, preset, systemMeta) {
    const current = store.getData()
    const skipPreset = options.applicationNo && current.meta.applicationNo === options.applicationNo && current.meta.lastSyncedAt
    if (!skipPreset) {
      store.initWithProduct({
        productType,
        productName: options.productName || preset.productName || systemMeta.title,
        productId: options.productId || '',
        systemKey: systemMeta.key
      })
    }

    Object.keys(preset).forEach(key => {
      if (!skipPreset && key !== 'productName' && typeof preset[key] === 'object') {
        store.saveSection(key, preset[key])
      }
    })
    if (!skipPreset && preset.loanPurpose) store.saveSection('basic', { loanPurpose: preset.loanPurpose })

    const vehiclePatch = {}
    if (options.brand) vehiclePatch.brand = decodeURIComponent(options.brand)
    if (options.model) vehiclePatch.model = decodeURIComponent(options.model)
    if (options.price) vehiclePatch.purchasePrice = decodeURIComponent(options.price)
    if (Object.keys(vehiclePatch).length) store.saveSection('vehicle', vehiclePatch)
    if (options.mobile) store.saveSection('personal', { mobile: decodeURIComponent(options.mobile) })

    wx.setNavigationBarTitle({ title: systemMeta.title })
    this.setData({ productType, systemMeta })
    this.refresh()
  },

  onShow() {
    const syncChain = useIntakeApi()
      ? syncToServer().then(() => pullFromServer())
      : prepareWorkflowData()
    syncChain.then(() => this.refresh()).catch(() => this.refresh())
  },

  refresh() {
    const data = store.getData()
    const productType = data.meta.productType || this.data.productType
    rebuildSectionMap(productType)
    const visibleModules = filterModulesByProduct(productType)

    const VIEW_STATUS_TEXT = {
      pending: '待处理', processing: '进行中', done: '已完成', active: '正常', locked: '未开启'
    }

    const modules = visibleModules.map(mod => {
      let status = 'pending'
      if (mod.type === 'form') {
        const section = data[mod.id] || {}
        const requiredKeys = (mod.fields || []).filter(f => f.required).map(f => f.key)
        const filled = requiredKeys.length === 0 || requiredKeys.every(k => section[k] && String(section[k]).trim())
        status = filled ? 'done' : 'pending'
      } else if (mod.type === 'upload') {
        const required = ['idCardFront', 'idCardBack', 'bankFlow', 'creditAuth']
        const done = required.filter(k => (data.uploads[k] || {}).count > 0).length
        status = done === required.length ? 'done' : done > 0 ? 'processing' : 'pending'
      } else if (mod.viewOnly || mod.type === 'status-view' || mod.type === 'contract-view') {
        status = (data.workflow[mod.id] || {}).status || (mod.id === 'contract' ? 'active' : 'locked')
      } else {
        status = (data.workflow[mod.id] || {}).status || 'locked'
      }
      const statusText = (mod.viewOnly || mod.type === 'status-view' || mod.type === 'contract-view')
        ? (VIEW_STATUS_TEXT[status] || '查看')
        : (status === 'done' ? '已完成' : status === 'processing' ? '进行中' : '待完善')
      return { ...mod, status, statusText }
    })

    const fillModules = modules.filter(m => m.type === 'form' || m.type === 'upload')
    const viewModules = modules.filter(m => m.viewOnly || m.type === 'status-view' || m.type === 'contract-view')

    this.setData({
      meta: data.meta,
      modules,
      fillModules,
      viewModules,
      progress: data.meta.progress || 0,
      productType
    })
  },

  navigateModule(e) {
    const path = e.currentTarget.dataset.path
    if (path) wx.navigateTo({ url: path })
  },

  handleSubmit() {
    requestIntakeSubscribe()
    wx.showLoading({ title: '提交中...' })
    submitApplication()
      .then(() => {
        wx.showModal({
          title: '提交成功',
          content: '进件材料已进入审核队列，请留意微信订阅消息通知。您可在「审核进度」模块查看状态。',
          showCancel: false,
          success: () => {
            this.refresh()
            wx.navigateTo({ url: '/subpackages/intake/pages/status/status?section=audit' })
          }
        })
      })
      .catch(err => {
        wx.showToast({ title: err.message || '提交失败', icon: 'none', duration: 3000 })
      })
      .finally(() => wx.hideLoading())
  },

  handleExportPdf() {
    wx.showLoading({ title: '生成PDF...' })
    exportApplicationPdf()
      .then(res => {
        const url = res.url || res.fullUrl
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
      .catch(err => wx.showToast({ title: err.message || '导出失败', icon: 'none' }))
      .finally(() => wx.hideLoading())
  }
})
