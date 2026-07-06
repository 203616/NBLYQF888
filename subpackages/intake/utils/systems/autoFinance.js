/** 汽车金融进件 — 新车/二手车/车抵 */
const { formModules, viewStatusModule, contractModule } = require('./shared')

const PRODUCT_PRESETS = {
  newCar: {
    productName: '新能源车购车咨询',
    basic: { loanPurpose: '购车消费' },
    vehicle: { vehicleType: '新能源乘用车', isNewCar: true },
    finance: { loanTerm: '36', insuranceRequired: true }
  },
  usedCar: {
    productName: '二手车按揭咨询',
    basic: { loanPurpose: '购车消费' },
    vehicle: { vehicleType: '燃油乘用车', isNewCar: false },
    finance: { loanTerm: '36' }
  },
  mortgage: {
    productName: '车辆抵押咨询',
    basic: { loanPurpose: '车辆抵押周转' },
    finance: { loanTerm: '24', gpsRequired: true }
  }
}

const MODULES = [
  ...formModules.autoFinance,
  viewStatusModule('audit', '审核进度', '材料初审、机构匹配、合规复核 — 仅查看', '/subpackages/intake/images/intake/audit.webp'),
  viewStatusModule('disburse', '放款进度', '签约确认、抵押登记、放款到账 — 仅查看', '/subpackages/intake/images/intake/disburse.webp'),
  contractModule,
  viewStatusModule('archive', '归档状态', '合同档案、材料归档、电子存证 — 仅查看', '/subpackages/intake/images/intake/archive.webp'),
  viewStatusModule('collection', '还款提醒', '还款计划、到期提醒、合规催收 — 仅查看', '/subpackages/intake/images/intake/collection.webp')
]

module.exports = { MODULES, PRODUCT_PRESETS, systemKey: 'autoFinance' }
