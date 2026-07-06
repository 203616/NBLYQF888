const db = require('../db')

const KEYS = {
  version: 'mp_trial_version',
  desc: 'mp_trial_desc',
  updatedAt: 'mp_trial_updated_at'
}

function upsertSetting(key, value) {
  db.prepare(`
    INSERT INTO system_settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value)
}

function getSetting(key, fallback = '') {
  const row = db.prepare('SELECT value FROM system_settings WHERE key = ?').get(key)
  return row?.value || fallback
}

function setTrialVersionMeta({ version, desc = '', updatedAt }) {
  if (version) upsertSetting(KEYS.version, String(version))
  if (desc) upsertSetting(KEYS.desc, String(desc))
  upsertSetting(KEYS.updatedAt, updatedAt || new Date().toISOString())
}

function getTrialVersionMeta() {
  const version = getSetting(KEYS.version, '1.0.0')
  const desc = getSetting(KEYS.desc, '亮叶企服体验版')
  const updatedAt = getSetting(KEYS.updatedAt, '')
  return {
    version,
    desc,
    updatedAt,
    note: '体验版用于内部联调与功能验证，不等同于正式版发布内容。'
  }
}

module.exports = {
  KEYS,
  setTrialVersionMeta,
  getTrialVersionMeta
}
