const { get } = require('../utils/request')
const { getConfig } = require('../utils/config')
const mock = require('./mock')

function getOaDashboard() {
  if (getConfig().useMockFallback) {
    return Promise.resolve({
      stats: mock.profile.oaStats,
      tasks: mock.profile.oaTasks,
      meetings: mock.profile.meetings
    })
  }
  return get('/profile/oa')
}

function getDocuments() {
  if (getConfig().useMockFallback) {
    return Promise.resolve(mock.profile.docItems)
  }
  return get('/profile/documents')
}

function getSettings() {
  if (getConfig().useMockFallback) {
    return Promise.resolve(mock.profile.settings)
  }
  return get('/profile/settings')
}

module.exports = {
  getOaDashboard,
  getDocuments,
  getSettings
}
