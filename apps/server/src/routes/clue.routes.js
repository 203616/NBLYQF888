const express = require('express')
const db = require('../db')
const { ok, fail } = require('../utils/response')
const { ingestClue } = require('../services/clueIngest.service')

const router = express.Router()

function normalize(row) {
  if (!row) return row
  return {
    ...row,
    tags: row.tags ? JSON.parse(row.tags) : []
  }
}

router.get('/', (req, res) => {
  const { type = 'all' } = req.query
  const sql = type === 'all'
    ? 'SELECT * FROM clues ORDER BY created_at DESC, id DESC'
    : 'SELECT * FROM clues WHERE type = ? ORDER BY created_at DESC, id DESC'
  const rows = type === 'all' ? db.prepare(sql).all() : db.prepare(sql).all(type)
  ok(res, rows.map(normalize))
})

router.post('/', (req, res) => {
  const result = ingestClue(req.body, req.body.source || 'manual')
  ok(res, { ...normalize(result.clue), created: result.created }, result.created ? '线索已入库，等待审核' : '线索已存在')
})

router.post('/webhook/:source', (req, res) => {
  const source = req.params.source
  const result = ingestClue(req.body, source)
  ok(res, { ...normalize(result.clue), created: result.created }, result.created ? 'webhook线索已接收' : '重复线索已忽略')
})

router.post('/sync', (req, res) => {
  const source = req.body.source || 'batch-sync'
  const items = Array.isArray(req.body.items) ? req.body.items : []
  const results = items.map(item => ingestClue(item, source))
  ok(res, {
    total: items.length,
    created: results.filter(item => item.created).length,
    duplicated: results.filter(item => !item.created).length
  }, '线索同步完成')
})

router.get('/:id', (req, res) => {
  const clue = normalize(db.prepare('SELECT * FROM clues WHERE id = ?').get(req.params.id))
  if (!clue) return fail(res, '线索不存在', 404)
  ok(res, clue)
})

module.exports = router
