const express = require('express')
const path = require('path')
const fs = require('fs')
const mock = require('../../../../api/mock')
const { ok, fail } = require('../utils/response')
const { uploadsDir } = require('../config')
const { recognizeVehicleLicense, mapOcrToVehicleFields } = require('../services/ocr.service')

const router = express.Router()

function saveBase64Image(contentBase64, prefix) {
  const dir = path.join(uploadsDir, 'valuation')
  fs.mkdirSync(dir, { recursive: true })
  const fileName = `${prefix}-${Date.now()}.jpg`
  const filePath = path.join(dir, fileName)
  fs.writeFileSync(filePath, Buffer.from(contentBase64, 'base64'))
  return { filePath, fileName, url: `/uploads/valuation/${fileName}` }
}
router.get('/fuel', (req, res) => {
  const city = req.query.city || '宁波市'
  const current = mock.fuelPrices.items.find(item => item.city === city) || mock.fuelPrices.items[0]
  ok(res, { ...mock.fuelPrices, current })
})

router.get('/valuation/brands', (req, res) => {
  ok(res, mock.valuationBrands)
})

router.post('/valuation', (req, res) => {
  ok(res, mock.estimateCarValue(req.body))
})

router.post('/valuation/upload', (req, res) => {
  const { docKey, contentBase64 } = req.body || {}
  if (!docKey || !contentBase64) return fail(res, '缺少图片数据')
  const saved = saveBase64Image(contentBase64, docKey)
  ok(res, { docKey, ...saved })
})

router.post('/valuation/ocr', async (req, res, next) => {
  try {
    const { docKey, contentBase64, filePath: existingPath } = req.body || {}
    let imagePath = existingPath
    if (contentBase64) {
      const saved = saveBase64Image(contentBase64, docKey || 'license')
      imagePath = saved.filePath
    }
    if (!imagePath || !fs.existsSync(imagePath)) return fail(res, '图片不存在')
    const ocrResult = await recognizeVehicleLicense(imagePath)
    ok(res, {
      ocr: ocrResult,
      vehicleFields: mapOcrToVehicleFields(ocrResult),
      docKey: docKey || 'licenseFront'
    })
  } catch (err) {
    next(err)
  }
})

router.post('/valuation/submit', (req, res) => {
  const db = require('../db')
  const body = req.body || {}
  const estimate = mock.estimateCarValue(body)
  const result = db.prepare(`
    INSERT INTO vehicle_valuations (phone, brand, model, year, register_city, vin, purchase_price, mileage, estimate, photos, payload)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    body.phone || '',
    body.brand || '',
    body.model || '',
    Number(body.year) || 0,
    body.registerCity || '',
    body.vin || '',
    Number(body.purchasePrice) || 0,
    Number(body.mileage) || 0,
    estimate.estimate || 0,
    JSON.stringify(body.photos || {}),
    JSON.stringify(body)
  )
  ok(res, { id: result.lastInsertRowid, ...estimate, synced: true })
})

router.post('/calculator/export-pdf', (req, res) => {
  const schedule = (req.body && req.body.schedule) || []
  const lines = ['亮叶企服 · 还款计划表', `生成时间：${new Date().toLocaleString()}`, '']
  lines.push('期次\t月供\t本金\t利息\t剩余')
  schedule.forEach(row => {
    lines.push(`${row.period}\t${Number(row.payment || 0).toFixed(2)}\t${Number(row.principal || 0).toFixed(2)}\t${Number(row.interest || 0).toFixed(2)}\t${Number(row.remaining || 0).toFixed(2)}`)
  })
  ok(res, {
    url: '',
    content: lines.join('\n'),
    filename: `repayment-schedule-${Date.now()}.txt`,
    message: 'PDF导出内容已生成，请复制或下载'
  })
})

module.exports = router
