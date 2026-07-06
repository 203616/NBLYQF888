const express = require('express')
const db = require('../db')
const { ok, fail } = require('../utils/response')

const router = express.Router()

router.post('/', (req, res) => {
  const { productId, productName, amount, term, contact = '', remark = '' } = req.body
  if (!productId && !productName) return fail(res, '产品信息不能为空')
  const info = db.prepare('INSERT INTO finance_applications (product_id, product_name, loan_amount, loan_term, contact, remark, status) VALUES (?, ?, ?, ?, ?, ?, ?)').run(productId || null, productName || '', amount || '', term || '', contact, remark, 'submitted')
  ok(res, db.prepare('SELECT * FROM finance_applications WHERE id = ?').get(info.lastInsertRowid), '申请已提交')
})

module.exports = router
