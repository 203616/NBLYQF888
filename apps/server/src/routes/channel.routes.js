const express = require('express')
const mock = require('../../../../api/mock')
const { ok } = require('../utils/response')

const router = express.Router()

router.get('/', (req, res) => {
  let list = mock.channelPartners
  if (req.query.city) {
    list = list.filter(item => item.city === req.query.city)
  }
  ok(res, list)
})

router.post('/apply', (req, res) => {
  ok(res, {
    id: Date.now(),
    status: 'submitted',
    message: '渠道入驻申请已提交，亮叶企服将在1个工作日内联系您。'
  })
})

module.exports = router
