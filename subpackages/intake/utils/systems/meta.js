/**
 * 进件系统配置 — 按产品线拆分
 * autoFinance: 汽车金融进件（新车/二手车/车抵）
 * business: 企业经营贷进件
 * personal: 个人消费贷进件
 * warranty: 汽车延保进件
 * property: 抵押经营贷进件
 * lease: 融资租赁进件
 */

const SYSTEM_MAP = {
  newCar: 'autoFinance',
  usedCar: 'autoFinance',
  mortgage: 'autoFinance',
  autoFinance: 'autoFinance',
  business: 'business',
  personal: 'personal',
  warranty: 'warranty',
  property: 'property',
  lease: 'lease',
  workflow: 'autoFinance'
}

const SYSTEM_META = {
  autoFinance: {
    key: 'autoFinance',
    title: '汽车金融进件系统',
    subtitle: '新车按揭 · 二手车按揭 · 车辆抵押',
    heroImage: '/subpackages/intake/images/intake/vehicle.webp',
    badge: '汽车金融专属'
  },
  business: {
    key: 'business',
    title: '企业经营贷进件系统',
    subtitle: '税票流水 · 经营资质 · 用途证明',
    heroImage: '/subpackages/intake/images/intake/basic.webp',
    badge: '企业融资专属'
  },
  personal: {
    key: 'personal',
    title: '个人消费贷进件系统',
    subtitle: '收入证明 · 征信授权 · 合规消费用途',
    heroImage: '/subpackages/intake/images/intake/personal.webp',
    badge: '个人贷款专属'
  },
  warranty: {
    key: 'warranty',
    title: '汽车延保进件系统',
    subtitle: '车辆检测 · 套餐选择 · 服务保障',
    heroImage: '/subpackages/autoFinance/images/warranty-basic.webp',
    badge: '延保服务专属'
  },
  property: {
    key: 'property',
    title: '抵押经营贷进件系统',
    subtitle: '产权资料 · 评估报告 · 经营流水',
    heroImage: '/subpackages/intake/images/intake/finance.webp',
    badge: '抵押咨询专属'
  },
  lease: {
    key: 'lease',
    title: '融资租赁进件系统',
    subtitle: '设备需求 · 租赁方案 · 企业资质',
    heroImage: '/subpackages/intake/images/intake/work.webp',
    badge: '融资租赁专属'
  }
}

function getSystemKey(productType) {
  return SYSTEM_MAP[productType] || 'autoFinance'
}

function getSystemMeta(productType) {
  return SYSTEM_META[getSystemKey(productType)] || SYSTEM_META.autoFinance
}

module.exports = { SYSTEM_MAP, SYSTEM_META, getSystemKey, getSystemMeta }
