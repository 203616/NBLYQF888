const STORAGE_KEY = 'intake_application_v2'

const DEFAULT_DATA = {
  meta: {
    applicationNo: '',
    productType: 'newCar',
    productName: '新能源车购车咨询',
    status: 'draft',
    progress: 0,
    createdAt: '',
    updatedAt: '',
    submittedAt: '',
    serverId: null,
    lastSyncedAt: '',
    demandId: null,
    demandTitle: ''
  },
  credit: {
    realName: '',
    mobile: '',
    idCardFront: '',
    idCardBack: '',
    bigDataAuth: false,
    creditAuth: false,
    authSigned: ''
  },
  basic: {
    applyCity: '宁波市',
    applyChannel: '亮叶企服小程序',
    loanPurpose: '购车消费',
    expectedAmount: '20万',
    expectedTerm: '36期',
    urgency: '半月内',
    remark: ''
  },
  personal: {
    realName: '',
    idCard: '',
    gender: '男',
    birthDate: '',
    mobile: '',
    email: '',
    maritalStatus: '未婚',
    education: '本科',
    householdType: '城镇户口',
    address: '',
    residenceYears: ''
  },
  vehicle: {
    vehicleType: '新能源乘用车',
    brand: '',
    model: '',
    color: '',
    vin: '',
    engineNo: '',
    plateNo: '',
    purchasePrice: '',
    mileage: '',
    year: '',
    isNewCar: true,
    dealerName: '',
    invoiceAmount: '',
    insuranceExpiry: ''
  },
  finance: {
    downPayment: '',
    loanAmount: '',
    loanTerm: '36',
    repaymentMethod: '等额本息',
    rateType: '机构审核定价',
    monthlyPayment: '',
    insuranceRequired: true,
    gpsRequired: false,
    subsidyAmount: ''
  },
  work: {
    employmentType: '受雇全职',
    companyName: '',
    industry: '',
    position: '',
    workYears: '',
    companyScale: '',
    companyAddress: '',
    companyPhone: '',
    businessLicense: ''
  },
  income: {
    monthlyIncome: '',
    otherIncome: '',
    familyMonthlyExpense: '',
    existingLoans: '',
    creditCardLimit: '',
    bankFlowMonths: '6',
    mainBank: '',
    taxAnnual: '',
    providentFund: '',
    incomeProofType: '工资流水'
  },
  contacts: {
    emergencyName: '',
    emergencyRelation: '配偶',
    emergencyPhone: '',
    emergencyIdCard: '',
    emergencyAddress: '',
    coBorrowerName: '',
    coBorrowerPhone: '',
    coBorrowerRelation: ''
  },
  uploads: {
    idCardFront: { status: 'pending', count: 0, files: [] },
    idCardBack: { status: 'pending', count: 0, files: [] },
    bankFlow: { status: 'pending', count: 0, files: [] },
    incomeProof: { status: 'pending', count: 0, files: [] },
    vehicleInvoice: { status: 'pending', count: 0, files: [] },
    drivingLicense: { status: 'pending', count: 0, files: [] },
    creditAuth: { status: 'pending', count: 0, files: [] },
    other: { status: 'pending', count: 0, files: [] }
  },
  workflow: {
    audit: { status: 'pending', operator: '', time: '', remark: '等待提交完整材料后进入初审' },
    disburse: { status: 'locked', operator: '', time: '', remark: '审批通过后安排放款' },
    archive: { status: 'locked', operator: '', time: '', remark: '放款完成后自动归档' },
    collection: { status: 'locked', operator: '', time: '', remark: '正常还款无需催收介入' }
  }
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function createApplicationNo() {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `LY${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${String(Date.now()).slice(-6)}`
}

function migrateUploads(uploads) {
  if (!uploads) return clone(DEFAULT_DATA.uploads)
  const result = {}
  Object.keys(DEFAULT_DATA.uploads).forEach(key => {
    const item = uploads[key] || {}
    result[key] = {
      status: item.status || 'pending',
      count: item.count || (item.files ? item.files.length : 0),
      files: item.files || []
    }
  })
  return result
}

function getData() {
  const stored = wx.getStorageSync(STORAGE_KEY)
  if (stored && stored.meta) {
    stored.uploads = migrateUploads(stored.uploads)
    if (!stored.credit) stored.credit = clone(DEFAULT_DATA.credit)
    return stored
  }
  const legacy = wx.getStorageSync('intake_application_v1')
  if (legacy && legacy.meta) {
    legacy.uploads = migrateUploads(legacy.uploads)
    wx.setStorageSync(STORAGE_KEY, legacy)
    return legacy
  }
  const data = clone(DEFAULT_DATA)
  data.meta.applicationNo = createApplicationNo()
  data.meta.createdAt = new Date().toISOString()
  wx.setStorageSync(STORAGE_KEY, data)
  return data
}

function saveData(data) {
  data.meta.updatedAt = new Date().toISOString()
  data.meta.progress = calcProgress(data)
  wx.setStorageSync(STORAGE_KEY, data)
  if (data.meta.applicationNo) trackIntakeHistory(data.meta.applicationNo)
  return data
}

function trackIntakeHistory(applicationNo) {
  const history = wx.getStorageSync('intake_history') || []
  if (!history.includes(applicationNo)) {
    history.unshift(applicationNo)
    wx.setStorageSync('intake_history', history.slice(0, 30))
  }
}

function getIntakeHistory() {
  return wx.getStorageSync('intake_history') || []
}

function saveSection(section, values) {
  const data = getData()
  data[section] = { ...data[section], ...values }
  return saveData(data)
}

function saveUpload(key, files) {
  const data = getData()
  const prev = data.uploads[key] || {}
  data.uploads[key] = {
    ...prev,
    status: files.length > 0 ? 'done' : 'pending',
    count: files.length,
    files,
    updatedAt: new Date().toISOString()
  }
  return saveData(data)
}

function saveUploadMeta(key, patch) {
  const data = getData()
  data.uploads[key] = { ...(data.uploads[key] || {}), ...patch }
  return saveData(data)
}

function calcProgress(data) {
  const productType = data.meta.productType || 'workflow'
  const skipVehicle = productType === 'business' || productType === 'warranty'
  const weights = {
    credit: 8, basic: 8, personal: 12, vehicle: skipVehicle ? 0 : 12, finance: 10,
    work: 10, income: 10, contacts: 8, uploads: 18,
    audit: 6, disburse: 4, archive: 5, collection: 5
  }
  let score = 0
  const filled = (obj, keys) => keys.every(k => obj[k] && String(obj[k]).trim())

  const credit = data.credit || {}
  if (filled(credit, ['realName', 'mobile', 'idCardFront', 'idCardBack'])
    && credit.bigDataAuth && credit.creditAuth && credit.authSigned === '是') {
    score += weights.credit
  }
  if (filled(data.basic, ['applyCity', 'loanPurpose', 'expectedAmount'])) score += weights.basic
  if (filled(data.personal, ['realName', 'mobile', 'idCard', 'address'])) score += weights.personal
  if (!skipVehicle && filled(data.vehicle, ['brand', 'model', 'purchasePrice'])) score += weights.vehicle
  if (filled(data.finance, ['loanAmount', 'loanTerm', 'downPayment'])) score += weights.finance
  if (filled(data.work, ['companyName', 'position', 'workYears'])) score += weights.work
  if (filled(data.income, ['monthlyIncome', 'bankFlowMonths'])) score += weights.income
  if (filled(data.contacts, ['emergencyName', 'emergencyPhone'])) score += weights.contacts

  const requiredUploads = ['idCardFront', 'idCardBack', 'bankFlow', 'incomeProof', 'creditAuth']
  const uploadedRequired = requiredUploads.filter(k => (data.uploads[k] || {}).count > 0).length
  score += Math.round((uploadedRequired / requiredUploads.length) * weights.uploads)

  if (data.workflow.audit.status === 'done' || data.workflow.audit.status === 'processing') score += weights.audit
  if (data.workflow.disburse.status === 'done' || data.workflow.disburse.status === 'processing') score += weights.disburse
  if (data.workflow.archive.status === 'done') score += weights.archive
  if (data.workflow.collection.status === 'active' || data.workflow.collection.status === 'done') score += weights.collection

  return Math.min(score, 100)
}

function initWithProduct(options = {}) {
  const data = getData()
  data.meta.productType = options.productType || data.meta.productType
  data.meta.productName = options.productName || data.meta.productName
  if (options.productId) data.meta.productId = options.productId
  return saveData(data)
}

function advanceWorkflow(data) {
  const now = new Date().toLocaleString()
  const wf = data.workflow
  if (data.meta.status === 'auditing' && wf.audit.status === 'processing') {
    const submitted = data.meta.submittedAt ? new Date(data.meta.submittedAt).getTime() : Date.now()
    const elapsed = Date.now() - submitted
    if (elapsed > 5000) {
      wf.audit = { status: 'done', operator: '亮叶合规专员', time: now, remark: '初审通过，已匹配合作持牌金融机构' }
      wf.disburse = { status: 'processing', operator: '机构客户经理', time: now, remark: '正在准备签约材料与抵押登记（如适用）' }
      data.meta.status = 'approved'
    }
  }
  if (wf.disburse.status === 'processing' && data.meta.submittedAt) {
    const elapsed = Date.now() - new Date(data.meta.submittedAt).getTime()
    if (elapsed > 15000) {
      wf.disburse = { status: 'done', operator: '放款专员', time: now, remark: '放款已到账，请查收合同约定账户' }
      wf.archive = { status: 'processing', operator: '档案管理员', time: now, remark: '合同与材料归档中' }
      wf.collection = { status: 'active', operator: '还款提醒系统', time: now, remark: '还款计划已生成，到期前将短信提醒' }
      data.meta.status = 'disbursed'
    }
  }
  if (wf.archive.status === 'processing' && data.meta.submittedAt) {
    const elapsed = Date.now() - new Date(data.meta.submittedAt).getTime()
    if (elapsed > 25000) {
      wf.archive = { status: 'done', operator: '档案管理员', time: now, remark: '电子合同与影像材料已归档存证' }
      data.meta.status = 'archived'
    }
  }
  return data
}

function mergeFromRemote(remote, options = {}) {
  if (!remote || !remote.payload) return getData()
  const local = getData()
  const remoteTime = remote.updated_at ? new Date(remote.updated_at).getTime() : 0
  const localTime = local.meta.lastSyncedAt ? new Date(local.meta.lastSyncedAt).getTime() : 0
  const switching = options.force || (options.applicationNo && options.applicationNo !== local.meta.applicationNo)
  if (!switching && remoteTime > 0 && remoteTime < localTime && local.meta.status !== 'draft') {
    return local
  }
  const merged = clone(remote.payload)
  merged.uploads = migrateUploads(merged.uploads)
  merged.meta = {
    ...merged.meta,
    applicationNo: remote.application_no || merged.meta.applicationNo,
    serverId: remote.id || merged.meta.serverId,
    lastSyncedAt: remote.updated_at || new Date().toISOString(),
    status: remote.status || merged.meta.status,
    progress: remote.progress ?? merged.meta.progress
  }
  if (remote.workflow && Object.keys(remote.workflow).length) {
    merged.workflow = { ...merged.workflow, ...remote.workflow }
  }
  return saveData(merged)
}

function activateIntakeFromRemote(remote) {
  return mergeFromRemote(remote, { force: true, applicationNo: remote?.application_no })
}

function applyDemandPreset(demand = {}) {
  const data = getData()
  const phone = String(demand.contact || '').replace(/\D/g, '').slice(-11)
  data.meta.demandId = demand.id || data.meta.demandId
  data.meta.demandTitle = demand.title || data.meta.demandTitle
  data.meta.productType = data.meta.productType || 'business'
  data.meta.productName = data.meta.productName || `易融圈-${demand.title || '经营贷进件'}`
  data.basic = {
    ...data.basic,
    applyCity: demand.city || data.basic.applyCity,
    loanPurpose: demand.purpose || data.basic.loanPurpose,
    expectedAmount: demand.amount || data.basic.expectedAmount,
    expectedTerm: demand.period || data.basic.expectedTerm,
    remark: demand.remark ? `关联需求#${demand.id}：${demand.remark}` : data.basic.remark
  }
  if (phone.length >= 11) {
    data.personal = { ...data.personal, mobile: phone }
    wx.setStorageSync('userPhone', phone)
  }
  data.finance = {
    ...data.finance,
    loanAmount: demand.amount || data.finance.loanAmount
  }
  return saveData(data)
}

function submitForAudit() {
  const data = getData()
  if (data.meta.progress < 55) {
    return Promise.reject({ message: '请先完善基本信息、个人信息、收入信息及必传资料（进度需达55%）' })
  }
  const requiredUploads = ['idCardFront', 'idCardBack', 'bankFlow', 'creditAuth']
  const missing = requiredUploads.filter(k => !(data.uploads[k] || {}).count)
  if (missing.length) {
    return Promise.reject({ message: '请先上传身份证正反面、银行流水和征信授权书' })
  }
  const now = new Date().toLocaleString()
  data.workflow.audit = {
    status: 'processing',
    operator: '亮叶审核专员',
    time: now,
    remark: '材料已提交，正在进行合规初审与机构匹配'
  }
  data.meta.status = 'auditing'
  data.meta.submittedAt = new Date().toISOString()
  saveData(data)
  return Promise.resolve(data)
}

module.exports = {
  getData,
  saveData,
  saveSection,
  saveUpload,
  saveUploadMeta,
  calcProgress,
  initWithProduct,
  submitForAudit,
  advanceWorkflow,
  mergeFromRemote,
  activateIntakeFromRemote,
  applyDemandPreset,
  getIntakeHistory,
  trackIntakeHistory,
  DEFAULT_DATA
}
