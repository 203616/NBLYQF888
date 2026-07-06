const { formModules, viewStatusModule } = require('./shared')

const PRODUCT_PRESETS = {
  business: { productName: '小微企业经营贷', basic: { loanPurpose: '经营周转' }, work: { employmentType: '企业主' } }
}

const MODULES = [
  ...formModules.business,
  viewStatusModule('audit', '审核进度', '企业资质与经营材料审核 — 仅查看', '/subpackages/intake/images/intake/audit.webp'),
  viewStatusModule('disburse', '放款进度', '签约与放款状态 — 仅查看', '/subpackages/intake/images/intake/disburse.webp')
]

module.exports = { MODULES, PRODUCT_PRESETS, systemKey: 'business' }
