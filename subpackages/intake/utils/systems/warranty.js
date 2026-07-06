const { formModules, viewStatusModule } = require('./shared')

const PRODUCT_PRESETS = {
  warranty: { productName: '汽车延保服务', basic: { loanPurpose: '延保服务', expectedAmount: '按套餐' } }
}

const MODULES = [
  ...formModules.warranty,
  viewStatusModule('audit', '审核进度', '车辆检测与套餐审核 — 仅查看', '/subpackages/intake/images/intake/audit.webp'),
  viewStatusModule('archive', '服务归档', '合同与服务档案 — 仅查看', '/subpackages/intake/images/intake/archive.webp')
]

module.exports = { MODULES, PRODUCT_PRESETS, systemKey: 'warranty' }
