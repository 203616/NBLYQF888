const express = require('express')
const db = require('../db')
const { ok, fail } = require('../utils/response')

const router = express.Router()

router.get('/list', (req, res) => {
  const { type = 'all' } = req.query
  const sql = type === 'all'
    ? 'SELECT id, type, title, content, report_count AS count, published_at AS date, status, status_color AS statusColor FROM exposures ORDER BY published_at DESC'
    : 'SELECT id, type, title, content, report_count AS count, published_at AS date, status, status_color AS statusColor FROM exposures WHERE type = ? ORDER BY published_at DESC'
  const rows = type === 'all' ? db.prepare(sql).all() : db.prepare(sql).all(type)
  ok(res, rows.map(row => ({ ...row, count: `${row.count || 0}人举报` })))
})

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT id, type, title, content, report_count AS count, published_at AS date, status, status_color AS statusColor FROM exposures WHERE id = ?').get(req.params.id)
  if (!row) return fail(res, '曝光内容不存在', 404)
  ok(res, { ...row, count: `${row.count || 0}人举报` })
})

router.post('/reports', (req, res) => {
  const { type, title, content, contact = '', evidence = [] } = req.body
  if (!type || !title || !content) return fail(res, '举报类型、标题和描述不能为空')
  const info = db.prepare('INSERT INTO exposure_reports (type, title, content, contact, evidence) VALUES (?, ?, ?, ?, ?)').run(type, title, content, contact, JSON.stringify(evidence))
  ok(res, { id: info.lastInsertRowid, status: 'pending' }, '举报已提交')
})

module.exports = router
