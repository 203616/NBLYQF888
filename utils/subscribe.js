const STORAGE_KEY = 'subscribeTemplateIds'

const FALLBACK_TEMPLATE_IDS = {
  intakeAudit: '',
  intakeDisburse: '',
  financeReview: ''
}

function getTemplateIds() {
  return wx.getStorageSync(STORAGE_KEY) || { ...FALLBACK_TEMPLATE_IDS }
}

function saveTemplateIds(ids) {
  const merged = {
    intakeAudit: ids.intakeAudit || '',
    intakeDisburse: ids.intakeDisburse || '',
    financeReview: ids.financeReview || ''
  }
  wx.setStorageSync(STORAGE_KEY, merged)
  return merged
}

function refreshSubscribeTemplates() {
  const { getConfig } = require('./config')
  if (getConfig().useMockFallback) {
    return Promise.resolve(getTemplateIds())
  }
  const { getIntegrationConfig } = require('../api/config')
  return getIntegrationConfig()
    .then(cfg => saveTemplateIds(cfg.subscribeTemplates || {}))
    .catch(() => getTemplateIds())
}

function getActiveTemplateIdList(ids) {
  return Object.values(ids || getTemplateIds()).filter(id => id && !String(id).includes('TEMPLATE_ID'))
}

function requestSubscribeByKeys(keys = []) {
  return refreshSubscribeTemplates().then(ids => {
    const tmplIds = keys.map(k => ids[k]).filter(id => id && !String(id).includes('TEMPLATE_ID'))
    if (!tmplIds.length || !wx.requestSubscribeMessage) {
      return Promise.resolve({ skipped: true, reason: 'no template ids' })
    }
    return new Promise(resolve => {
      wx.requestSubscribeMessage({
        tmplIds,
        complete: res => resolve(res)
      })
    })
  })
}

function requestIntakeSubscribe() {
  return requestSubscribeByKeys(['intakeAudit', 'intakeDisburse'])
}

function requestFinanceSubscribe() {
  return requestSubscribeByKeys(['financeReview'])
}

module.exports = {
  getTemplateIds,
  refreshSubscribeTemplates,
  requestIntakeSubscribe,
  requestFinanceSubscribe,
  requestSubscribeByKeys,
  getActiveTemplateIdList
}
