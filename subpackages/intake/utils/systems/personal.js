const { formModules, viewStatusModule } = require('./shared')

const PRODUCT_PRESETS = {
  personal: { productName: '个人消费贷咨询', basic: { loanPurpose: '装修消费' } }
}

const MODULES = [
  ...formModules.personal,
  viewStatusModule('audit', '审核进度', '个人信用与收入审核 — 仅查看', '/subpackages/intake/images/intake/audit.webp')
]

module.exports = { MODULES, PRODUCT_PRESETS, systemKey: 'personal' }
