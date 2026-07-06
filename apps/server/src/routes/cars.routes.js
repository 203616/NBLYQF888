const express = require('express')
const mock = require('../../../../api/mock')
const { ok } = require('../utils/response')

const router = express.Router()

router.get('/', (req, res) => {
  let list = mock.carListings
  if (req.query.city) {
    list = list.filter(item => item.city === req.query.city)
  }
  if (req.query.keyword) {
    list = list.filter(item => `${item.brand}${item.model}`.includes(req.query.keyword))
  }
  ok(res, list)
})

router.get('/:id', (req, res) => {
  const item = mock.findById(mock.carListings, req.params.id)
  ok(res, item)
})

module.exports = router
