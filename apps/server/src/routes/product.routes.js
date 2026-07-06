const express = require('express')
const db = require('../db')
const { ok, fail } = require('../utils/response')

const router = express.Router()

function attachTags(product) {
  if (!product) return product
  const tags = db.prepare('SELECT tag FROM product_tags WHERE product_id = ?').all(product.id).map(row => row.tag)
  return {
    ...product,
    tags,
    highlights: ['材料清单清晰', '专员协助预审', '综合成本透明'],
    process: ['提交基础信息', '匹配产品方案', '补充申请材料', '机构审批放款'],
    materials: ['身份证明', '收入或经营流水', '征信授权', '用途证明']
  }
}

router.get('/', (req, res) => {
  const { category = 'all' } = req.query
  const sql = category === 'all'
    ? 'SELECT * FROM products WHERE status = ? ORDER BY sort ASC, id ASC'
    : 'SELECT * FROM products WHERE status = ? AND category = ? ORDER BY sort ASC, id ASC'
  const params = category === 'all' ? ['published'] : ['published', category]
  ok(res, db.prepare(sql).all(...params).map(attachTags))
})

router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
  if (!product) return fail(res, '产品不存在', 404)
  ok(res, attachTags(product))
})

module.exports = router
