const db = require('../db')

function createNotification({ userId = null, title, content, type = 'system', link = '', recipientPhone = null }) {
  if (!title || !content) return null
  const phone = recipientPhone ? String(recipientPhone).replace(/\D/g, '') : null
  const info = db.prepare(`
    INSERT INTO notifications (user_id, title, content, type, link, status, recipient_phone)
    VALUES (?, ?, ?, ?, ?, 'unread', ?)
  `).run(userId, title, content, type, link || '', phone || null)
  return db.prepare('SELECT * FROM notifications WHERE id = ?').get(info.lastInsertRowid)
}

function normalizeRow(row) {
  if (!row) return row
  return {
    ...row,
    createdAt: row.createdAt || row.created_at,
    status: row.status || 'unread'
  }
}

module.exports = {
  createNotification,
  normalizeRow
}
