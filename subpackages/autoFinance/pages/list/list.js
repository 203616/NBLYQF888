const catalog = require('../../../../data/auto-finance-catalog')

Page({
  data: {
    stats: [
      { label: '合作机构', value: '15+' },
      { label: '产品方案', value: `${catalog.autoFinanceProducts.length}+` },
      { label: '预审反馈', value: '30分钟' },
      { label: '服务区域', value: '宁波' }
    ],
    products: catalog.autoFinanceProducts,
    filterType: 'all',
    filterTypes: [
      { id: 'all', name: '全部' },
      { id: 'newCar', name: '新车按揭' },
      { id: 'usedCar', name: '二手车' },
      { id: 'mortgage', name: '车抵咨询' }
    ],
    filteredProducts: [],
    advantages: [
      { icon: '📋', title: '材料清单清晰', desc: '按机构要求提供完整材料清单与填写指引' },
      { icon: '🔍', title: '持牌机构对接', desc: '信息来源于工行、建行、宁波银行等公开产品' },
      { icon: '💰', title: '成本透明', desc: '不收取前置费用，具体条件以机构合同为准' },
      { icon: '📱', title: '进度可追踪', desc: '进件材料云端同步，审核节点可视化' }
    ],
    tools: [
      { id: 'calculator', title: '金融计算器', desc: '等额本息/本金多方式测算', icon: '🧮', url: '/subpackages/tools/pages/calculator/calculator' },
      { id: 'valuation', title: '车辆估值', desc: '快速参考市场估值', icon: '🔍', url: '/subpackages/tools/pages/valuation/valuation' },
      { id: 'cars', title: '靠谱好车', desc: '本地精选合规车源', icon: '🚗', url: '/subpackages/cars/pages/list/list' },
      { id: 'prepayment', title: '提前还款测算', desc: '专项提前还款成本分析', icon: '🧮', url: '/subpackages/autoFinance/pages/prepayment/prepayment' }
    ],
    processSteps: [
      { title: '提交基础信息', desc: '填写个人与车辆信息，选择目标机构产品' },
      { title: '专员预审匹配', desc: '30分钟内反馈初步意见，协助对接持牌机构' },
      { title: '补充申请材料', desc: '按清单补充流水、收入证明、车辆资料等' },
      { title: '机构独立审批', desc: '持牌金融机构合规审核，确认合同条款' },
      { title: '签约与交付', desc: '按机构合同约定完成签约及车辆交付' }
    ],
    faqs: [
      { q: '平台是否发放贷款？', a: '不发放。亮叶企服仅提供信息咨询与居间撮合，最终审批由持牌金融机构独立决定。' },
      { q: '产品信息从哪里来？', a: '来源于各持牌金融机构官网及公开渠道，具体条件以机构审核为准。' },
      { q: '是否收取前置费用？', a: '平台不收取任何前置保证金，费用以机构正式合同披露为准。' },
      { q: '宁波地区有哪些机构？', a: '目前对接工行、建行、农行、中行、宁波银行、邮储、平安、招行及多家汽车金融公司。' }
    ],
    complianceNote: catalog.COMPLIANCE
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: '汽车金融' })
    this.applyFilter()
  },

  switchFilter(e) {
    this.setData({ filterType: e.currentTarget.dataset.type }, () => this.applyFilter())
  },

  applyFilter() {
    const { products, filterType } = this.data
    const intakeMap = { newCar: 'newCar', usedCar: 'usedCar', mortgage: 'mortgage' }
    const filtered = filterType === 'all'
      ? products
      : products.filter(p => p.intakeType === intakeMap[filterType])
    this.setData({ filteredProducts: filtered })
  },

  navigateToPage(e) {
    const url = e.currentTarget.dataset.url
    if (url) wx.navigateTo({ url })
  },

  goIntake(e) {
    const item = e.currentTarget.dataset.item
    if (!item) return
    const { goIntake } = require('../../../../utils/intakeNav')
    goIntake({
      productType: item.intakeType || 'newCar',
      productName: item.title,
      productId: item.id
    })
  }
})
