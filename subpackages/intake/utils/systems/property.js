const { formModules, viewStatusModule } = require('./shared')

const PRODUCT_PRESETS = {
  property: { productName: '抵押类经营周转咨询', basic: { loanPurpose: '经营周转' } }
}

const MODULES = [
  ...formModules.property,
  {
    id: 'finance', title: '融资方案', icon: '/subpackages/intake/images/intake/finance.webp', type: 'form',
    path: '/subpackages/intake/pages/form/form?section=finance',
    fields: [
      { key: 'loanAmount', label: '申请额度', type: 'text', required: true },
      { key: 'loanTerm', label: '期限', type: 'picker', options: ['12', '24', '36', '60'], suffix: '期' }
    ]
  },
  { id: 'uploads', title: '资料上传', icon: '/subpackages/intake/images/intake/upload.webp', type: 'upload', path: '/subpackages/intake/pages/upload/upload' },
  viewStatusModule('audit', '审核进度', '产权与评估审核 — 仅查看', '/subpackages/intake/images/intake/audit.webp')
]

module.exports = { MODULES, PRODUCT_PRESETS, systemKey: 'property' }
