const { getSystemKey } = require('../subpackages/intake/utils/systems/meta')
const { getConfig } = require('../utils/config')
const { post, get } = require('../utils/request')

function getStore() {
  return require('../subpackages/intake/utils/store')
}

const STATUS_TEXT = {
  pending: '待处理',
  processing: '进行中',
  done: '已完成',
  active: '正常',
  locked: '未开启'
}

function useIntakeApi() {
  const { useMockFallback, apiBaseUrl } = getConfig()
  return !useMockFallback && !!apiBaseUrl
}

function getApplication() {
  return Promise.resolve(getStore().getData())
}

function saveApplicationSection(section, data) {
  const store = getStore()
  store.saveSection(section, data)
  return syncToServer().catch(() => null).then(() => store.getData())
}

function syncToServer() {
  if (!useIntakeApi()) return Promise.resolve({ local: true })
  const store = getStore()
  const payload = store.getData()
  return post('/intake/sync', payload, { showError: false }).then(res => {
    if (res && res.serverId) {
      const data = store.getData()
      data.meta.serverId = res.serverId
      data.meta.lastSyncedAt = new Date().toISOString()
      store.saveData(data)
    }
    return res
  })
}

function pullFromServer(applicationNo, options = {}) {
  const store = getStore()
  if (!useIntakeApi()) return Promise.resolve(store.getData())
  const targetNo = applicationNo || store.getData().meta.applicationNo
  if (!targetNo) return Promise.resolve(store.getData())
  return get(`/intake/${targetNo}`, {}, { showError: false })
    .then(remote => {
      if (options.force) return store.activateIntakeFromRemote(remote)
      return store.mergeFromRemote(remote, { force: false, applicationNo: targetNo })
    })
    .catch(() => store.getData())
}

function loadIntakeAsActive(applicationNo) {
  if (!applicationNo) return Promise.reject(new Error('缺少进件编号'))
  if (!useIntakeApi()) {
    return Promise.resolve(getStore().getData())
  }
  return pullFromServer(applicationNo, { force: true })
}

function initIntakeFromDemand(demand = {}) {
  const data = getStore().applyDemandPreset(demand)
  if (!useIntakeApi()) return Promise.resolve(data)
  return syncToServer().then(() => data).catch(() => data)
}

function prepareWorkflowData() {
  const store = getStore()
  if (useIntakeApi()) return pullFromServer()
  const data = store.advanceWorkflow(store.getData())
  store.saveData(data)
  return Promise.resolve(data)
}

function submitApplication() {
  return getStore().submitForAudit().then(data => {
    if (!useIntakeApi()) return data
    const applicationNo = data.meta.applicationNo
    return syncToServer()
      .then(() => post(`/intake/${applicationNo}/submit`, data, { showError: false }))
      .then(() => data)
      .catch(() => data)
  })
}

function getSubmissionSummary() {
  const data = getStore().getData()
  const basic = data.basic || {}
  const personal = data.personal || {}
  const vehicle = data.vehicle || {}
  const finance = data.finance || {}
  const uploads = data.uploads || {}
  const requiredKeys = ['idCardFront', 'idCardBack', 'bankFlow', 'incomeProof', 'creditAuth']
  const uploadedCount = requiredKeys.filter(k => (uploads[k] || {}).count > 0).length
  const systemKey = getSystemKey(data.meta.productType)
  const showVehicle = systemKey === 'autoFinance' || systemKey === 'warranty' || systemKey === 'property'

  const rows = [
    { label: '征信授权', value: (data.credit?.authSigned === '是') ? '已签署' : '未签署', done: data.credit?.authSigned === '是' },
    { label: '申请人', value: personal.realName || '未填写', done: !!personal.realName },
    { label: '申请城市', value: basic.applyCity || '-', done: !!basic.applyCity },
    { label: '资金用途', value: basic.loanPurpose || '-', done: !!basic.loanPurpose },
    { label: '期望额度', value: basic.expectedAmount || '-', done: !!basic.expectedAmount }
  ]
  if (showVehicle) {
    rows.push({
      label: systemKey === 'property' ? '抵押物信息' : '车辆信息',
      value: vehicle.brand ? `${vehicle.brand} ${vehicle.model}` : '未填写',
      done: !!vehicle.brand
    })
  }
  rows.push(
    { label: '贷款金额', value: finance.loanAmount || '未填写', done: !!finance.loanAmount },
    { label: '必传资料', value: `${uploadedCount}/${requiredKeys.length} 项`, done: uploadedCount === requiredKeys.length },
    { label: '整体进度', value: `${data.meta.progress || 0}%`, done: (data.meta.progress || 0) >= 55 },
    { label: '云端同步', value: data.meta.lastSyncedAt ? '已同步' : '仅本地', done: !!data.meta.lastSyncedAt }
  )
  return Promise.resolve(rows)
}

function buildTimeline(data, section) {
  const wf = data.workflow
  const statusText = s => STATUS_TEXT[s] || '待处理'
  const timelines = {
    audit: [
      { step: '材料接收', status: 'done', statusText: '已完成', time: data.meta.submittedAt ? new Date(data.meta.submittedAt).toLocaleString() : (data.meta.createdAt ? new Date(data.meta.createdAt).toLocaleString() : '-'), desc: '系统已接收进件申请，生成唯一进件编号' },
      { step: '合规初审', status: wf.audit.status === 'pending' ? 'pending' : wf.audit.status === 'processing' ? 'processing' : 'done', statusText: statusText(wf.audit.status === 'pending' ? 'pending' : wf.audit.status), time: wf.audit.time || '-', desc: '核验身份真实性、资金用途合规性、材料完整性' },
      { step: '征信查询', status: wf.audit.status === 'done' ? 'done' : wf.audit.status === 'processing' ? 'processing' : 'pending', statusText: statusText(wf.audit.status === 'done' ? 'done' : wf.audit.status === 'processing' ? 'processing' : 'pending'), time: '-', desc: '在授权范围内查询征信报告，评估信用状况' },
      { step: '机构匹配', status: wf.audit.status === 'done' ? 'done' : 'pending', statusText: statusText(wf.audit.status === 'done' ? 'done' : 'pending'), time: '-', desc: '根据客户资质匹配合作持牌金融机构最优方案' },
      { step: '审批结果', status: wf.audit.status === 'done' ? 'done' : 'pending', statusText: statusText(wf.audit.status === 'done' ? 'done' : 'pending'), time: wf.audit.status === 'done' ? wf.audit.time : '-', desc: '以机构最终审核结果为准，平台同步通知' }
    ],
    disburse: [
      { step: '审批通过', status: wf.audit.status === 'done' ? 'done' : 'locked', statusText: statusText(wf.audit.status === 'done' ? 'done' : 'locked'), time: wf.audit.time || '-', desc: '机构审批通过，进入签约放款流程' },
      { step: '合同签署', status: wf.disburse.status === 'processing' || wf.disburse.status === 'done' ? 'processing' : 'pending', statusText: statusText(wf.disburse.status === 'done' ? 'done' : wf.disburse.status === 'processing' ? 'processing' : 'pending'), time: '-', desc: '确认合同条款、综合年化成本、还款计划' },
      { step: '抵押登记', status: wf.disburse.status === 'done' ? 'done' : 'pending', statusText: statusText(wf.disburse.status === 'done' ? 'done' : 'pending'), time: '-', desc: '车辆抵押或权证办理（车贷/车抵适用）' },
      { step: '放款审批', status: wf.disburse.status === 'processing' || wf.disburse.status === 'done' ? 'processing' : 'pending', statusText: statusText(wf.disburse.status === 'done' ? 'done' : wf.disburse.status === 'processing' ? 'processing' : 'pending'), time: wf.disburse.time || '-', desc: '机构内部放款审核与资金调拨' },
      { step: '资金到账', status: wf.disburse.status === 'done' ? 'done' : 'pending', statusText: statusText(wf.disburse.status === 'done' ? 'done' : 'pending'), time: wf.disburse.status === 'done' ? wf.disburse.time : '-', desc: '放款至合同约定账户，请注意查收' }
    ],
    archive: [
      { step: '合同归档', status: wf.archive.status === 'done' ? 'done' : wf.archive.status === 'processing' ? 'processing' : 'pending', statusText: statusText(wf.archive.status === 'done' ? 'done' : wf.archive.status === 'processing' ? 'processing' : 'pending'), time: '-', desc: '电子合同与纸质合同双套存档' },
      { step: '材料归档', status: wf.archive.status === 'done' ? 'done' : 'pending', statusText: statusText(wf.archive.status === 'done' ? 'done' : 'pending'), time: '-', desc: '身份证、流水、车辆资料分类归档' },
      { step: '影像存证', status: wf.archive.status === 'done' ? 'done' : 'pending', statusText: statusText(wf.archive.status === 'done' ? 'done' : 'pending'), time: '-', desc: '面签、验车视频区块链存证' },
      { step: '台账更新', status: wf.archive.status === 'done' ? 'done' : 'pending', statusText: statusText(wf.archive.status === 'done' ? 'done' : 'pending'), time: wf.archive.time || '-', desc: '同步OA系统与档案管理系统' }
    ],
    collection: [
      { step: '还款计划', status: wf.collection.status === 'active' || wf.collection.status === 'done' ? 'done' : 'pending', statusText: statusText(wf.collection.status === 'active' ? 'active' : 'pending'), time: wf.collection.time || '-', desc: '生成还款计划表，明确每期还款日与金额' },
      { step: '还款提醒', status: wf.collection.status === 'active' ? 'active' : 'pending', statusText: statusText(wf.collection.status === 'active' ? 'active' : 'pending'), time: '-', desc: '到期前3日短信/微信/站内多渠道提醒' },
      { step: '逾期跟进', status: 'pending', statusText: '待处理', time: '-', desc: '逾期1-30天电话回访，了解原因协商方案' },
      { step: '协商处置', status: 'pending', statusText: '待处理', time: '-', desc: '支持展期、重组、提前结清等合规协商' },
      { step: '合规催收', status: 'pending', statusText: '待处理', time: '-', desc: '严禁暴力催收，全程录音留痕可申诉' }
    ]
  }
  return timelines[section] || []
}

function getWorkflowTimeline(section) {
  return prepareWorkflowData().then(() => buildTimeline(getStore().getData(), section))
}

function exportApplicationPdf() {
  const applicationNo = getStore().getData().meta.applicationNo
  if (!applicationNo) return Promise.reject(new Error('暂无进件编号'))
  if (!useIntakeApi()) return Promise.reject(new Error('请连接服务器后导出 PDF'))
  const { apiBaseUrl } = getConfig()
  return get(`/intake/${applicationNo}/pdf`, {}, { showError: false }).then(res => {
    let url = res.url || res.fullUrl || ''
    if (url && !/^https?:\/\//i.test(url)) {
      const base = (apiBaseUrl || '').replace(/\/api\/v1\/?$/, '')
      url = `${base}${url.startsWith('/') ? url : `/${url}`}`
    }
    return { ...res, url }
  })
}

const INTAKE_STATUS_TEXT = {
  draft: '草稿', auditing: '审核中', approved: '审批通过', disbursed: '已放款', archived: '已归档'
}

function summarizeIntakeRow(row) {
  return {
    id: row.id,
    applicationNo: row.applicationNo || row.application_no,
    productType: row.productType || row.product_type || 'workflow',
    productName: row.productName || row.product_name || '进件申请',
    status: row.status || 'draft',
    statusText: INTAKE_STATUS_TEXT[row.status] || row.status || '草稿',
    progress: row.progress || 0,
    updatedAt: row.updatedAt || row.updated_at,
    submittedAt: row.submittedAt || row.submitted_at,
    isLocal: !!row.isLocal
  }
}

function getMyIntakeList() {
  const store = getStore()
  const local = store.getData()
  const localRow = summarizeIntakeRow({
    applicationNo: local.meta.applicationNo,
    productType: local.meta.productType,
    productName: local.meta.productName,
    status: local.meta.status,
    progress: local.meta.progress,
    updatedAt: local.meta.updatedAt,
    submittedAt: local.meta.submittedAt,
    isLocal: true
  })

  if (!useIntakeApi()) {
    const history = store.getIntakeHistory()
    const list = [localRow]
    history.forEach(no => {
      if (no !== localRow.applicationNo) {
        list.push(summarizeIntakeRow({
          applicationNo: no,
          productName: '历史进件',
          status: 'draft',
          progress: 0,
          isLocal: true
        }))
      }
    })
    return Promise.resolve(list)
  }

  const phone = (local.personal?.mobile || wx.getStorageSync('userPhone') || '').replace(/\D/g, '')
  const nos = store.getIntakeHistory().join(',')
  return get('/intake/list/summary', { phone, nos }, { showError: false })
    .then(rows => {
      const remote = (rows || []).map(summarizeIntakeRow)
      const merged = new Map()
      remote.forEach(r => { if (r.applicationNo) merged.set(r.applicationNo, r) })
      if (localRow.applicationNo) merged.set(localRow.applicationNo, { ...localRow, ...merged.get(localRow.applicationNo), isLocal: true })
      return Array.from(merged.values()).sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
    })
    .catch(() => [localRow])
}

module.exports = {
  getApplication,
  saveApplicationSection,
  submitApplication,
  syncToServer,
  pullFromServer,
  loadIntakeAsActive,
  initIntakeFromDemand,
  prepareWorkflowData,
  getWorkflowTimeline,
  getSubmissionSummary,
  getMyIntakeList,
  exportApplicationPdf,
  useIntakeApi,
  INTAKE_STATUS_TEXT
}
