const db = require('../db')

function normalizeClue(payload = {}, source = 'manual') {
  return {
    type: payload.type || payload.category || 'new',
    title: payload.title || payload.name || '待核验线索',
    price: payload.price || payload.amount || '',
    location: payload.location || [payload.province, payload.city, payload.district].filter(Boolean).join(''),
    province: payload.province || '',
    city: payload.city || '',
    district: payload.district || '',
    dealer: payload.dealer || payload.channel || source,
    contact: payload.contact || payload.phone || '',
    description: payload.description || payload.remark || '第三方来源线索，待运营人员审核补充。',
    tags: Array.isArray(payload.tags) ? payload.tags : ['待审核'],
    source,
    externalId: payload.external_id || payload.externalId || `${source}-${Date.now()}`
  }
}

function ingestClue(payload, source = 'manual') {
  const clue = normalizeClue(payload, source)
  const existing = db.prepare('SELECT * FROM clues WHERE source = ? AND external_id = ?').get(clue.source, clue.externalId)
  if (existing) {
    return { clue: existing, created: false }
  }

  const info = db.prepare(`
    INSERT INTO clues (type, title, price, location, province, city, district, dealer, contact, description, tags, source, external_id, raw_payload, verified_status, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    clue.type,
    clue.title,
    clue.price,
    clue.location,
    clue.province,
    clue.city,
    clue.district,
    clue.dealer,
    clue.contact,
    clue.description,
    JSON.stringify(clue.tags),
    clue.source,
    clue.externalId,
    JSON.stringify(payload),
    'pending',
    '待审核'
  )
  return { clue: db.prepare('SELECT * FROM clues WHERE id = ?').get(info.lastInsertRowid), created: true }
}

module.exports = {
  ingestClue,
  normalizeClue
}
