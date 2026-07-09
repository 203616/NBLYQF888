const express = require('express')
const db = require('../db')
const { ok, fail } = require('../utils/response')

const router = express.Router()

function enrichCase(row) {
  if (!row) return null
  let detail = {}
  try {
    detail = row.detail ? JSON.parse(row.detail) : {}
  } catch { /* ignore */ }
  return {
    id: row.id,
    title: row.title,
    result: row.result,
    desc: row.desc || detail.desc || '',
    cover: row.cover || detail.cover || '',
    tag: row.tag || detail.tag || '',
    client: detail.client || '',
    industry: detail.industry || '',
    city: detail.city || '',
    duration: detail.duration || '',
    amount: detail.amount || '',
    institution: detail.institution || '',
    challenge: detail.challenge || '',
    solution: detail.solution || '',
    outcome: detail.outcome || '',
    timeline: detail.timeline || [],
    relatedPath: detail.relatedPath || '',
    complianceNote: '本案例为亮叶企服居间服务记录，具体审批结果以持牌机构为准，不构成放款承诺。',
    sort: row.sort || 0,
    status: row.status || 'published'
  }
}

router.get('/', (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM success_cases WHERE status = ? ORDER BY sort ASC, id ASC").all('published')
    ok(res, rows.map(enrichCase))
  } catch (e) {
    fail(res, '查询失败: ' + e.message, 500)
  }
})

router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM success_cases WHERE id = ?').get(req.params.id)
    if (!row) return fail(res, '案例不存在', 404)
    ok(res, enrichCase(row))
  } catch (e) {
    fail(res, '查询失败: ' + e.message, 500)
  }
})

module.exports = router
