const express = require('express')
const db = require('../db')
const { ok } = require('../utils/response')

const router = express.Router()

router.get('/regions', (req, res) => {
  const snapshots = db.prepare('SELECT province, city, metric_key, metric_label, metric_value, source_name, source_url, captured_at FROM analytics_snapshots ORDER BY province, city').all()
  const grouped = {}
  snapshots.forEach(item => {
    const key = `${item.province}-${item.city || ''}`
    if (!grouped[key]) {
      grouped[key] = {
        province: item.province,
        city: item.city,
        clues: 0,
        demands: 0,
        applications: 0,
        sourceName: item.source_name,
        sourceUrl: item.source_url,
        updatedAt: item.captured_at
      }
    }
    grouped[key][item.metric_key] = item.metric_value
  })
  ok(res, {
    updatedAt: new Date().toISOString(),
    source: '国家统计局国家数据、天地图公开行政区划服务、后台审核业务数据',
    list: Object.values(grouped)
  })
})

router.get('/sources', (req, res) => {
  ok(res, db.prepare('SELECT * FROM data_sources ORDER BY id ASC').all())
})

module.exports = router
