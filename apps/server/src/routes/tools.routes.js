const express = require('express')
const path = require('path')
const fs = require('fs')
const PDFDocument = require('pdfkit')
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

// ============ 计算器导出PDF（使用pdfkit） ============
router.post('/calculator/export-pdf', (req, res) => {
  const body = req.body || {}
  const schedule = body.schedule || []
  const productLabel = body.productLabel || '贷款'
  const repaymentMethod = body.repaymentMethod || ''
  const loanAmount = body.loanAmount || 0
  const loanTerm = body.loanTerm || 0
  const annualRate = body.annualRate || 0
  const vehicleInfo = [body.vehicleBrand || '', body.vehicleModel || '', body.vehicleYear || ''].filter(Boolean).join(' ')
  const institution = body.financialInstitution || ''
  const results = body.results || {}

  if (!schedule.length) {
    // 没有计划表时返回文本
    const lines = [
      `╔══════════════════════════════════════════╗`,
      `║       亮叶企服 · 还款计划表              ║`,
      `╠══════════════════════════════════════════╣`,
      `║ 产品: ${(productLabel || '').padEnd(25)}║`,
      `║ 方式: ${(repaymentMethod || '').padEnd(25)}║`,
      `║ 金额: ${String(loanAmount).padEnd(24)}║`,
      `║ 期限: ${String(loanTerm + '期').padEnd(24)}║`,
      `║ 利率: ${String(annualRate + '%').padEnd(24)}║`,
      `║ 时间: ${new Date().toLocaleString().padEnd(19)}║`,
      `╚══════════════════════════════════════════╝`,
      '',
      '（无分期还款计划）',
      '',
      '--- 合规提示：本计划表仅供信息参考，不构成贷款承诺。具体以持牌机构合同为准。 ---'
    ]
    return ok(res, {
      content: lines.join('\n'),
      filename: `repayment-schedule-${Date.now()}.txt`,
      message: '还款计划表已生成'
    })
  }

  // 使用 pdfkit 生成 PDF
  try {
    const doc = new PDFDocument({
      margin: 40,
      size: 'A4',
      layout: 'landscape'
    })

    const pdfDir = path.join(uploadsDir, 'pdf')
    fs.mkdirSync(pdfDir, { recursive: true })
    const fileName = `repayment-schedule-${Date.now()}.pdf`
    const filePath = path.join(pdfDir, fileName)
    const stream = fs.createWriteStream(filePath)

    doc.pipe(stream)

    // 标题
    doc.fontSize(18).fillColor('#0F3D2E').text('亮叶企服 · 还款计划表', { align: 'center' })
    doc.moveDown(0.5)

    // 基本信息
    doc.fontSize(11).fillColor('#333')
    const infoLines = [`产品：${productLabel} | 还款方式：${repaymentMethod}`]
    if (vehicleInfo) infoLines.push(`车辆：${vehicleInfo}`)
    if (institution) infoLines.push(`金融机构：${institution}`)
    infoLines.push(`贷款金额：¥${Number(loanAmount).toLocaleString()} | 期限：${loanTerm}期 (${(loanTerm / 12).toFixed(1)}年) | 年利率：${annualRate}%`)
    if (results.totalInterest !== undefined) {
      infoLines.push(`总利息：¥${Number(results.totalInterest).toFixed(2)} | 还款总额：¥${Number(results.totalPayment || 0).toFixed(2)}`)
    }
    infoLines.forEach(line => doc.text(line))
    doc.moveDown(0.5)

    // 生成日期
    doc.fontSize(9).fillColor('#999').text(`生成时间：${new Date().toLocaleString('zh-CN')}`, { align: 'right' })
    doc.moveDown(0.3)

    // 表格头
    const tableTop = doc.y
    const colWidths = [60, 130, 130, 130, 130]
    const cols = ['期次', '月供（元）', '本金（元）', '利息（元）', '剩余本金（元）']
    let xPos = 40

    doc.fontSize(10).fillColor('#fff')
    doc.rect(40, tableTop - 4, colWidths.reduce((a, b) => a + b, 0), 22).fill('#0F3D2E')
    doc.fillColor('#fff')
    cols.forEach((col, i) => {
      doc.text(col, xPos + 4, tableTop, { width: colWidths[i], align: 'center' })
      xPos += colWidths[i]
    })
    doc.fillColor('#333')

    // 表格数据
    let yPos = tableTop + 24
    const rowH = 20
    const maxRows = 40 // 每页最多40行
    let displayCount = 0

    schedule.forEach((row, idx) => {
      if (displayCount >= maxRows) return
      xPos = 40

      // 换页检测
      if (yPos + rowH > 520) {
        // 添加"下一页"标记
        doc.fontSize(9).fillColor('#999').text('— 下页续 —', 40, yPos + 4)
        doc.addPage()
        // 重新画表头
        yPos = 50
        const hdrY = yPos - 4
        doc.fontSize(10).fillColor('#fff')
        doc.rect(40, hdrY, colWidths.reduce((a, b) => a + b, 0), 22).fill('#0F3D2E')
        doc.fillColor('#fff')
        let hx = 40
        cols.forEach((col, ci) => {
          doc.text(col, hx + 4, hdrY + 4, { width: colWidths[ci], align: 'center' })
          hx += colWidths[ci]
        })
        doc.fillColor('#333')
        yPos += 28
      }

      // 交替背景色
      if (idx % 2 === 0) {
        doc.fillColor('#f7f9fc')
        doc.rect(40, yPos - 2, colWidths.reduce((a, b) => a + b, 0), rowH).fill()
      }
      doc.fillColor('#333')
      doc.fontSize(9)

      const values = [
        String(row.period),
        Number(row.payment || 0).toFixed(2),
        Number(row.principal || 0).toFixed(2),
        Number(row.interest || 0).toFixed(2),
        Number(row.remaining || 0).toFixed(2)
      ]
      values.forEach((val, vi) => {
        doc.text(val, xPos + 4, yPos, { width: colWidths[vi], align: 'center' })
        xPos += colWidths[vi]
      })
      yPos += rowH
      displayCount++
    })

    if (schedule.length > maxRows) {
      doc.fontSize(9).fillColor('#999')
      doc.text(`... 共 ${schedule.length} 期，PDF 仅展示前 ${maxRows} 期，完整数据请在小程序中查看`, 40, yPos + 4)
    }

    // 合规提示
    const footerY = Math.max(yPos + 40, 550)
    doc.fontSize(8).fillColor('#999')
    doc.text('合规提示：本还款计划表由亮叶企服自动生成，仅供信息参考，不构成贷款承诺。', 40, footerY, { align: 'center' })
    doc.text('实际利率、额度、审批结果以持牌金融机构正式合同为准。亮叶企服不发放贷款，不收取前置保证金。', 40, footerY + 14, { align: 'center' })

    doc.end()

    stream.on('finish', () => {
      ok(res, {
        url: `/uploads/pdf/${fileName}`,
        filename: fileName,
        message: '还款计划表PDF已生成'
      })
    })
    stream.on('error', (err) => {
      console.error('[PDF] write error:', err.message)
      fail(res, 'PDF生成失败')
    })
  } catch (err) {
    console.error('[PDF] error:', err.message)
    fail(res, 'PDF生成失败: ' + err.message)
  }
})

module.exports = router
