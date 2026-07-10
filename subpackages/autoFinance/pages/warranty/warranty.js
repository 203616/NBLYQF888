Page({
  data: {
    plan: null,
    activePlanId: 'basic',
    highlights: [
      { label: '保障部件', value: '50+' },
      { label: '救援次数', value: '2-4次' },
      { label: '服务网点', value: '300+' },
      { label: '响应时效', value: '24h' }
    ],
    plans: [
      {
        id: 'basic',
        name: '基础保障',
        price: '899起',
        cover: '/subpackages/autoFinance/images/warranty-basic.webp',
        intro: '适合宁波日常通勤车辆，覆盖发动机核心部件，合作网点覆盖鄞州、江北、海曙等区域。',
        items: [
          { text: '发动机核心部件保障（缸体、曲轴、活塞等）', included: true },
          { text: '道路救援 2 次/年（50公里内免费拖车）', included: true },
          { text: '保养提醒与预约协助', included: true },
          { text: '24小时客服热线与故障咨询', included: true },
          { text: '宁波合作网点检测折扣', included: true }
        ],
        coverage: ['发动机', '道路救援', '保养提醒'],
        complianceNote: '延保服务由合作服务商提供，保障范围以服务合同为准。'
      },
      {
        id: 'premium',
        name: '全面保障',
        price: '1699起',
        cover: '/subpackages/autoFinance/images/warranty-premium.webp',
        intro: '适合高里程或豪华品牌车辆，覆盖动力、传动、电控系统，专属顾问全程跟进。',
        items: [
          { text: '发动机/变速箱/电控系统全面保障', included: true },
          { text: '道路救援 4 次/年（100公里内免费拖车）', included: true },
          { text: '专属顾问跟进与检测预约', included: true },
          { text: '免费全车检测 1 次/年', included: true },
          { text: '异地故障协调与配件加速通道', included: true },
          { text: '续保优惠与会员积分', included: true }
        ],
        coverage: ['发动机', '变速箱', '电控', '救援4次', '专属顾问'],
        complianceNote: '延保服务由合作服务商提供，保障范围以服务合同为准。'
      },
      {
        id: 'ev',
        name: '新能源三电保障',
        price: '1299起',
        cover: '/subpackages/autoFinance/images/warranty-basic.webp',
        intro: '专为宁波新能源车主设计，覆盖电池、电机、电控系统，北仑、慈溪等区域均有合作网点。',
        items: [
          { text: '三电系统专项保障（电池包、电机、电控）', included: true },
          { text: '电池健康检测 1 次/年', included: true },
          { text: '道路救援 2 次/年', included: true },
          { text: '充电故障咨询与协调', included: true },
          { text: '合作4S店优先预约通道', included: true }
        ],
        coverage: ['三电系统', '电池检测', '道路救援'],
        complianceNote: '自然衰减通常不在保障范围内，以合同免责条款为准。'
      },
      {
        id: 'commercial',
        name: '营运车辆保障',
        price: '1899起',
        cover: '/subpackages/autoFinance/images/warranty-premium.webp',
        intro: '面向宁波网约车、物流车等营运车辆，强化发动机与传动系统保障。',
        items: [
          { text: '发动机/传动系统强化保障', included: true },
          { text: '道路救援 3 次/年（80公里内）', included: true },
          { text: '营运资质核验与车况评估', included: true },
          { text: '快速理赔通道', included: true },
          { text: '全市合作检测网点预约', included: true }
        ],
        coverage: ['发动机', '传动', '营运专属', '救援3次'],
        complianceNote: '营运车辆需通过车况检测方可承保。'
      }
    ],
    compareRows: [
      { name: '发动机保障', basic: '核心部件', premium: '全面覆盖' },
      { name: '变速箱保障', basic: '—', premium: '✓' },
      { name: '电控系统', basic: '—', premium: '✓' },
      { name: '道路救援', basic: '2次/年', premium: '4次/年' },
      { name: '专属顾问', basic: '—', premium: '✓' },
      { name: '免费检测', basic: '—', premium: '1次/年' }
    ],
    serviceFlow: [
      { title: '故障报修', desc: '发现车辆异常时及时提交维修申请，上传故障描述与照片', icon: '🔧' },
      { title: '平台初审', desc: '客服人员核实车辆信息与保障范围，确认是否符合理赔条件', icon: '📋' },
      { title: '网点检测', desc: '前往合作维修网点进行专业检测，出具检测报告与维修方案', icon: '🔍' },
      { title: '维修赔付', desc: '按合同约定范围完成维修，平台跟踪赔付进度确保服务质量', icon: '✅' }
    ],
    faqs: [
      { q: '什么车可以购买延保？', a: '一般要求车龄与里程在合理范围内，具体以检测评估结果为准。' },
      { q: '延保和厂家质保有什么区别？', a: '厂家质保到期后，延保可继续保障核心部件，降低意外维修成本。' },
      { q: '出险维修流程是怎样的？', a: '故障报修 → 客服核实 → 合作网点检修 → 按合同范围理赔。' },
      { q: '可以转让吗？', a: '部分套餐支持随车转让，具体以合同约定为准。' }
    ],
    contact: '',
    submitting: false
  },

  onLoad(options) {
    const typeAlias = { basic: 'basic', premium: 'premium', ev: 'ev', commercial: 'commercial' }
    const activePlanId = typeAlias[options.type] || options.type || 'basic'
    const plan = this.data.plans.find(item => item.id === activePlanId) || this.data.plans[0]
    this.setData({ plan, activePlanId })
    wx.setNavigationBarTitle({ title: '汽车延保' })
  },

  switchPlan(e) {
    const id = e.currentTarget.dataset.id
    const plan = this.data.plans.find(item => item.id === id)
    if (plan) this.setData({ plan, activePlanId: id })
  },

  handleInput(e) {
    this.setData({ contact: e.detail.value })
  },

  contactService() {
    wx.navigateTo({ url: '/subpackages/service/pages/chat/chat' })
  },

  goClaim() {
    wx.navigateTo({ url: '/subpackages/autoFinance/pages/warrantyClaim/warrantyClaim' })
  },

  goMyApplications() {
    const phone = wx.getStorageSync('userPhone') || this.data.contact
    wx.navigateTo({ url: `/subpackages/autoFinance/pages/warrantyIntake/warrantyIntake?phone=${phone}&view=list` })
  },

  handleApply() {
    if (!/^1\d{10}$/.test(this.data.contact)) {
      return wx.showToast({ title: '请输入正确手机号', icon: 'none' })
    }
    wx.setStorageSync('userPhone', this.data.contact)
    const planId = this.data.activePlanId || 'basic'
    wx.navigateTo({
      url: `/subpackages/autoFinance/pages/warrantyIntake/warrantyIntake?planId=${planId}&phone=${this.data.contact}`
    })
  }
})
