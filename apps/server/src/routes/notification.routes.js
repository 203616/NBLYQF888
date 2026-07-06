const express = require('express')
const jwt = require('jsonwebtoken')
const db = require('../db')
const { ok } = require('../utils/response')
const { jwtSecret } = require('../config')
const { createNotification, normalizeRow } = require('../services/notification.service')

const router = express.Router()

function optionalAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.replace(/^Bearer\s+/i, '')
  if (!token) return next()
  try {
    req.user = jwt.verify(token, jwtSecret)
  } catch (error) {
    // optional
  }
  next()
}

function listForUser(userId, phone) {
  const normalizedPhone = String(phone || '').replace(/\D/g, '')
  const rows = []
  const seen = new Set()
  const push = list => {
    list.forEach(row => {
      if (!seen.has(row.id)) {
        seen.add(row.id)
        rows.push(row)
      }
    })
  }

  const baseSql = `
    SELECT id, title, content, type, status, link, created_at AS createdAt
    FROM notifications
    WHERE type != 'deploy'
      AND type != 'moderation'
      AND (
        recipient_phone IS NULL
        OR recipient_phone = ''
        ${normalizedPhone.length >= 11 ? 'OR recipient_phone = ?' : ''}
      )
  `

  if (userId) {
    push(db.prepare(`
      ${baseSql}
      AND (user_id = ? OR user_id IS NULL)
      ORDER BY id DESC LIMIT 100
    `).all(...(normalizedPhone.length >= 11 ? [normalizedPhone, userId] : [userId])))
  } else if (normalizedPhone.length >= 11) {
    push(db.prepare(`
      ${baseSql}
      AND user_id IS NULL
      ORDER BY id DESC LIMIT 100
    `).all(normalizedPhone))
  }

  if (phone && phone.length >= 11 && normalizedPhone.length >= 11) {
    push(db.prepare(`
      SELECT id, title, content, type, status, link, created_at AS createdAt
      FROM notifications
      WHERE user_id IS NULL AND type != 'deploy' AND type != 'moderation' AND (content LIKE ? OR title LIKE ?)
      ORDER BY id DESC LIMIT 50
    `).all(`%${normalizedPhone.slice(-4)}%`, `%${normalizedPhone.slice(-4)}%`))
  }

  if (!rows.length) {
    push(db.prepare(`
      SELECT id, title, content, type, status, link, created_at AS createdAt
      FROM notifications
      WHERE type != 'deploy' AND type != 'moderation'
      ORDER BY id DESC LIMIT 100
    `).all())
  }

  return rows.map(normalizeRow).sort((a, b) => b.id - a.id)
}

function countUnread(userId, phone) {
  const list = listForUser(userId, phone)
  return list.filter(n => n.status === 'unread').length
}

router.get('/unread-count', optionalAuth, (req, res) => {
  const userId = req.user?.id || req.user?.userId || null
  const phone = String(req.query.phone || '').replace(/\D/g, '')
  ok(res, { count: countUnread(userId, phone) })
})

router.get('/mine', optionalAuth, (req, res) => {
  const userId = req.user?.id || req.user?.userId || null
  const phone = String(req.query.phone || '').replace(/\D/g, '')
  ok(res, listForUser(userId, phone))
})

router.get('/', optionalAuth, (req, res) => {
  const userId = req.user?.id || req.user?.userId || null
  const phone = String(req.query.phone || '').replace(/\D/g, '')
  ok(res, listForUser(userId, phone))
})

router.post('/read-all', optionalAuth, (req, res) => {
  const userId = req.user?.id || req.user?.userId || null
  if (userId) {
    db.prepare("UPDATE notifications SET status = 'read', read_at = datetime('now') WHERE user_id = ? AND status = 'unread'").run(userId)
  } else {
    db.prepare("UPDATE notifications SET status = 'read', read_at = datetime('now') WHERE status = 'unread'").run()
  }
  ok(res, { count: 0 }, '已全部标为已读')
})

router.post('/:id/read', (req, res) => {
  db.prepare("UPDATE notifications SET status = 'read', read_at = datetime('now') WHERE id = ?").run(req.params.id)
  ok(res, true, '已标记为已读')
})

router.post('/', (req, res) => {
  const { userId = null, title, content, type = 'system', link = '' } = req.body
  const row = createNotification({ userId, title, content, type, link })
  ok(res, normalizeRow(row), '消息已创建')
})

module.exports = router
