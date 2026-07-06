const express = require('express')
const jwt = require('jsonwebtoken')
const db = require('../db')
const { ok, fail } = require('../utils/response')
const { createNotification } = require('../services/notification.service')
const { jwtSecret } = require('../config')

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

function parseTags(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return String(value).split(',').map(s => s.trim()).filter(Boolean)
  }
}

function normalizeDemand(row) {
  if (!row) return row
  return {
    ...row,
    tags: parseTags(row.tags),
    createdAt: row.created_at,
    linkedApplicationNo: row.linked_application_no || row.linkedApplicationNo || ''
  }
}

function enrichDemand(demand) {
  if (!demand) return demand
  const normalized = normalizeDemand(demand)
  const products = db.prepare('SELECT * FROM products WHERE status = ? ORDER BY sort ASC LIMIT 3').all('published')
  return {
    ...normalized,
    steps: [
      { title: '需求发布', desc: '系统已记录金额、期限与联系方式', done: true },
      { title: '方案匹配', desc: '根据用途、主体资质和期限匹配机构', done: normalized.progress >= 40 },
      { title: '专员沟通', desc: '确认材料清单与预计办理节奏', done: normalized.progress >= 70 },
      { title: '完成反馈', desc: '生成正式方案并留存服务记录', done: normalized.progress >= 100 }
    ],
    recommendedProducts: products
  }
}

router.get('/mine', optionalAuth, (req, res) => {
  const userId = req.user?.id || req.user?.userId
  const phone = String(req.query.phone || '').replace(/\D/g, '')
  let rows = []
  if (userId) {
    rows = db.prepare('SELECT * FROM demands WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 50').all(userId)
  }
  if (!rows.length && phone.length >= 11) {
    rows = db.prepare(`
      SELECT * FROM demands
      WHERE REPLACE(contact, ' ', '') LIKE ?
      ORDER BY created_at DESC, id DESC LIMIT 50
    `).all(`%${phone}%`)
  }
  ok(res, rows.map(normalizeDemand))
})

router.get('/', (req, res) => {
  const { type, city } = req.query
  let sql = 'SELECT * FROM demands WHERE 1=1'
  const params = []
  if (type && type !== 'all') {
    sql += ' AND type = ?'
    params.push(type)
  }
  if (city) {
    sql += ' AND city LIKE ?'
    params.push(`%${city}%`)
  }
  sql += ' ORDER BY created_at DESC, id DESC LIMIT 100'
  ok(res, db.prepare(sql).all(...params).map(normalizeDemand))
})

router.get('/:id', (req, res) => {
  const demand = db.prepare('SELECT * FROM demands WHERE id = ?').get(req.params.id)
  if (!demand) return fail(res, '需求不存在', 404)
  ok(res, enrichDemand(demand))
})

router.post('/', optionalAuth, (req, res) => {
  const { type, title, amount, period, contact, city, purpose, remark, tags, status, progress } = req.body
  if (!type || !title || !amount || !contact) return fail(res, '需求信息不完整', 400)
  const userId = req.user?.id || req.user?.userId || null
  const tagsJson = tags ? JSON.stringify(Array.isArray(tags) ? tags : [tags]) : null
  const info = db.prepare(`
    INSERT INTO demands (user_id, type, title, amount, period, contact, city, purpose, remark, tags, status, progress)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    type,
    title,
    amount,
    period || '',
    contact,
    city || '',
    purpose || '',
    remark || '',
    tagsJson,
    status || '初审中',
    Number(progress || 20)
  )
  const row = db.prepare('SELECT * FROM demands WHERE id = ?').get(info.lastInsertRowid)
  createNotification({
    userId,
    title: '需求发布成功',
    content: `您的需求「${title}」已发布，专员将尽快匹配方案。您可一键提交经营贷进件加速办理。`,
    type: 'demand',
    link: `/subpackages/demand/pages/detail/detail?id=${row.id}`
  })
  ok(res, normalizeDemand(row), '需求已发布')
})

module.exports = router
