const { get } = require('../utils/request')

function getTrialVersion() {
  return get('/config/trial-version', {}, { showError: false }).catch(() => null)
}

module.exports = {
  getTrialVersion
}
