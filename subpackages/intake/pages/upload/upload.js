const store = require('../../utils/store')
const { uploadIntakeFile, runIdCardOcr, useIntakeApi } = require('../../../../utils/intakeUpload')
const { syncToServer } = require('../../../../api/intake')

const UPLOAD_ITEMS = [
  { key: 'idCardFront', name: '身份证正面', desc: '人像面清晰无遮挡，四角完整', required: true, example: '姓名、号码、头像清晰可见', ocr: true },
  { key: 'idCardBack', name: '身份证反面', desc: '国徽面清晰无遮挡', required: true, example: '签发机关、有效期清晰', ocr: true },
  { key: 'bankFlow', name: '银行流水', desc: '近6个月完整流水，体现收入', required: true, example: '建议提供工资入账账户' },
  { key: 'incomeProof', name: '收入证明', desc: '工资单、纳税或公积金记录', required: true, example: '需加盖单位公章' },
  { key: 'creditAuth', name: '征信授权书', desc: '签署后的征信查询授权', required: true, example: '可使用平台标准模板' },
  { key: 'vehicleInvoice', name: '车辆发票/合同', desc: '购车发票或二手车交易合同', required: false, example: '新车按揭核心材料' },
  { key: 'drivingLicense', name: '驾驶证', desc: '正副页完整拍摄', required: false, example: '车抵贷建议提供' },
  { key: 'other', name: '其他补充材料', desc: '经营执照、房产证、社保记录等', required: false, example: '按机构要求补充' }
]

const ID_CARD_KEYS = ['idCardFront', 'idCardBack']
const OCR_STATUS_TEXT = {
  none: '待识别',
  processing: '识别中',
  success: '已识别',
  failed: '识别失败'
}

Page({
  data: {
    items: [],
    requiredDone: 0,
    requiredTotal: 5,
    uploadPercent: 0,
    syncing: false,
    cloudSynced: false,
    ocrSummary: [],
    canFillPersonal: false,
    pendingPersonalFields: {}
  },

  onShow() {
    this.refreshList()
  },

  buildOcrPreview(ocrResult, docKey) {
    if (!ocrResult) return ''
    const detail = ocrResult.ocrDetail || ocrResult.personalFields || ocrResult.ocr || {}
    if (docKey === 'idCardFront') {
      return [detail.realName || detail.name, detail.idCard || detail.idNumber, detail.address].filter(Boolean).join(' · ')
    }
    if (docKey === 'idCardBack') {
      return [detail.issueAuthority || detail.issue, detail.validDate || detail.validPeriod].filter(Boolean).join(' · ')
    }
    return ''
  },

  refreshList() {
    const data = store.getData()
    const meta = data.meta || {}
    const items = UPLOAD_ITEMS.map(item => {
      const upload = data.uploads[item.key] || {}
      const files = upload.files || []
      const ocrStatus = upload.ocrStatus || 'none'
      let statusText = files.length > 0 ? `已传 ${files.length} 张` : '待上传'
      if (item.ocr && ocrStatus === 'success') statusText = '已识别'
      if (item.ocr && ocrStatus === 'processing') statusText = '识别中…'
      if (item.ocr && ocrStatus === 'failed') statusText = '识别失败'
      return {
        ...item,
        count: files.length,
        files,
        serverFiles: upload.serverFiles || [],
        status: files.length > 0 ? 'done' : 'pending',
        statusText,
        ocrStatus,
        ocrPreview: upload.ocrPreview || this.buildOcrPreview(upload.ocrResult, item.key)
      }
    })
    const requiredItems = items.filter(i => i.required)
    const requiredDone = requiredItems.filter(i => i.count > 0).length
    const uploadPercent = requiredItems.length ? Math.round((requiredDone / requiredItems.length) * 100) : 0

    const frontUpload = data.uploads.idCardFront || {}
    const personalFields = frontUpload.ocrResult?.personalFields || {}
    const canFillPersonal = !!(personalFields.realName || personalFields.idCard)

    const ocrSummary = items
      .filter(i => i.ocr && i.count > 0)
      .map(i => ({
        key: i.key,
        name: i.name,
        status: i.ocrStatus,
        statusText: OCR_STATUS_TEXT[i.ocrStatus] || '待识别',
        preview: i.ocrPreview
      }))

    this.setData({
      items,
      requiredDone,
      requiredTotal: requiredItems.length,
      uploadPercent,
      cloudSynced: !!meta.lastSyncedAt,
      ocrSummary,
      canFillPersonal,
      pendingPersonalFields: personalFields
    })
  },

  setItemOcrStatus(key, patch) {
    store.saveUploadMeta(key, patch)
    this.refreshList()
  },

  handleUpload(e) {
    const key = e.currentTarget.dataset.key
    const item = UPLOAD_ITEMS.find(i => i.key === key)
    const data = store.getData()
    const existing = (data.uploads[key] || {}).files || []
    wx.chooseMedia({
      count: 9 - existing.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newFiles = (res.tempFiles || []).map(f => f.tempFilePath)
        const files = existing.concat(newFiles).slice(0, 9)
        store.saveUpload(key, files)
        this.setItemOcrStatus(key, { ocrStatus: item.ocr ? 'none' : undefined, ocrPreview: '', ocrResult: null })
        wx.showToast({ title: `已选 ${newFiles.length} 张`, icon: 'success' })
        this.uploadToServer(key, newFiles, item)
      }
    })
  },

  uploadToServer(docKey, filePaths, item) {
    const data = store.getData()
    const applicationNo = data.meta.applicationNo
    this.setData({ syncing: true })

    const uploadPromise = filePaths.length
      ? Promise.all(filePaths.map(filePath => uploadIntakeFile({ applicationNo, docKey, filePath })))
      : Promise.resolve([])

    uploadPromise
      .then(results => {
        if (results.length) {
          const current = store.getData()
          const serverFiles = (current.uploads[docKey]?.serverFiles || []).concat(results.filter(r => r && (r.fileUrl || r.local)))
          store.saveUploadMeta(docKey, { serverFiles })
        }
        return syncToServer().catch(() => null)
      })
      .then(() => {
        if (item.ocr && ID_CARD_KEYS.includes(docKey)) {
          return this.runOcrForKey(docKey, { silent: false, auto: true })
        }
      })
      .catch(() => {
        wx.showToast({ title: '云端同步失败，已保留本地', icon: 'none' })
      })
      .finally(() => {
        this.setData({ syncing: false })
        this.refreshList()
      })
  },

  runOcrForKey(docKey, options = {}) {
    const { silent = false, auto = false } = options
    const data = store.getData()
    const applicationNo = data.meta.applicationNo
    const side = docKey === 'idCardBack' ? 'back' : 'front'
    const serverFile = (data.uploads[docKey]?.serverFiles || []).slice(-1)[0]

    this.setItemOcrStatus(docKey, { ocrStatus: 'processing' })
    if (!silent) wx.showLoading({ title: '阿里云 OCR 识别中…', mask: true })

    return runIdCardOcr({
      applicationNo,
      docKey,
      documentId: serverFile?.id,
      side
    })
      .then(result => {
        const preview = this.buildOcrPreview(result, docKey)
        const personalFields = result.personalFields || {}
        this.setItemOcrStatus(docKey, {
          ocrStatus: 'success',
          ocrPreview: preview,
          ocrResult: result
        })

        if (!silent) {
          wx.showToast({ title: '识别成功', icon: 'success' })
        }

        if (side === 'front' && (personalFields.realName || personalFields.idCard)) {
          this.setData({ pendingPersonalFields: personalFields, canFillPersonal: true })
          if (auto) {
            this.promptFillPersonal(personalFields)
          }
        }
        return result
      })
      .catch(() => {
        this.setItemOcrStatus(docKey, { ocrStatus: 'failed', ocrPreview: '', ocrResult: null })
        if (!silent) wx.showToast({ title: '识别失败，请重试', icon: 'none' })
        return null
      })
      .finally(() => {
        if (!silent) wx.hideLoading()
        this.refreshList()
      })
  },

  promptFillPersonal(personalFields) {
    const name = personalFields.realName || ''
    const id = personalFields.idCard || ''
    wx.showModal({
      title: '身份证识别完成',
      content: `识别到：${name} ${id}\n是否自动填入个人信息模块？`,
      confirmText: '填入',
      cancelText: '稍后',
      success: (res) => {
        if (res.confirm) this.applyPersonalFields(personalFields)
      }
    })
  },

  applyPersonalFields(fields) {
    if (!fields || !Object.keys(fields).length) return
    store.saveSection('personal', fields)
    syncToServer().catch(() => null)
    wx.showToast({ title: '已填入个人信息', icon: 'success' })
    this.setData({ canFillPersonal: false })
  },

  fillPersonalFromOcr() {
    const fields = this.data.pendingPersonalFields
    if (fields && Object.keys(fields).length) {
      this.applyPersonalFields(fields)
    }
  },

  handleOcr(e) {
    const key = e.currentTarget.dataset.key
    const item = this.data.items.find(i => i.key === key)
    if (!item || !item.count) {
      return wx.showToast({ title: '请先上传图片', icon: 'none' })
    }
    this.runOcrForKey(key, { silent: false })
  },

  handlePreview(e) {
    wx.previewImage({ current: e.currentTarget.dataset.url, urls: e.currentTarget.dataset.urls })
  },

  handleDelete(e) {
    const key = e.currentTarget.dataset.key
    const index = e.currentTarget.dataset.index
    const data = store.getData()
    const files = [...((data.uploads[key] || {}).files || [])]
    files.splice(index, 1)
    store.saveUpload(key, files)
    if (!files.length) {
      store.saveUploadMeta(key, { ocrStatus: 'none', ocrPreview: '', ocrResult: null, serverFiles: [] })
    }
    syncToServer().finally(() => this.refreshList())
  }
})
