Page({
  data: {
    stats: [
      { label: '抵押率', value: '最高80%' },
      { label: '额度范围', value: '5-50万' },
      { label: '审批时效', value: '当日' },
      { label: '押车要求', value: '可选' }
    ],
    loanAmount: 200000,
    loanTerm: 24,
    monthlyPayment: '0.00',
    productDetail: {
      title: '车辆抵押周转咨询',
      amountRange: '50,000 - 500,000元',
      term: '6-36期',
      rate: '以机构审核定价为准',
      tags: ['不押车可选', '当日审批', '随借随还'],
      complianceNote: '本平台仅提供信息咨询与撮合服务，具体审批、额度、利率以持牌机构审核结果为准。',
      features: [
        '车辆抵押率最高80%',
        '不押车，正常使用',
        '最快当日审批放款',
        '随借随还，按日计息'
      ],
      materials: [
        '机动车登记证书',
        '行驶证、身份证',
        '车辆保险单',
        '近3个月银行流水'
      ],
      process: [
        '在线提交车辆信息',
        '评估师上门验车',
        '签约办理抵押登记',
        '资金到账'
      ]
    }
  },

  onLoad() {
    this.updateMonthlyPayment()
  },

  updateMonthlyPayment() {
    const { loanAmount, loanTerm } = this.data
    const rate = 0.065 / 12
    const monthlyPrincipal = loanAmount / loanTerm
    const monthlyInterest = loanAmount * rate
    this.setData({
      monthlyPayment: (monthlyPrincipal + monthlyInterest).toFixed(2)
    })
  },

  handleAmountChange(e) {
    this.setData({ loanAmount: e.detail.value }, () => this.updateMonthlyPayment())
  },

  handleTermChange(e) {
    this.setData({ loanTerm: e.detail.value }, () => this.updateMonthlyPayment())
  },

  navigateToPrepayment() {
    wx.navigateTo({ url: '/subpackages/autoFinance/pages/prepayment/prepayment' })
  },

  navigateToFinanceList() {
    wx.navigateTo({ url: '/subpackages/autoFinance/pages/list/list' })
  },

  handleApply() {
    const { goIntake } = require('../../../../utils/intakeNav')
    goIntake({ productType: 'mortgage', productName: '车辆抵押咨询' })
  },

  contactService() {
    wx.makePhoneCall({ phoneNumber: '4008887777' })
  }
})
