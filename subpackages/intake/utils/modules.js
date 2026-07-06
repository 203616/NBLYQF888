const { getSystemKey, getSystemMeta } = require('./systems/meta')
const autoFinance = require('./systems/autoFinance')
const business = require('./systems/business')
const personal = require('./systems/personal')
const warranty = require('./systems/warranty')
const property = require('./systems/property')
const lease = require('./systems/lease')

const SYSTEMS = { autoFinance, business, personal, warranty, property, lease }

function getSystem(productType) {
  const key = getSystemKey(productType)
  return SYSTEMS[key] || autoFinance
}

function getModules(productType) {
  return getSystem(productType).MODULES
}

function getPresets(productType) {
  return getSystem(productType).PRODUCT_PRESETS
}

const SECTION_MAP = {}
function rebuildSectionMap(productType) {
  const modules = getModules(productType)
  modules.forEach(m => { SECTION_MAP[m.id] = m })
  return modules
}

function filterModulesByProduct(productType) {
  return getModules(productType)
}

module.exports = {
  getSystem,
  getSystemKey,
  getSystemMeta,
  getModules,
  getPresets,
  rebuildSectionMap,
  filterModulesByProduct,
  SECTION_MAP,
  MODULES: autoFinance.MODULES,
  PRODUCT_PRESETS: autoFinance.PRODUCT_PRESETS
}
