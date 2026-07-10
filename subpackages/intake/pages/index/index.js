const store = require('../../utils/store')
const { rebuildSectionMap, filterModulesByProduct, getPresets, getSystemMeta } = require('../../utils/modules')
const { submitApplication, syncToServer, pullFromServer, prepareWorkflowData, exportApplicationPdf, initIntakeFromDemand, useIntakeApi } = require('../../../../api/intake')
const { getDemandDetail } = require('../../../../api/demand')
const { requestIntakeSubscribe } = require('../../../../utils/subscribe')

const MODULE_ICONS = {
  creditAuth: '🔏', credit: '🔏', basic: '📋', identity: '👤', personal: '👤',
  vehicle: '🚗', finance: '💰', loanPurpose: '🎯', income: '📊',
  contact: '📞', uploads: '📎', bankFlow: '🏦', idCard: '🪪',
  contract: '📝', audit: '🔍', status: '📈', disbursement: '💵',
  repay: '💳', guarantee: '🛡️', work: '💼', contacts: '👥'
}

Page({
  data: {
    meta: {},
    modules: [],
    progress: 0,
    doneCount: 0,
    productType: 'newCar',
    systemMeta: {},
    fillModules: [],
    viewModules: [],
    nextModule: null,
    intakeTypes: [
      { id: 'newCar', title: '新车按揭', icon: '🚗', desc: '新车贷款申请' },
      { id: 'usedCar', title: '二手车融资', icon: '🔄', desc: '二手车贷款申请' },
      { id: 'carMortgage', title: '车抵贷', icon: '🔑', desc: '车辆抵押贷款' },
      { id: 'lease', title: '以租代购', icon: '📋', desc: '租赁购车方案' }
    ]
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

  /** 获取当前产品的所有可填模块列表 */
  getFillModuleList(productType) {
    rebuildSectionMap(productType)
    const visibleModules = filterModulesByProduct(productType)
    return visibleModules.filter(m => m.type === 'form' || m.type === 'upload')
  },

  /** 判断模块是否已填写完成 */
  isModuleFilled(moduleId, data, productType) {
    const mods = this.getFillModuleList(productType)
    const mod = mods.find(m => m.id === moduleId)
    if (!mod) return false

    if (mod.type === 'upload') {
      const required = ['idCardFront', 'idCardBack', 'bankFlow', 'creditAuth']
      const uploads = data.uploads || {}
      const done = required.filter(k => (uploads[k] || {}).count > 0).length
      return done >= required.length
    }

    const section = data[moduleId] || {}
    const requiredKeys = (mod.fields || []).filter(f => f.required).map(f => f.key)
    if (requiredKeys.length === 0) return true
    return requiredKeys.every(k => section[k] && String(section[k]).trim())
  },

  /** 查找下一个未完成的模块 */
  findNextModule(data, productType, fillModules) {
    const allFillIds = ['credit', 'basic', 'personal', 'vehicle', 'finance', 'work', 'income', 'uploads', 'contacts']
    for (const id of allFillIds) {
      const mod = fillModules.find(m => m.id === id)
      if (!mod) continue
      if (!this.isModuleFilled(id, data, productType)) return mod
    }
    return null
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
      return {
        ...mod,
        status,
        statusText,
        iconEmoji: MODULE_ICONS[mod.id] || '📄'
      }
    })

    const fillModules = modules.filter(m => m.type === 'form' || m.type === 'upload')
    const viewModules = modules.filter(m => m.viewOnly || m.type === 'status-view' || m.type === 'contract-view')

    // 计算已完成数和下一个待填模块
    const doneCount = fillModules.filter(m => m.status === 'done').length
    const nextModule = this.findNextModule(data, productType, fillModules)

    const progress = Math.min(
      fillModules.length > 0
        ? Math.round((doneCount / fillModules.length) * 100)
        : 0,
      100
    )
    store.saveMeta({ progress })

    this.setData({
      meta: data.meta,
      modules,
      fillModules,
      viewModules,
      nextModule,
      progress,
      doneCount,
      productType
    })
  },

  navigateModule(e) {
    const path = e.currentTarget.dataset.path
    if (path) wx.navigateTo({ url: path })
  },

  goIntakeType(e) {
    const productType = e.currentTarget.dataset.id || 'newCar'
    // 快速进件 → 直接进入征信查询模块，启动自动化流程
    wx.navigateTo({
      url: `/subpackages/intake/pages/form/form?section=credit&productType=${productType}&autoNext=true`
    })
  },

  /** 继续进件：跳转到下一个未完成的模块 */
  resumeIntake() {
    const next = this.data.nextModule
    if (!next) return
    const targetPage = next.type === 'upload'
      ? `/subpackages/intake/pages/upload/upload?autoNext=true&productType=${this.data.productType}`
      : `/subpackages/intake/pages/form/form?section=${next.id}&autoNext=true&productType=${this.data.productType}`
    wx.navigateTo({ url: targetPage })
  },

  goStatus() {
    wx.navigateTo({ url: '/subpackages/intake/pages/status/status?section=audit' })
  },

  contactService() {
    wx.navigateTo({ url: '/subpackages/service/pages/chat/chat' })
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
  },

  onShareAppMessage() {
    return {
      title: '亮叶进件系统',
      path: '/subpackages/intake/pages/index/index',
      desc: '在线提交贷款申请材料，全程进度追踪可视化。'
    }
  },

  onShareTimeline() {
    return {
      title: '亮叶进件系统'
    }
  }
})