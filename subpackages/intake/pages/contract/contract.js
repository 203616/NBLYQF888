const store = require('../../utils/store')
const { getSystemMeta } = require('../../utils/modules')
const { pullFromServer, prepareWorkflowData, useIntakeApi } = require('../../../../api/intake')

function buildRepaymentPlan(loanAmount, loanTerm, monthlyPayment) {
  const amount = parseFloat(String(loanAmount).replace(/[^\d.]/g, '')) || 200000
  const term = parseInt(loanTerm, 10) || 36
  const monthly = monthlyPayment || (amount / term * 1.05).toFixed(0)
  const plan = []
  const start = new Date()
  for (let i = 1; i <= Math.min(term, 6); i++) {
    const d = new Date(start)
    d.setMonth(d.getMonth() + i)
    plan.push({
      term: i,
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-15`,
      amount: `¥${Number(monthly).toLocaleString()}`
    })
  }
  if (term > 6) {
    plan.push({ term: '...', date: `共${term}期`, amount: '见正式合同' })
  }
  return plan
}

Page({
  data: {
    meta: {},
    systemMeta: {},
    contract: null,
    partyList: [],
    highlights: [],
    repaymentPlan: [],
    viewOnly: true
  },

  onLoad() {
    this.loadContract()
  },

  onShow() {
    const chain = useIntakeApi() ? pullFromServer() : prepareWorkflowData()
    chain.then(() => this.loadContract()).catch(() => this.loadContract())
  },

  loadContract() {
    const data = store.getData()
    const systemMeta = getSystemMeta(data.meta.productType)
    wx.setNavigationBarTitle({ title: '合同查看' })
    const finance = data.finance || {}
    const personal = data.personal || {}
    const vehicle = data.vehicle || {}
    const statusKey = data.workflow?.disburse?.status === 'done' ? 'signed' : data.workflow?.audit?.status === 'done' ? 'pending_sign' : 'auditing'
    const statusText = { signed: '已签署', pending_sign: '待签署', auditing: '审核中' }[statusKey]
    const contract = {
      contractNo: `HT-${data.meta.applicationNo || 'DRAFT'}`,
      status: statusText,
      statusKey,
      signDate: data.workflow?.disburse?.time || '-',
      parties: {
        borrower: personal.realName || '待填写',
        idCard: personal.idCard ? personal.idCard.replace(/^(.{6}).+(.{4})$/, '$1********$2') : '-',
        lender: '合作持牌金融机构（以实际审批为准）'
      },
      terms: [
        { label: '融资产品', value: data.meta.productName || systemMeta.title },
        { label: '贷款/融资额', value: finance.loanAmount || data.basic?.expectedAmount || '-' },
        { label: '贷款期限', value: finance.loanTerm ? `${finance.loanTerm}期` : data.basic?.expectedTerm || '-' },
        { label: '还款方式', value: finance.repaymentMethod || '等额本息' },
        { label: '车辆信息', value: vehicle.brand ? `${vehicle.brand} ${vehicle.model}` : '不适用' },
        { label: '利率说明', value: '以机构审核定价为准，综合年化成本以合同披露为准' }
      ],
      clauses: [
        '本合同为融资服务示意文本，最终以合作持牌金融机构出具的正式合同为准。',
        '借款人应按时足额还款，逾期将按合同约定承担违约责任。',
        '车辆抵押类业务需配合办理抵押登记手续（如适用）。',
        '提前还款规则、违约金等以正式合同条款为准。',
        '平台仅提供信息撮合与材料管理服务，不替代金融机构审批职能。'
      ]
    }
    const partyList = [
      { label: '借款人', value: contract.parties.borrower },
      { label: '证件号', value: contract.parties.idCard },
      { label: '贷款人', value: contract.parties.lender }
    ]
    const highlights = [
      { label: '合同状态', value: statusText },
      { label: '融资额度', value: finance.loanAmount || data.basic?.expectedAmount || '-' },
      { label: '期限', value: finance.loanTerm ? `${finance.loanTerm}期` : '-' },
      { label: '还款方式', value: finance.repaymentMethod || '等额本息' }
    ]
    const repaymentPlan = buildRepaymentPlan(finance.loanAmount, finance.loanTerm, finance.monthlyPayment)
    this.setData({ meta: data.meta, systemMeta, contract, partyList, highlights, repaymentPlan, viewOnly: true })
  },

  contactService() {
    wx.navigateTo({ url: '/subpackages/service/pages/chat/chat' })
  },

  goBack() {
    wx.navigateBack()
  }
})
