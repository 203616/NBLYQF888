const store = require('../../utils/store')
const { SECTION_MAP, rebuildSectionMap } = require('../../utils/modules')
const { getWorkflowTimeline, getSubmissionSummary } = require('../../../../api/intake')

const SECTION_LABELS = {
  audit: '审核进度', disburse: '放款进度', archive: '归档状态', collection: '还款提醒'
}

const STATUS_TEXT = {
  pending: '待处理', processing: '进行中', done: '已完成', active: '正常', locked: '未开启'
}

const META_STATUS_TEXT = {
  draft: '草稿', auditing: '审核中', approved: '审批通过', disbursed: '已放款', archived: '已归档'
}

Page({
  data: {
    section: '',
    module: null,
    workflow: {},
    timeline: [],
    meta: {},
    summary: [],
    viewOnly: true,
    sectionLabel: '',
    workflowStatusText: '待处理',
    stats: []
  },

  onLoad(options) {
    const section = options.section || 'audit'
    const data = store.getData()
    rebuildSectionMap(data.meta.productType)
    const module = SECTION_MAP[section]
    if (!module) return
    wx.setNavigationBarTitle({ title: module.title })
    this.setData({
      section,
      module,
      sectionLabel: SECTION_LABELS[section] || '进度查看',
      viewOnly: module.viewOnly !== false || module.type === 'status-view'
    })
    this.refresh()
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const section = this.data.section
    getWorkflowTimeline(section).then(timeline => {
      getSubmissionSummary().then(summary => {
        const data = store.getData()
        const wf = data.workflow[section] || {}
        const doneCount = timeline.filter(t => t.status === 'done' || t.status === 'active').length
        const summaryDone = summary.filter(s => s.done).length
        this.setData({
          workflow: wf,
          workflowStatusText: STATUS_TEXT[wf.status] || '待处理',
          timeline,
          meta: data.meta,
          summary,
          stats: [
            { label: '节点完成', value: `${doneCount}/${timeline.length}` },
            { label: '材料项', value: `${summaryDone}/${summary.length}` },
            { label: '总进度', value: `${data.meta.progress || 0}%` },
            { label: '进件状态', value: META_STATUS_TEXT[data.meta.status] || '已提交' }
          ]
        })
      })
    })
  },

  contactService() {
    wx.navigateTo({ url: '/subpackages/service/pages/chat/chat' })
  },

  goIntakeHome() {
    const type = this.data.meta.productType || 'newCar'
    const name = encodeURIComponent(this.data.meta.productName || '')
    wx.redirectTo({ url: `/subpackages/intake/pages/index/index?productType=${type}&productName=${name}` })
  }
})
