Page({
  data: {
    loanAmount: 100000,
    loanTerm: 60,
    annualRate: 24,
    paidMonths: 12,
    penaltyRate: 5,
    rebateRate: 11.5,
    progressPercent: 20,
    presets: [
      { name: '12期结清', paidMonths: 12, penaltyRate: 3, rebateRate: 8 },
      { name: '24期结清', paidMonths: 24, penaltyRate: 4, rebateRate: 10 },
      { name: '36期结清', paidMonths: 36, penaltyRate: 5, rebateRate: 11.5 }
    ],
    resultItems: [
      { label: '每月本金', key: 'monthlyPrincipal', prefix: '¥' },
      { label: '每月利息', key: 'monthlyInterest', prefix: '¥' },
      { label: '每月还款', key: 'monthlyPayment', prefix: '¥' },
      { label: '总利息', key: 'totalInterest', prefix: '¥' },
      { label: '已还本金', key: 'repaidPrincipal', prefix: '¥' },
      { label: '已还利息', key: 'repaidInterest', prefix: '¥' },
      { label: '剩余本金', key: 'remainingPrincipal', prefix: '¥' },
      { label: '违约金', key: 'penaltyAmount', prefix: '¥' },
      { label: '返现金额', key: 'rebateAmount', prefix: '¥' }
    ],
    tips: [
      '本计算基于等本等息方式，每月利息按初始贷款金额计算',
      '违约金率、返现率请按实际合同填写',
      '建议结合月供计算器对比按期还款与提前结清成本',
      '如需办理提前还款，请联系合作机构或亮叶专员'
    ],
    results: {
      monthlyPrincipal: '0.00',
      monthlyInterest: '0.00',
      monthlyPayment: '0.00',
      totalInterest: '0.00',
      repaidPrincipal: '0.00',
      repaidInterest: '0.00',
      remainingPrincipal: '0.00',
      penaltyAmount: '0.00',
      rebateAmount: '0.00',
      netCost: '0.00',
      monthlyCost: '0.00',
      effectiveRate: '0.00'
    }
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: '提前还款测算' })
    this.calculateAll()
  },

  calculateAll() {
    this.calculateMonthlyPayment()
    this.calculateTotalPayment()
    this.calculateEarlyRepayment()
    this.calculateActualCost()
    const progressPercent = Math.round((this.data.paidMonths / this.data.loanTerm) * 100)
    this.setData({ progressPercent })
  },

  calculateMonthlyPayment() {
    const amount = this.data.loanAmount
    const terms = this.data.loanTerm
    const rate = this.data.annualRate / 100
    const monthlyPrincipal = amount / terms
    const monthlyInterest = amount * (rate / 12)
    const monthlyPayment = monthlyPrincipal + monthlyInterest
    this.setData({
      'results.monthlyPrincipal': monthlyPrincipal.toFixed(2),
      'results.monthlyInterest': monthlyInterest.toFixed(2),
      'results.monthlyPayment': monthlyPayment.toFixed(2)
    })
  },

  calculateTotalPayment() {
    const interest = Number(this.data.results.monthlyInterest) * this.data.loanTerm
    this.setData({ 'results.totalInterest': interest.toFixed(2) })
  },

  calculateEarlyRepayment() {
    const amount = this.data.loanAmount
    const terms = this.data.loanTerm
    const paid = this.data.paidMonths
    const penaltyRate = this.data.penaltyRate / 100
    const rebateRate = this.data.rebateRate / 100
    const monthlyPrincipal = amount / terms
    const repaidPrincipal = monthlyPrincipal * paid
    const repaidInterest = monthlyPrincipal * paid * (this.data.annualRate / 100 / 12) * paid
    const remainingPrincipal = amount - repaidPrincipal
    const penaltyAmount = remainingPrincipal * penaltyRate
    const rebateAmount = amount * rebateRate
    this.setData({
      'results.repaidPrincipal': repaidPrincipal.toFixed(2),
      'results.repaidInterest': repaidInterest.toFixed(2),
      'results.remainingPrincipal': remainingPrincipal.toFixed(2),
      'results.penaltyAmount': penaltyAmount.toFixed(2),
      'results.rebateAmount': rebateAmount.toFixed(2)
    })
  },

  calculateActualCost() {
    const rebateAmount = Number(this.data.results.rebateAmount)
    const repaidPrincipal = Number(this.data.results.repaidPrincipal)
    const repaidInterest = Number(this.data.results.repaidInterest)
    const remainingPrincipal = Number(this.data.results.remainingPrincipal)
    const penaltyAmount = Number(this.data.results.penaltyAmount)
    const netCost = (repaidPrincipal + repaidInterest + remainingPrincipal + penaltyAmount) - rebateAmount
    const monthlyCost = netCost / this.data.paidMonths
    const effectiveRate = (netCost / this.data.loanAmount) * (12 / this.data.paidMonths) * 100
    this.setData({
      'results.netCost': netCost.toFixed(2),
      'results.monthlyCost': monthlyCost.toFixed(2),
      'results.effectiveRate': effectiveRate.toFixed(2)
    })
  },

  handleInputChange(e) {
    const { field } = e.currentTarget.dataset
    const val = Number(e.detail.value) || 0
    this.setData({ [field]: val }, () => this.calculateAll())
  },

  handleSliderChange(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [field]: e.detail.value }, () => this.calculateAll())
  },

  applyPreset(e) {
    const preset = e.currentTarget.dataset.preset
    if (!preset) return
    this.setData({
      paidMonths: Math.min(preset.paidMonths, this.data.loanTerm - 1),
      penaltyRate: preset.penaltyRate,
      rebateRate: preset.rebateRate
    }, () => this.calculateAll())
  },

  goFinanceList() {
    wx.navigateTo({ url: '/subpackages/autoFinance/pages/list/list' })
  },

  goIntake() {
    const { goIntake } = require('../../../../utils/intakeNav')
    goIntake({ productType: 'newCar', productName: '提前还款咨询' })
  }
})
