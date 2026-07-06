Page({
  data: {
    stats: [
      { label: '额度范围', value: '3-30万' },
      { label: '车龄要求', value: '8年内' },
      { label: '预审反馈', value: '2小时' },
      { label: '前置费用', value: '0元' }
    ],
    loanAmount: 150000,
    loanTerm: 36,
    monthlyPayment: '0.00',
    productDetail: {
      title: '二手车按揭咨询方案',
      amountRange: '30,000 - 300,000元',
      term: '12-36期',
      rate: '以机构审核定价为准',
      tags: ['车况评估', '快速预审', '车商通道'],
      complianceNote: '本平台仅提供信息咨询与撮合服务，具体审批、额度、利率以持牌机构审核结果为准。',
      features: [
        '车龄8年内均可申请',
        '最快2小时预审反馈',
        '支持个人及个体工商户',
        '合作二手车商专属通道'
      ],
      materials: [
        '身份证、驾驶证原件',
        '近6个月银行流水',
        '车辆评估报告',
        '二手车交易合同'
      ],
      process: [
        '提交车辆及个人信息',
        '平台预审与车辆评估',
        '签约并办理抵押登记',
        '放款至指定账户'
      ]
    }
  },

  onLoad() {
    this.updateMonthlyPayment()
  },

  updateMonthlyPayment() {
    const { loanAmount, loanTerm } = this.data
    const rate = 0.052 / 12
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
    goIntake({ productType: 'usedCar', productName: '二手车按揭咨询' })
  },

  contactService() {
    wx.makePhoneCall({ phoneNumber: '4008887777' })
  }
})
