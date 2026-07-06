const { getDocuments } = require('../../../../api/profile')

const STATUS_KEY = {
  '已归档': 'done',
  '待补充': 'pending',
  '审核中': 'processing',
  '未上传': 'empty'
}

Page({
  data: {
    activeCategory: '',
    expandedId: '',
    filterStatus: 'all',
    docs: [],
    filteredDocs: [],
    summary: [],
    uploadTips: [
      '图片需清晰完整，避免反光和遮挡，建议原图上传。',
      '经营流水建议提供近6个月连续记录，不可缺页。',
      '合同资料请确认签章页、金额页和还款计划页完整。',
      '验证视频建议横屏拍摄，光线充足，时长不超过3分钟。',
      '身份证等证件可通过进件系统 OCR 自动识别填入。'
    ]
  },

  onLoad(options) {
    const activeCategory = options.category || ''
    this.setData({ activeCategory, expandedId: activeCategory })
    this.loadDocs()
  },

  normalizeDocs(docs) {
    return (docs || []).map(doc => ({
      ...doc,
      statusKey: STATUS_KEY[doc.status] || 'pending',
      icon: doc.icon || '📁'
    }))
  },

  updateSummary(docs) {
    const total = docs.length
    const archived = docs.filter(d => d.status === '已归档').length
    const pending = docs.filter(d => d.status === '待补充' || d.status === '未上传').length
    const totalFiles = docs.reduce((s, d) => s + (d.count || 0), 0)
    this.setData({
      summary: [
        { label: '分类', value: String(total) },
        { label: '已归档', value: String(archived) },
        { label: '待补充', value: String(pending) },
        { label: '总文件', value: String(totalFiles) }
      ]
    })
  },

  applyFilter() {
    const { docs, filterStatus } = this.data
    const filtered = filterStatus === 'all' ? docs : docs.filter(d => d.status === filterStatus)
    this.setData({ filteredDocs: filtered })
  },

  loadDocs() {
    getDocuments().then(docs => {
      const normalized = this.normalizeDocs(docs)
      this.setData({ docs: normalized })
      this.updateSummary(normalized)
      this.applyFilter()
    })
  },

  switchStatus(e) {
    this.setData({ filterStatus: e.currentTarget.dataset.status }, () => this.applyFilter())
  },

  toggleExpand(e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      expandedId: this.data.expandedId === id ? '' : id,
      activeCategory: id
    })
  },

  showExample(e) {
    const item = this.data.docs.find(doc => doc.id === e.currentTarget.dataset.id)
    if (!item) return
    const required = (item.required || []).join('\n· ')
    wx.showModal({
      title: `${item.name}示例`,
      content: `${item.desc}\n\n建议材料：\n· ${required || '请按提示准备清晰完整的材料影像'}`,
      showCancel: false
    })
  },

  handleUpload(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.docs.find(doc => doc.id === id)
    if (!item) return

    wx.showActionSheet({
      itemList: ['进入进件系统上传', '拍照上传', '从相册选择', '查看材料示例'],
      success: (res) => {
        if (res.tapIndex === 0) {
          return this.goIntakeUpload()
        }
        if (res.tapIndex === 3) {
          return this.showExample({ currentTarget: { dataset: { id } } })
        }
        const sourceType = res.tapIndex === 1 ? ['camera'] : ['album']
        wx.chooseMedia({
          count: 9,
          mediaType: ['image'],
          sourceType,
          success: (mediaRes) => {
            wx.showToast({
              title: `已选择${mediaRes.tempFiles.length}张`,
              icon: 'success'
            })
          }
        })
      }
    })
  },

  goIntakeUpload() {
    wx.navigateTo({ url: '/subpackages/intake/pages/upload/upload' })
  },

  goIntakeHome() {
    wx.navigateTo({ url: '/subpackages/intake/pages/index/index?productType=workflow' })
  }
})
