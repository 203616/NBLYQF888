const express = require('express')
const db = require('../db')
const { ok, fail } = require('../utils/response')

const router = express.Router()

function normalizeArticle(row) {
  if (!row) return row
  const id = row.type === 'knowledge' ? row.id - 1000 : row.type === 'tips' ? row.id - 2000 : row.id
  return { ...row, id }
}

function listByType(type) {
  return db.prepare('SELECT id, type, category, title, summary, content, cover, source, level, risk_level AS levelText, views, published_at AS date FROM articles WHERE type = ? AND status = ? ORDER BY published_at DESC, id DESC').all(type, 'published').map(normalizeArticle)
}

// 内容根路径 - 返回内容分类概览
router.get('/', (req, res) => {
  try {
    const newsCount = db.prepare('SELECT COUNT(*) AS count FROM articles WHERE type = ? AND status = ?').get('news', 'published').count
    const knowledgeCount = db.prepare('SELECT COUNT(*) AS count FROM articles WHERE type = ? AND status = ?').get('knowledge', 'published').count
    const tipsCount = db.prepare('SELECT COUNT(*) AS count FROM articles WHERE type = ? AND status = ?').get('tips', 'published').count
    ok(res, { categories: [
      { type: 'news', label: '金融资讯', count: newsCount },
      { type: 'knowledge', label: '金融知识', count: knowledgeCount },
      { type: 'tips', label: '防骗技巧', count: tipsCount }
    ]})
  } catch (e) {
    fail(res, '内容获取失败: ' + e.message)
  }
})

router.get('/news', (req, res) => ok(res, listByType('news')))
router.get('/knowledge', (req, res) => ok(res, listByType('knowledge')))
router.get('/tips', (req, res) => ok(res, listByType('tips')))

router.get('/articles/:type/:id', (req, res) => {
  const offset = req.params.type === 'knowledge' ? 1000 : req.params.type === 'tips' ? 2000 : 0
  const article = db.prepare('SELECT * FROM articles WHERE type = ? AND id = ?').get(req.params.type, Number(req.params.id) + offset)
  if (!article) return fail(res, '内容不存在', 404)
  ok(res, normalizeArticle(article))
})

router.get('/search', (req, res) => {
  const keyword = `%${req.query.keyword || ''}%`
  const type = req.query.type || 'all'
  const rows = []
  if (type === 'all' || type === 'product') {
    rows.push(...db.prepare('SELECT id, "product" AS type, name AS title, desc, CASE WHEN path LIKE "/pages/%" THEN "/subpackages/product/pages/detail/detail?id=" || id ELSE path END AS path FROM products WHERE name LIKE ? OR desc LIKE ?').all(keyword, keyword))
  }
  const articleRows = db.prepare('SELECT id, type, title, summary AS desc FROM articles WHERE title LIKE ? OR summary LIKE ?').all(keyword, keyword).map(row => {
    const item = normalizeArticle(row)
    return { ...item, path: `/subpackages/${item.type}/pages/detail/detail?id=${item.id}` }
  })
  rows.push(...articleRows.filter(item => type === 'all' || type === item.type || (type === 'service' && ['knowledge', 'tips'].includes(item.type))))
  ok(res, rows)
})

module.exports = router
