function formatMoney(value) {
  const num = Number(value)
  if (Number.isNaN(num)) return '0.00'
  return num.toFixed(2)
}

function getRepaymentMethodName(methods, id) {
  const matched = methods.find(item => item.id === id)
  return matched ? matched.name : ''
}

const FINANCIAL_INSTITUTIONS = [
  '工商银行', '农业银行', '中国银行', '建设银行', '交通银行', '邮储银行',
  '招商银行', '浦发银行', '中信银行', '光大银行', '华夏银行', '民生银行',
  '平安银行', '兴业银行', '广发银行', '浙商银行', '恒丰银行', '渤海银行',
  '宁波银行', '杭州银行', '上海银行', '北京银行', '江苏银行', '南京银行',
  '微众银行', '网商银行', '平安普惠', '中银消费', '兴业消费', '招联金融',
  '捷信消费', '马上消费', '中原消费', '海尔消金', '盛银消费', '杭银消金'
]

const VEHICLE_BRANDS = [
  '奔驰', '宝马', '奥迪', '大众', '丰田', '本田', '日产', '别克',
  '福特', '雪佛兰', '现代', '起亚', '标致', '雪铁龙', '马自达',
  '沃尔沃', '凯迪拉克', '雷克萨斯', '英菲尼迪', '讴歌',
  '比亚迪', '吉利', '长城', '长安', '奇瑞', '上汽荣威', '广汽传祺',
  '蔚来', '小鹏', '理想', '特斯拉', '哪吒', '零跑', '问界',
  '五菱', '宝骏', '奔腾', '红旗', '捷途', '星途', '领克', 'WEY'
]

const LOAN_TERM_OPTIONS = [12, 24, 36, 48, 60]

Component({
  properties: {},

  data: {
    // 产品类型（车贷、车分期为车类业务，其余为通用）
    productTypes: [
      { id: 'vehicle_loan', name: '车贷', group: 'vehicle' },
      { id: 'vehicle_installment', name: '车分期', group: 'vehicle' },
      { id: 'mortgage', name: '房贷', group: 'general' },
      { id: 'credit_loan', name: '信用贷', group: 'general' },
      { id: 'business_loan', name: '企业经营贷', group: 'general' },
      { id: 'farmer_loan', name: '农户贷', group: 'general' },
      { id: 'startup_loan', name: '创业贷', group: 'general' },
      { id: 'education_loan', name: '教育贷', group: 'general' },
      { id: 'renovation_loan', name: '装修贷', group: 'general' },
      { id: 'consumption_loan', name: '消费贷', group: 'general' }
    ],
    repaymentMethods: [
      { id: 'equal_installment', name: '等本等息' },
      { id: 'equal_payment', name: '等额本息' },
      { id: 'equal_principal', name: '等额本金' },
      { id: 'interest_first', name: '先息后本' },
      { id: 'lump_sum', name: '一次性还本付息' }
    ],
    productRepaymentMap: {
      vehicle_loan: ['equal_installment'],
      vehicle_installment: ['equal_installment'],
      mortgage: ['equal_payment', 'equal_principal', 'interest_first'],
      credit_loan: ['equal_payment', 'equal_principal', 'interest_first', 'lump_sum'],
      business_loan: ['equal_payment', 'equal_principal', 'interest_first'],
      farmer_loan: ['equal_payment', 'equal_principal', 'interest_first'],
      startup_loan: ['equal_payment', 'equal_principal', 'interest_first'],
      education_loan: ['equal_payment', 'equal_principal', 'lump_sum'],
      renovation_loan: ['equal_payment', 'equal_principal', 'interest_first'],
      consumption_loan: ['equal_payment', 'equal_principal', 'interest_first', 'lump_sum']
    },
    financialInstitutions: FINANCIAL_INSTITUTIONS,
    vehicleBrands: VEHICLE_BRANDS,
    loanTermOptions: LOAN_TERM_OPTIONS,

    availableMethods: [],
    form: {
      productType: 'vehicle_loan',
      repaymentMethod: 'equal_installment',
      // 车辆相关
      vehicleBrand: '',
      vehicleModel: '',
      vehicleYear: new Date().getFullYear(),
      invoicePrice: 0,
      downPaymentRate: 30, // 百分比
      downPayment: 0,
      loanAmount: 100000,
      loanTerm: 60,
      annualRate: 3,
      financialInstitution: '',
      // 违约金
      penaltyRate: 5,
      paidMonths: 0,
      remainingPrincipal: 0,
      penaltyAmount: 0,
      prepayTotal: 0
    },
    modelName: '',
    termLabel: '60期',
    termYearsLabel: '5.0年',
    isVehicleProduct: true,
    productLabel: '车贷',
    // 原生 picker 索引（0-based）
    productTypeIdx: 0,
    brandIdx: 0,
    yearIdx: 0,
    yearRange: Array.from({length: 30}, (_, i) => new Date().getFullYear() - i),
    termIdx: 4,
    instIdx: 0,
    exportImageBtnText: '📷 导出图片',
    exportPdfBtnText: '📄 导出PDF',
    results: {},
    displayResults: {},
    repaymentMethodName: '等本等息',
    analysisText: '',
    analysisSuggestion: '',
    schedule: [],
    scheduleDisplay: [],
    showSchedule: false,
    showResults: false,
    exportingPdf: false,
    exportingImage: false
  },

  lifetimes: {
    attached() {
      this.syncAvailableMethods()
      this.syncRepaymentMethodName()
      this.syncVehicleFields()
    }
  },

  methods: {
    // ========== 同步方法 ==========
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

    syncVehicleFields() {
      const pid = this.data.form.productType
      const isVehicle = pid === 'vehicle_loan' || pid === 'vehicle_installment'
      this.setData({ isVehicleProduct: isVehicle })
    },

    syncDisplayResults(results = {}) {
      const displayResults = {}
      const moneyFields = [
        'monthlyPayment', 'monthlyPrincipal', 'monthlyInterest',
        'totalInterest', 'totalPayment',
        'repaidPrincipal', 'repaidInterest', 'remainingPrincipal',
        'penaltyAmount', 'penaltyRate', 'actualCost', 'monthlyCost',
        'lastPayment', 'firstPayment', 'monthlyDecline', 'monthlyEquivalent',
        'downPayment', 'downPaymentRate', 'invoicePrice',
        'prepayTotal'
      ]
      moneyFields.forEach(field => {
        if (results[field] !== undefined && results[field] !== null) {
          displayResults[field] = formatMoney(results[field])
        }
      })
      if (results.effectiveRate !== undefined && results.effectiveRate !== null) {
        displayResults.effectiveRate = String(Number(results.effectiveRate).toFixed(2))
      }
      const actualCost = Number(results.actualCost || 0)
      this.setData({
        displayResults,
        analysisText: actualCost > 0 ? '此方案实际支出成本较高' : '此方案为您节省了资金',
        analysisSuggestion: actualCost > 0 ? '考虑其他贷款方案' : '尽快办理此贷款方案'
      })
    },

    getProductLabel(id) {
      const found = this.data.productTypes.find(p => p.id === id)
      return found ? found.name : id
    },

    // ========== 原生 picker 实现 ==========
    onProductPickerChange(e) {
      const idx = e.detail.value
      const product = this.data.productTypes[idx].id
      const isVehicle = product === 'vehicle_loan' || product === 'vehicle_installment'
      const newForm = { ...this.data.form, productType: product }
      if (isVehicle) {
        newForm.repaymentMethod = 'equal_installment'
        newForm.annualRate = 3
        newForm.penaltyRate = 5
      }
      this.setData({ form: newForm, productLabel: this.getProductLabel(product), productTypeIdx: idx })
      this.syncAvailableMethods()
      this.syncRepaymentMethodName()
      this.syncVehicleFields()
    },

    onTermPickerChange(e) {
      const idx = e.detail.value
      const term = this.data.loanTermOptions[idx]
      this.setData({
        'form.loanTerm': term,
        termLabel: term + '期',
        termYearsLabel: (term / 12).toFixed(1) + '年',
        termIdx: idx
      })
    },

    onBrandPickerChange(e) {
      const idx = e.detail.value
      this.setData({
        'form.vehicleBrand': this.data.vehicleBrands[idx],
        brandIdx: idx
      })
    },

    onYearPickerChange(e) {
      const idx = e.detail.value
      const years = this.data.yearRange
      this.setData({
        'form.vehicleYear': years[idx],
        yearIdx: idx
      })
    },

    onInstPickerChange(e) {
      const idx = e.detail.value
      this.setData({
        'form.financialInstitution': this.data.financialInstitutions[idx],
        instIdx: idx
      })
    },

    // ========== 输入处理 ==========
    handleInputChange(e) {
      const { field } = e.currentTarget.dataset
      const value = e.detail.value
      const form = { ...this.data.form, [field]: value }

      // 联动计算：开票价 & 首付比例 → 贷款金额
      if (field === 'invoicePrice' || field === 'downPaymentRate') {
        const invoice = parseFloat(form.invoicePrice) || 0
        const rate = parseFloat(form.downPaymentRate) || 0
        const downPmt = invoice * rate / 100
        const loanAmt = Math.floor((invoice - downPmt) / 1000) * 1000 // 千位取整
        form.downPayment = downPmt
        form.loanAmount = Math.max(0, loanAmt)
      }

      // 贷款金额手动输入时，同步首付
      if (field === 'loanAmount') {
        const invoice = parseFloat(form.invoicePrice) || 0
        const loanAmt = parseFloat(form.loanAmount) || 0
        form.downPayment = Math.max(0, invoice - loanAmt)
        form.downPaymentRate = invoice > 0 ? (form.downPayment / invoice * 100) : 0
      }

      this.setData({ form })
    },

    handleInputBlur(e) {
      // 输入完成后自动计算贷款金额（基于开票和首付率）
      const { field } = e.currentTarget.dataset
      if (field === 'invoicePrice' || field === 'downPaymentRate') {
        const form = this.data.form
        const invoice = parseFloat(form.invoicePrice) || 0
        const rate = parseFloat(form.downPaymentRate) || 0
        const downPmt = invoice * rate / 100
        const loanAmt = Math.floor((invoice - downPmt) / 1000) * 1000
        this.setData({
          'form.downPayment': downPmt,
          'form.loanAmount': Math.max(0, loanAmt)
        })
      }
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
      const isVehicle = product === 'vehicle_loan' || product === 'vehicle_installment'
      const newForm = { ...this.data.form, productType: product }
      if (isVehicle) {
        newForm.repaymentMethod = 'equal_installment'
        newForm.annualRate = 3
        newForm.penaltyRate = 5
      }
      this.setData({ form: newForm, productLabel: this.getProductLabel(product) })
      this.syncAvailableMethods()
      this.syncRepaymentMethodName()
      this.syncVehicleFields()
      this.calculate()
    },

    // ========== 贷款金额快捷设置 ==========
    quickAmount(e) {
      const amt = parseInt(e.currentTarget.dataset.amount, 10)
      this.setData({ 'form.loanAmount': amt })
    },

    // ========== 核心计算 ==========
    calculate() {
      const form = this.data.form
      if (form.repaymentMethod === 'equal_installment') {
        this.calculateEqualInstallment()
      } else if (form.repaymentMethod === 'equal_payment') {
        this.calculateEqualPayment()
      } else if (form.repaymentMethod === 'equal_principal') {
        this.calculateEqualPrincipal()
      } else if (form.repaymentMethod === 'interest_first') {
        this.calculateInterestFirst()
      } else if (form.repaymentMethod === 'lump_sum') {
        this.calculateLumpSum()
      }
    },

    // ========== 等本等息（精确保留：每月利息基于初始本金） ==========
    calculateEqualInstallment() {
      const form = this.data.form
      const loanAmount = parseFloat(form.loanAmount)
      const loanTerm = parseInt(form.loanTerm, 10)
      const monthlyRate = form.annualRate / 100 / 12

      // 等本等息核心逻辑：
      // 月还本金 = 贷款总额 / 总期数（固定）
      // 月还利息 = 贷款总额 × 月利率（固定，不随本金减少）
      // 月供 = 月还本金 + 月还利息（固定）
      const monthlyPrincipal = loanAmount / loanTerm
      const monthlyInterest = loanAmount * monthlyRate
      const monthlyPayment = monthlyPrincipal + monthlyInterest
      const totalInterest = monthlyInterest * loanTerm
      const totalPayment = loanAmount + totalInterest

      // 生成完整还款计划表（所有期数）
      const schedule = []
      let remaining = loanAmount
      for (let i = 1; i <= loanTerm; i++) {
        // 每期还固定的本金，剩余本金递减
        const principalPaid = Math.min(monthlyPrincipal, remaining)
        remaining = Math.max(0, remaining - principalPaid)
        schedule.push({
          period: i,
          payment: monthlyPayment,
          principal: principalPaid,
          interest: monthlyInterest,
          remaining: remaining
        })
      }

      // 提前还款计算（仅对车贷和车分期）
      const isVehicle = form.productType === 'vehicle_loan' || form.productType === 'vehicle_installment'
      const paidMonths = parseInt(form.paidMonths, 10)
      const repaidPrincipal = monthlyPrincipal * Math.min(paidMonths, loanTerm)
      const repaidInterest = monthlyInterest * Math.min(paidMonths, loanTerm)
      const remainingPrincipal = Math.max(0, loanAmount - repaidPrincipal)

      // 违约金规则：
      // 5年期合同，2年（24期）内提前还款 → 违约金 = 剩余本金 × 违约金率
      // 超过2年提前还款 → 违约金 = 0
      let penaltyAmount = 0
      if (isVehicle && paidMonths > 0 && paidMonths < loanTerm) {
        if (paidMonths <= 24) {
          penaltyAmount = remainingPrincipal * (form.penaltyRate / 100)
        } else {
          penaltyAmount = 0
        }
      }
      const prepayTotal = remainingPrincipal + penaltyAmount

      const results = {
        monthlyPayment,
        monthlyPrincipal,
        monthlyInterest,
        totalInterest,
        totalPayment,
        repaidPrincipal,
        repaidInterest,
        remainingPrincipal,
        penaltyAmount,
        penaltyRate: form.penaltyRate,
        prepayTotal,
        // 以下字段非车类业务也会计算
        actualCost: repaidPrincipal + repaidInterest + remainingPrincipal + penaltyAmount,
        monthlyCost: paidMonths > 0 ? (repaidPrincipal + repaidInterest + remainingPrincipal + penaltyAmount) / paidMonths : 0,
        effectiveRate: paidMonths > 0 ? (((repaidPrincipal + repaidInterest + remainingPrincipal + penaltyAmount) - loanAmount) / loanAmount / (paidMonths / 12) * 100) : 0
      }

      this.setData({ results, schedule, scheduleDisplay: this.buildScheduleDisplay(schedule), showResults: true }, () => {
        this.syncDisplayResults(results)
      })
    },

    // ========== 等额本息 ==========
    calculateEqualPayment() {
      const form = this.data.form
      const loanAmount = parseFloat(form.loanAmount)
      const loanTerm = parseInt(form.loanTerm, 10)
      const monthlyRate = form.annualRate / 100 / 12
      const schedule = []
      let remaining = loanAmount
      let totalInterest = 0

      let monthlyPayment, totalPayment
      if (form.annualRate === 0) {
        monthlyPayment = loanAmount / loanTerm
        totalInterest = 0
        totalPayment = loanAmount
        for (let i = 1; i <= loanTerm; i++) {
          const p = monthlyPayment
          remaining = Math.max(0, remaining - p)
          schedule.push({ period: i, payment: monthlyPayment, principal: p, interest: 0, remaining })
        }
      } else {
        const factor = Math.pow(1 + monthlyRate, loanTerm)
        monthlyPayment = loanAmount * monthlyRate * factor / (factor - 1)
        totalPayment = monthlyPayment * loanTerm
        for (let i = 1; i <= loanTerm; i++) {
          const interest = remaining * monthlyRate
          const principal = monthlyPayment - interest
          remaining = Math.max(0, remaining - principal)
          totalInterest += interest
          schedule.push({ period: i, payment: monthlyPayment, principal, interest, remaining })
        }
      }

      const results = { monthlyPayment, totalInterest, totalPayment, schedule }
      this.setData({ results, schedule, scheduleDisplay: this.buildScheduleDisplay(schedule), showResults: true }, () => this.syncDisplayResults(results))
    },

    // ========== 等额本金 ==========
    calculateEqualPrincipal() {
      const form = this.data.form
      const loanAmount = parseFloat(form.loanAmount)
      const loanTerm = parseInt(form.loanTerm, 10)
      const monthlyRate = form.annualRate / 100 / 12
      const schedule = []
      const monthlyPrincipal = loanAmount / loanTerm
      let remaining = loanAmount
      let totalInterest = 0

      for (let i = 1; i <= loanTerm; i++) {
        const interest = remaining * monthlyRate
        const payment = monthlyPrincipal + interest
        remaining = Math.max(0, remaining - monthlyPrincipal)
        totalInterest += interest
        schedule.push({ period: i, payment, principal: monthlyPrincipal, interest, remaining })
      }

      const firstPayment = schedule.length > 0 ? schedule[0].payment : 0
      const lastPayment = schedule.length > 0 ? schedule[schedule.length - 1].payment : 0
      const monthlyDecline = schedule.length > 1 ? schedule[0].payment - schedule[1].payment : 0

      const results = {
        monthlyPrincipal, firstPayment, lastPayment, monthlyDecline,
        totalInterest, totalPayment: loanAmount + totalInterest, schedule
      }
      this.setData({ results, schedule, scheduleDisplay: this.buildScheduleDisplay(schedule), showResults: true }, () => this.syncDisplayResults(results))
    },

    // ========== 先息后本 ==========
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
        schedule.push({ period: i, payment, principal, interest, remaining: i === loanTerm ? 0 : loanAmount })
      }

      const results = {
        monthlyInterest: loanAmount * monthlyRate,
        lastPayment: loanAmount + loanAmount * monthlyRate,
        totalInterest, totalPayment: loanAmount + totalInterest, schedule
      }
      this.setData({ results, schedule, scheduleDisplay: this.buildScheduleDisplay(schedule), showResults: true }, () => this.syncDisplayResults(results))
    },

    // ========== 一次性还本付息 ==========
    calculateLumpSum() {
      const form = this.data.form
      const loanAmount = parseFloat(form.loanAmount)
      const loanTerm = parseInt(form.loanTerm, 10)
      const annualRate = form.annualRate / 100

      const totalInterest = loanAmount * annualRate * loanTerm / 12
      const totalPayment = loanAmount + totalInterest
      const monthlyEquivalent = totalPayment / loanTerm

      const results = { totalInterest, totalPayment, monthlyEquivalent, lastPayment: totalPayment }
      this.setData({ results, showResults: true, schedule: [], scheduleDisplay: [] }, () => this.syncDisplayResults(results))
    },

    // ========== 导出图片 ==========
    exportScheduleImage() {
      if (!this.data.schedule || !this.data.schedule.length) {
        return wx.showToast({ title: '请先计算', icon: 'none' })
      }
      this.setData({ exportingImage: true, exportImageBtnText: '生成中...' })
      wx.showLoading({ title: '生成图片中' })
      const query = this.createSelectorQuery()
      query.select('#exportCanvas').fields({ node: true, size: true }).exec(res => {
        const canvas = res[0]?.node
        if (!canvas) {
          wx.hideLoading()
          this.setData({ exportingImage: false, exportImageBtnText: '📷 导出图片' })
          return wx.showToast({ title: 'Canvas初始化失败', icon: 'none' })
        }
        const ctx = canvas.getContext('2d')
        const dpr = wx.getSystemInfoSync().pixelRatio || 2
        const width = 750
        const rowH = 36
        const headerH = 140
        const scheduleLen = this.data.schedule.length || 1
        const maxRows = 60 // 最多显示60行
        const displayRows = Math.min(scheduleLen, maxRows)
        const height = headerH + (displayRows + 1) * rowH + 60
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        ctx.fillStyle = '#0F3D2E'
        ctx.font = 'bold 22px sans-serif'
        ctx.fillText(`亮叶企服 · ${this.getProductLabel(this.data.form.productType)}还款计划表`, 24, 40)
        ctx.font = '16px sans-serif'
        ctx.fillStyle = '#666'
        ctx.fillText(`${this.data.repaymentMethodName} | 金额${this.data.form.loanAmount}元 | ${this.data.form.loanTerm}期`, 24, 70)

        const cols = ['期次', '月供', '本金', '利息', '剩余']
        const colX = [24, 100, 220, 340, 460]
        ctx.fillStyle = '#0F3D2E'
        ctx.font = 'bold 16px sans-serif'
        ctx.fillText(cols[0], colX[0], headerH)
        ctx.fillText(cols[1], colX[1], headerH)
        ctx.fillText(cols[2], colX[2], headerH)
        ctx.fillText(cols[3], colX[3], headerH)
        ctx.fillText(cols[4], colX[4], headerH)
        ctx.font = '14px sans-serif'
        const displaySched = this.data.schedule.slice(0, maxRows)
        displaySched.forEach((row, idx) => {
          const y = headerH + (idx + 1) * rowH
          if (idx % 2 === 0) {
            ctx.fillStyle = '#f7f9fc'
            ctx.fillRect(0, y - 24, width, rowH)
          }
          ctx.fillStyle = '#333'
          ctx.fillText(String(row.period), colX[0], y)
          ctx.fillText(Number(row.payment || 0).toFixed(2), colX[1], y)
          ctx.fillText(Number(row.principal || 0).toFixed(2), colX[2], y)
          ctx.fillText(Number(row.interest || 0).toFixed(2), colX[3], y)
          ctx.fillText(Number(row.remaining || 0).toFixed(2), colX[4], y)
        })
        if (scheduleLen > maxRows) {
          ctx.fillStyle = '#999'
          ctx.font = '14px sans-serif'
          ctx.fillText(`... 共 ${scheduleLen} 期，仅展示前 ${maxRows} 期`, 24, height - 30)
        }
        wx.canvasToTempFilePath({
          canvas,
          success: (fileRes) => {
            wx.hideLoading()
            this.setData({ exportingImage: false, exportImageBtnText: '📷 导出图片' })
            wx.saveImageToPhotosAlbum({
              filePath: fileRes.tempFilePath,
              success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
              fail: () => wx.previewImage({ urls: [fileRes.tempFilePath] })
            })
          },
          fail: () => {
            wx.hideLoading()
            this.setData({ exportingImage: false, exportImageBtnText: '📷 导出图片' })
            wx.showToast({ title: '导出失败', icon: 'none' })
          }
        })
      })
    },

    // ========== 导出 PDF（调用后端生成） ==========
    exportSchedulePdf() {
      const { post } = require('../../../utils/request')
      if (!this.data.schedule || !this.data.schedule.length) {
        return wx.showToast({ title: '请先计算', icon: 'none' })
      }
      this.setData({ exportingPdf: true, exportPdfBtnText: '生成中...' })
      wx.showLoading({ title: '生成PDF中' })
      const form = this.data.form
      post('/tools/calculator/export-pdf', {
        schedule: this.data.schedule,
        productType: form.productType,
        productLabel: this.getProductLabel(form.productType),
        repaymentMethod: this.data.repaymentMethodName,
        loanAmount: form.loanAmount,
        loanTerm: form.loanTerm,
        annualRate: form.annualRate,
        vehicleBrand: form.vehicleBrand,
        vehicleModel: form.vehicleModel,
        vehicleYear: form.vehicleYear,
        financialInstitution: form.financialInstitution,
        results: this.data.results
      }, { showError: false })
        .then(res => {
          wx.hideLoading()
          this.setData({ exportingPdf: false, exportPdfBtnText: '📄 导出PDF' })
          if (res && res.url) {
            // 打开PDF下载链接
            wx.downloadFile({
              url: res.url,
              success: (dl) => {
                if (dl.statusCode === 200) {
                  wx.openDocument({ filePath: dl.tempFilePath, fileType: 'pdf' })
                }
              }
            })
          } else if (res && res.content) {
            wx.setClipboardData({
              data: res.content,
              success: () => wx.showToast({ title: '还款表已复制', icon: 'success' })
            })
          } else {
            wx.showToast({ title: '导出任务已创建', icon: 'success' })
          }
        })
        .catch(() => {
          wx.hideLoading()
          this.setData({ exportingPdf: false, exportPdfBtnText: '📄 导出PDF' })
          wx.showToast({ title: '请连接服务端导出', icon: 'none' })
        })
    },

    isVehicleProduct() {
      const pid = this.data.form.productType
      return pid === 'vehicle_loan' || pid === 'vehicle_installment'
    },

    // ========== 重置/清零 ==========
    resetCalculator() {
      this.setData({
        form: {
          productType: 'vehicle_loan',
          repaymentMethod: 'equal_installment',
          vehicleBrand: '',
          vehicleModel: '',
          vehicleYear: new Date().getFullYear(),
          invoicePrice: 0,
          downPaymentRate: 30,
          downPayment: 0,
          loanAmount: 100000,
          loanTerm: 60,
          annualRate: 3,
          financialInstitution: '',
          penaltyRate: 5,
          paidMonths: 0,
          remainingPrincipal: 0,
          penaltyAmount: 0,
          prepayTotal: 0
        },
        termLabel: '60期',
        termYearsLabel: '5.0年',
        productLabel: '车贷',
        results: {},
        displayResults: {},
        analysisText: '',
        analysisSuggestion: '',
        schedule: [],
        scheduleDisplay: [],
        showSchedule: false,
        showResults: false,
        exportingPdf: false,
        exportingImage: false,
        exportImageBtnText: '📷 导出图片',
        exportPdfBtnText: '📄 导出PDF',
        productTypeIdx: 0,
        brandIdx: 0,
        yearIdx: 0,
        termIdx: 4,
        instIdx: 0
      }, () => {
        this.syncRepaymentMethodName()
        this.syncVehicleFields()
      })
    },

    // ========== 构建预格式化的还款计划展示数据 ==========
    buildScheduleDisplay(schedule) {
      if (!schedule || !schedule.length) return []
      return schedule.map(row => ({
        period: row.period,
        payment: Number(row.payment || 0).toFixed(2),
        principal: Number(row.principal || 0).toFixed(2),
        interest: Number(row.interest || 0).toFixed(2),
        remaining: Number(row.remaining || 0).toFixed(2)
      }))
    },

    clearResults() {
      this.setData({
        results: {},
        displayResults: {},
        analysisText: '',
        analysisSuggestion: '',
        schedule: [],
        scheduleDisplay: [],
        showSchedule: false,
        showResults: false
      })
    }
  }
})
