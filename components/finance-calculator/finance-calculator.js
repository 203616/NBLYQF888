function formatMoney(value) {
  const num = Number(value)
  if (Number.isNaN(num)) return '0.00'
  return num.toFixed(2)
}

function getRepaymentMethodName(methods, id) {
  const matched = methods.find(item => item.id === id)
  return matched ? matched.name : ''
}

Component({
  properties: {},

  data: {
    productTypes: [
      '车贷', '房贷', '信用贷', '企业经营贷', '农户贷',
      '创业贷', '教育贷', '装修贷', '消费贷', '农业贷'
    ],
    repaymentMethods: [
      { id: 'equal_installment', name: '等本等息' },
      { id: 'equal_payment', name: '等额本息' },
      { id: 'interest_first', name: '先息后本' }
    ],
    productRepaymentMap: {
      '车贷': ['equal_installment', 'equal_payment'],
      '房贷': ['equal_payment', 'interest_first'],
      '信用贷': ['equal_payment', 'interest_first'],
      '企业经营贷': ['equal_payment', 'interest_first'],
      '农户贷': ['equal_payment', 'interest_first'],
      '创业贷': ['equal_payment', 'interest_first'],
      '教育贷': ['equal_payment'],
      '装修贷': ['equal_payment', 'interest_first'],
      '消费贷': ['equal_payment', 'interest_first'],
      '农业贷': ['equal_payment', 'interest_first']
    },
    availableMethods: [],
    form: {
      productType: '车贷',
      repaymentMethod: 'equal_installment',
      loanAmount: 100000,
      loanTerm: 60,
      annualRate: 24,
      penaltyRate: 5,
      rebateRate: 11.5,
      paidMonths: 12,
      isPrepay: true
    },
    results: {},
    displayResults: {},
    repaymentMethodName: '等本等息',
    analysisText: '',
    analysisSuggestion: '',
    schedule: [],
    showSchedule: false,
    showResults: false
  },

  lifetimes: {
    attached() {
      this.syncAvailableMethods()
      this.syncRepaymentMethodName()
    }
  },

  methods: {
    syncAvailableMethods() {
      const product = this.data.form.productType
      const allowed = this.data.productRepaymentMap[product] || ['equal_payment']
      const availableMethods = this.data.repaymentMethods.filter(m => allowed.includes(m.id))
      let method = this.data.form.repaymentMethod
      if (!allowed.includes(method)) {
        method = allowed[0]
        this.setData({ 'form.repaymentMethod': method })
      }
      this.setData({ availableMethods })
    },
    syncRepaymentMethodName() {
      this.setData({
        repaymentMethodName: getRepaymentMethodName(
          this.data.repaymentMethods,
          this.data.form.repaymentMethod
        )
      })
    },

    syncDisplayResults(results = {}) {
      const displayResults = {}
      const moneyFields = [
        'monthlyPayment',
        'monthlyPrincipal',
        'monthlyInterest',
        'totalInterest',
        'repaidPrincipal',
        'repaidInterest',
        'remainingPrincipal',
        'penaltyAmount',
        'rebateAmount',
        'actualCost',
        'monthlyCost',
        'lastPayment'
      ]

      moneyFields.forEach(field => {
        if (results[field] !== undefined && results[field] !== null) {
          displayResults[field] = formatMoney(results[field])
        }
      })

      if (results.effectiveRate !== undefined && results.effectiveRate !== null) {
        displayResults.effectiveRate = String(results.effectiveRate)
      }

      const actualCost = Number(results.actualCost || 0)
      this.setData({
        displayResults,
        analysisText: actualCost > 0 ? '此方案实际支出成本较高' : '此方案为您节省了资金',
        analysisSuggestion: actualCost > 0 ? '考虑其他贷款方案' : '尽快办理此贷款方案'
      })
    },

    handleInputChange(e) {
      const { field } = e.currentTarget.dataset
      const value = e.detail.value
      this.setData({
        [`form.${field}`]: value
      }, () => this.calculate())
    },

    handleRepaymentSelect(e) {
      const method = e.currentTarget.dataset.method
      this.setData({
        'form.repaymentMethod': method
      }, () => {
        this.syncRepaymentMethodName()
        this.calculate()
      })
    },

    handleProductSelect(e) {
      const product = e.currentTarget.dataset.product
      this.setData({
        'form.productType': product
      }, () => {
        this.syncAvailableMethods()
        this.syncRepaymentMethodName()
        this.calculate()
      })
    },

    calculate() {
      const form = this.data.form
      if (form.repaymentMethod === 'equal_installment') {
        this.calculateEqualInstallment()
      } else if (form.repaymentMethod === 'equal_payment') {
        this.calculateEqualPayment()
      } else if (form.repaymentMethod === 'interest_first') {
        this.calculateInterestFirst()
      }
    },

    calculateEqualInstallment() {
      const form = this.data.form
      const loanAmount = parseFloat(form.loanAmount)
      const loanTerm = parseInt(form.loanTerm, 10)
      const paidMonths = parseInt(form.paidMonths, 10)
      const monthlyRate = form.annualRate / 100 / 12

      const monthlyPrincipal = loanAmount / loanTerm
      const monthlyInterest = loanAmount * monthlyRate
      const monthlyPayment = monthlyPrincipal + monthlyInterest
      const totalInterest = monthlyInterest * loanTerm
      const repaidPrincipal = monthlyPrincipal * paidMonths
      const repaidInterest = monthlyInterest * paidMonths
      const remainingPrincipal = loanAmount - repaidPrincipal
      const penaltyRate = form.penaltyRate / 100
      const penaltyAmount = form.isPrepay ? remainingPrincipal * penaltyRate : 0
      const rebateRate = form.productType === '车贷' ? 0 : form.rebateRate / 100
      const rebateAmount = form.productType === '车贷' ? 0 : loanAmount * rebateRate
      const actualCost = (repaidPrincipal + repaidInterest + remainingPrincipal + penaltyAmount) - rebateAmount
      const monthlyCost = paidMonths ? actualCost / paidMonths : 0
      const effectiveRate = paidMonths
        ? ((actualCost - loanAmount) / loanAmount / (paidMonths / 12) * 100)
        : 0

      const results = {
        monthlyPayment,
        monthlyPrincipal,
        monthlyInterest,
        totalInterest,
        repaidPrincipal,
        repaidInterest,
        remainingPrincipal,
        penaltyAmount,
        rebateAmount,
        actualCost,
        monthlyCost,
        effectiveRate: effectiveRate.toFixed(2)
      }

      this.setData({ results, showResults: true }, () => {
        this.syncDisplayResults(results)
      })
    },

    calculateEqualPayment() {
      const form = this.data.form
      const loanAmount = parseFloat(form.loanAmount)
      const loanTerm = parseInt(form.loanTerm, 10)
      const monthlyRate = form.annualRate / 100 / 12
      const schedule = []
      let remaining = loanAmount
      let totalInterest = 0
      const factor = Math.pow(1 + monthlyRate, loanTerm)
      const monthlyPayment = loanAmount * monthlyRate * factor / (factor - 1)

      for (let i = 1; i <= loanTerm; i++) {
        const interest = remaining * monthlyRate
        const principal = monthlyPayment - interest
        remaining = Math.max(0, remaining - principal)
        totalInterest += interest
        schedule.push({ period: i, payment: monthlyPayment, principal, interest, remaining })
      }

      const results = { monthlyPayment, totalInterest, schedule }
      this.setData({ results, schedule, showResults: true }, () => this.syncDisplayResults(results))
    },

    calculateInterestFirst() {
      const form = this.data.form
      const loanAmount = parseFloat(form.loanAmount)
      const loanTerm = parseInt(form.loanTerm, 10)
      const monthlyRate = form.annualRate / 100 / 12
      const schedule = []
      let totalInterest = 0

      for (let i = 1; i <= loanTerm; i++) {
        const interest = loanAmount * monthlyRate
        const principal = i === loanTerm ? loanAmount : 0
        const payment = interest + principal
        totalInterest += interest
        schedule.push({
          period: i,
          payment,
          principal,
          interest,
          remaining: i === loanTerm ? 0 : loanAmount
        })
      }

      const results = {
        monthlyInterest: loanAmount * monthlyRate,
        lastPayment: loanAmount + loanAmount * monthlyRate,
        totalInterest,
        schedule
      }
      this.setData({ results, schedule, showResults: true }, () => this.syncDisplayResults(results))
    },

    exportScheduleImage() {
      if (!this.data.schedule || !this.data.schedule.length) {
        return wx.showToast({ title: '请先计算', icon: 'none' })
      }
      wx.showLoading({ title: '生成图片中' })
      const query = this.createSelectorQuery()
      query.select('#exportCanvas').fields({ node: true, size: true }).exec(res => {
        const canvas = res[0]?.node
        if (!canvas) {
          wx.hideLoading()
          return wx.showToast({ title: 'Canvas初始化失败', icon: 'none' })
        }
        const ctx = canvas.getContext('2d')
        const dpr = wx.getSystemInfoSync().pixelRatio || 2
        const width = 750
        const rowH = 36
        const headerH = 120
        const height = headerH + (this.data.schedule.length + 1) * rowH + 40
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        ctx.fillStyle = '#0F3D2E'
        ctx.font = 'bold 22px sans-serif'
        ctx.fillText(`亮叶企服 · ${this.data.form.productType}还款计划表`, 24, 40)
        ctx.font = '16px sans-serif'
        ctx.fillStyle = '#666'
        ctx.fillText(`${this.data.repaymentMethodName} | 金额${this.data.form.loanAmount}元 | ${this.data.form.loanTerm}期`, 24, 70)
        const cols = ['期次', '月供', '本金', '利息', '剩余']
        const colX = [24, 100, 220, 340, 460]
        ctx.fillStyle = '#0F3D2E'
        ctx.font = 'bold 16px sans-serif'
        cols.forEach((c, i) => ctx.fillText(c, colX[i], headerH))
        ctx.font = '14px sans-serif'
        ctx.fillStyle = '#333'
        this.data.schedule.forEach((row, idx) => {
          const y = headerH + (idx + 1) * rowH
          if (idx % 2 === 0) {
            ctx.fillStyle = '#f7f9fc'
            ctx.fillRect(0, y - 24, width, rowH)
          }
          ctx.fillStyle = '#333'
          ctx.fillText(String(row.period), colX[0], y)
          ctx.fillText(row.payment.toFixed(2), colX[1], y)
          ctx.fillText(row.principal.toFixed(2), colX[2], y)
          ctx.fillText(row.interest.toFixed(2), colX[3], y)
          ctx.fillText((row.remaining || 0).toFixed(2), colX[4], y)
        })
        wx.canvasToTempFilePath({
          canvas,
          success: (fileRes) => {
            wx.hideLoading()
            wx.saveImageToPhotosAlbum({
              filePath: fileRes.tempFilePath,
              success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
              fail: () => wx.previewImage({ urls: [fileRes.tempFilePath] })
            })
          },
          fail: () => {
            wx.hideLoading()
            wx.showToast({ title: '导出失败', icon: 'none' })
          }
        })
      })
    },

    exportSchedulePdf() {
      const { post } = require('../../../utils/request')
      if (!this.data.schedule || !this.data.schedule.length) {
        return wx.showToast({ title: '请先计算', icon: 'none' })
      }
      post('/tools/calculator/export-pdf', {
        schedule: this.data.schedule,
        productType: this.data.form.productType,
        repaymentMethod: this.data.repaymentMethodName
      }, { showError: false })
        .then(res => {
          if (res && res.content) {
            wx.setClipboardData({
              data: res.content,
              success: () => wx.showToast({ title: '还款表已复制', icon: 'success' })
            })
          } else {
            wx.showToast({ title: 'PDF导出任务已创建', icon: 'success' })
          }
        })
        .catch(() => wx.showToast({ title: '请连接服务端导出', icon: 'none' }))
    },

    isAutoProduct() {
      return this.data.form.productType === '车贷'
    },

    resetCalculator() {
      this.setData({
        form: {
          productType: '车贷',
          repaymentMethod: 'equal_installment',
          loanAmount: 100000,
          loanTerm: 60,
          annualRate: 24,
          penaltyRate: 5,
          rebateRate: 11.5,
          paidMonths: 12,
          isPrepay: true
        },
        results: {},
        displayResults: {},
        analysisText: '',
        analysisSuggestion: '',
        showResults: false
      }, () => {
        this.syncRepaymentMethodName()
      })
    }
  }
})
