const { getClueDetail } = require('../../../../api/clue')

const TYPE_MAP = {
  new: '新车线索',
  used: '二手车线索',
  mortgage: '车抵贷线索',
  lease: '以租代购线索',
  business: '企业贷线索',
  personal: '个人贷线索',
  mortgage_house: '房贷线索',
  other: '其它贷款线索'
}

const STATUS_COLORS = {
  '跟进中': '#0F3D2E',
  '材料待补': '#c77a00',
  '待评估': '#1a6bb5',
  '待沟通': '#666',
  '待审核': '#888'
}

const RELATED_BY_TYPE = {
  new: [
    { icon: '🚗', title: '新车金融方案', desc: '对比银行与厂家金融分期', path: '/subpackages/autoFinance/pages/newCar/newCar' },
    { icon: '📋', title: '提交进件', desc: '关联线索发起汽车金融进件', path: '' }
  ],
  used: [
    { icon: '🔄', title: '二手车按揭', desc: '评估价参考与材料预审', path: '/subpackages/autoFinance/pages/usedCar/usedCar' },
    { icon: '📋', title: '提交进件', desc: '关联线索发起进件', path: '' }
  ],
  mortgage: [
    { icon: '💰', title: '车抵方案', desc: '不押车方案与综合成本测算', path: '/subpackages/autoFinance/pages/carMortgage/carMortgage' },
    { icon: '📋', title: '提交进件', desc: '关联线索发起进件', path: '' }
  ],
  lease: [
    { icon: '📋', title: '以租代购说明', desc: '了解租购模式、押金与回购条款', path: '/subpackages/product/pages/detail/detail?id=7' },
    { icon: '📋', title: '提交进件', desc: '关联线索发起进件', path: '' }
  ],
  business: [
    { icon: '🏢', title: '企业经营贷', desc: '宁波银行·农行·建行小微产品', path: '/pages/products/products' },
    { icon: '📋', title: '提交进件', desc: '关联线索发起经营贷进件', path: '' }
  ],
  personal: [
    { icon: '👤', title: '个人消费贷', desc: '白领通、信用贷等产品咨询', path: '/subpackages/product/pages/detail/detail?id=14' },
    { icon: '📋', title: '提交进件', desc: '关联线索发起进件', path: '' }
  ],
  mortgage_house: [
    { icon: '🏠', title: '房产抵押贷', desc: 'e抵快贷、房抵经营周转', path: '/subpackages/product/pages/detail/detail?id=17' },
    { icon: '📋', title: '提交进件', desc: '关联线索发起进件', path: '' }
  ],
  other: [
    { icon: '💼', title: '产品大全', desc: '浏览更多融资产品方案', path: '/pages/products/products' },
    { icon: '📋', title: '提交进件', desc: '关联线索发起进件', path: '' }
  ]
}

Page({
  data: {
    clueDetail: null,
    loading: true,
    relatedActions: []
  },

  onLoad(options) {
    this.loadClueDetail(options.id || '1')
  },

  loadClueDetail(id) {
    getClueDetail(id).then(clue => {
      const relatedActions = RELATED_BY_TYPE[clue.type] || RELATED_BY_TYPE.other
      this.setData({
        clueDetail: {
          typeText: TYPE_MAP[clue.type] || '汽车线索',
          createTime: clue.createTime || '2025-07-02',
          statusColor: STATUS_COLORS[clue.status] || '#0F3D2E',
          tags: clue.tags || [],
          district: clue.district || '',
          externalId: clue.externalId || '',
          ...clue
        },
        relatedActions,
        loading: false
      })
      wx.setNavigationBarTitle({ title: this.data.clueDetail.typeText })
    })
  },

  handleContact() {
    wx.showModal({
      title: '联系客户',
      content: `联系方式：${this.data.clueDetail.contact}\n\n请通过合规渠道联系客户，保护客户隐私信息。`,
      confirmText: '联系客服',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({ url: '/subpackages/service/pages/chat/chat' })
        }
      }
    })
  },

  handleFollow() {
    wx.showToast({ title: '已标记跟进', icon: 'success' })
  },

  navigateToAction(e) {
    const path = e.currentTarget.dataset.path
    if (!path) {
      const { goIntake } = require('../../../../utils/intakeNav')
      const type = this.data.clueDetail.type
      const productTypeMap = {
        new: 'newCar', used: 'usedCar', mortgage: 'mortgage',
        lease: 'lease', business: 'business', personal: 'personal',
        mortgage_house: 'property', other: 'workflow'
      }
      goIntake({
        productType: productTypeMap[type] || 'workflow',
        productName: `${this.data.clueDetail.typeText}关联进件`
      })
      return
    }
    if (path.startsWith('/pages/')) {
      wx.switchTab({ url: path })
    } else {
      wx.navigateTo({ url: path })
    }
  }
})
