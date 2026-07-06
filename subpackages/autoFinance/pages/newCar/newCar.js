Page({
  data: {
    stats: [
      { label: '额度范围', value: '5-50万' },
      { label: '最长期限', value: '60期' },
      { label: '预审反馈', value: '30分钟' },
      { label: '前置费用', value: '0元' }
    ],
    loanAmount: 200000,
    loanTerm: 60,
    monthlyPayment: '0.00',
    productDetail: {
      title: '新能源车购车咨询方案',
      bank: '合作持牌金融机构',
      rate: '以机构审核定价为准',
      tags: ['新能源优先', '零前置费', '多家机构'],
      rateDiscount: '具体利率以正式合同披露为准',
      amountRange: '50,000 - 500,000元',
      term: '12-60期',
      features: [
        '材料清单清晰，专员协助预审',
        '支持多家合作机构方案匹配',
        '综合成本透明，不收取前置费用',
        '提前还款规则以合同约定为准'
      ],
      requirements: [
        '年龄18-65周岁，具有完全民事行为能力',
        '个人征信良好，无重大不良记录',
        '具备稳定收入来源或经营流水',
        '车辆用途合规，材料真实有效',
        '具体准入标准以合作机构审核为准'
      ],
      materials: [
        '身份证原件正反面复印件',
        '近6个月工资流水或经营流水',
        '收入证明或纳税记录',
        '本地居住证明',
        '车辆订购合同或意向书'
      ],
      process: [
        '线上提交基础信息（本平台）',
        '专员预审并匹配方案（30分钟内反馈）',
        '补充完整申请材料',
        '合作机构审批签约',
        '按合同约定放款或交付'
      ],
      partnerBrands: [
        '比亚迪', '丰田', '本田', '吉利',
        '大众', '长安', '哈弗', '特斯拉'
      ],
      complianceNote: '本平台仅提供金融信息咨询与居间撮合服务，不发放贷款。具体审批、额度、利率、费用以持牌机构审核结果和正式合同为准。'
    }
  },

  onLoad() {
    this.updateMonthlyPayment()
  },

  updateMonthlyPayment() {
    const { loanAmount, loanTerm } = this.data
    const rate = 0.045 / 12
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
    goIntake({ productType: 'newCar', productName: '新能源车购车咨询' })
  },

  contactService() {
    wx.navigateTo({ url: '/subpackages/service/pages/chat/chat' })
  }
})
