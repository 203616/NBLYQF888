const { formModules, viewStatusModule } = require('./shared')

const PRODUCT_PRESETS = {
  lease: { productName: '设备融资租赁咨询', basic: { loanPurpose: '设备购置' } }
}

const MODULES = [
  ...formModules.lease,
  {
    id: 'finance', title: '租赁方案', icon: '/subpackages/intake/images/intake/finance.webp', type: 'form',
    path: '/subpackages/intake/pages/form/form?section=finance',
    fields: [
      { key: 'loanAmount', label: '租赁总额', type: 'text', required: true },
      { key: 'loanTerm', label: '租期', type: 'picker', options: ['12', '24', '36', '48'], suffix: '期' },
      { key: 'repaymentMethod', label: '支付方式', type: 'picker', options: ['等额租金', '前期优惠'] }
    ]
  },
  viewStatusModule('audit', '方案审核', '租赁方案审核 — 仅查看', '/subpackages/intake/images/intake/audit.webp')
]

module.exports = { MODULES, PRODUCT_PRESETS, systemKey: 'lease' }
