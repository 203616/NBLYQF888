const express = require('express')
const db = require('../db')
const { ok, fail } = require('../utils/response')
const { publicBaseUrl } = require('../config')
const { generateWarrantyPdf } = require('../services/pdf.service')

const router = express.Router()

function parseJson(val, fallback = {}) {
  try { return val ? JSON.parse(val) : fallback } catch { return fallback }
}

function buildContract(app) {
  const payload = parseJson(app.payload)
  const vehicle = parseJson(app.vehicle_info)
  const owner = parseJson(app.owner_info)
  const contractNo = app.contract_no || `WB${String(app.id).padStart(8, '0')}`
  const lines = [
    '《汽车延保服务合同》（预览版）',
    `合同编号：${contractNo}`,
    `签署日期：${new Date().toLocaleDateString('zh-CN')}`,
    '',
    '一、服务对象',
    `车主：${owner.ownerName || payload.ownerName || '-'}`,
    `联系电话：${app.phone || payload.phone || '-'}`,
    `车辆：${vehicle.brand || payload.brand || ''} ${vehicle.model || payload.model || ''}`,
    `车牌：${vehicle.plateNo || payload.plateNo || '-'}`,
    '',
    '二、保障套餐',
    `套餐类型：${app.plan_id || payload.planId || 'basic'}`,
    '保障范围：以合作服务商正式合同及免责条款为准。',
    '',
    '三、服务说明',
    '1. 延保服务由合作持牌/授权服务商提供，亮叶企服仅提供信息咨询与预约协助。',
    '2. 自然衰减、人为损坏、事故损失等通常不在延保范围内。',
    '3. 理赔流程：故障报修 → 客服核实 → 合作网点检修 → 按合同范围处理。',
    '',
    '四、合规声明',
    '本预览不构成最终合同，正式签约以双方签署版为准。'
  ]
  return { contractNo, content: lines.join('\n'), appId: app.id }
}

router.post('/applications', (req, res) => {
  const body = req.body || {}
  const contractNo = `WB${Date.now()}`
  const result = db.prepare(`
    INSERT INTO warranty_applications (phone, plan_id, vehicle_info, insurance_info, owner_info, payload, status, contract_no)
    VALUES (?, ?, ?, ?, ?, ?, 'submitted', ?)
  `).run(
    body.phone || '',
    body.planId || 'basic',
    JSON.stringify({ brand: body.brand, model: body.model, plateNo: body.plateNo, year: body.year }),
    JSON.stringify({ compulsoryExpiry: body.compulsoryExpiry, commercialExpiry: body.commercialExpiry }),
    JSON.stringify({ ownerName: body.ownerName, address: body.address, emergencyContact: body.emergencyContact }),
    JSON.stringify(body),
    contractNo
  )
  ok(res, { id: result.lastInsertRowid, status: 'submitted', contractNo })
})

router.get('/applications', (req, res) => {
  const phone = req.query.phone || ''
  const rows = phone
    ? db.prepare('SELECT * FROM warranty_applications WHERE phone = ? ORDER BY id DESC LIMIT 50').all(phone)
    : db.prepare('SELECT * FROM warranty_applications ORDER BY id DESC LIMIT 50').all()
  ok(res, rows.map(row => ({
    ...row,
    vehicle_info: parseJson(row.vehicle_info),
    owner_info: parseJson(row.owner_info),
    payload: parseJson(row.payload)
  })))
})

router.get('/applications/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM warranty_applications WHERE id = ?').get(req.params.id)
  if (!row) return fail(res, '申请不存在', 404)
  ok(res, {
    ...row,
    vehicle_info: parseJson(row.vehicle_info),
    insurance_info: parseJson(row.insurance_info),
    owner_info: parseJson(row.owner_info),
    payload: parseJson(row.payload)
  })
})

router.get('/applications/:id/contract', (req, res) => {
  const row = db.prepare('SELECT * FROM warranty_applications WHERE id = ?').get(req.params.id)
  if (!row) return fail(res, '申请不存在', 404)
  ok(res, buildContract(row))
})

router.get('/applications/:id/contract.pdf', async (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM warranty_applications WHERE id = ?').get(req.params.id)
    if (!row) return fail(res, '申请不存在', 404)
    const contract = buildContract(row)
    const pdf = await generateWarrantyPdf(row, contract)
    const url = publicBaseUrl ? `${publicBaseUrl}${pdf.url}` : pdf.url
    ok(res, { ...pdf, url, contractNo: contract.contractNo }, 'PDF已生成')
  } catch (error) {
    fail(res, error.message || 'PDF生成失败', 500)
  }
})

router.post('/claims', (req, res) => {
  const body = req.body || {}
  if (!body.phone || !body.faultDesc) return fail(res, '请填写电话和故障描述')
  const result = db.prepare(`
    INSERT INTO warranty_claims (application_id, phone, plate_no, fault_desc, fault_photos, location, status)
    VALUES (?, ?, ?, ?, ?, ?, 'submitted')
  `).run(
    body.applicationId || null,
    body.phone,
    body.plateNo || '',
    body.faultDesc,
    JSON.stringify(body.photos || []),
    body.location || ''
  )
  ok(res, { id: result.lastInsertRowid, status: 'submitted', message: '理赔申请已提交，客服将尽快联系您' })
})

router.get('/claims', (req, res) => {
  const phone = req.query.phone || ''
  const rows = phone
    ? db.prepare('SELECT * FROM warranty_claims WHERE phone = ? ORDER BY id DESC LIMIT 50').all(phone)
    : db.prepare('SELECT * FROM warranty_claims ORDER BY id DESC LIMIT 50').all()
  ok(res, rows.map(row => ({ ...row, fault_photos: parseJson(row.fault_photos, []) })))
})

router.patch('/claims/:id', (req, res) => {
  const { status, handler, remark } = req.body || {}
  db.prepare(`
    UPDATE warranty_claims SET status = COALESCE(?, status), handler = COALESCE(?, handler),
    remark = COALESCE(?, remark), updated_at = datetime('now') WHERE id = ?
  `).run(status || null, handler || null, remark || null, req.params.id)
  ok(res, true, '已更新')
})

router.get('/staff', (req, res) => {
  ok(res, db.prepare("SELECT * FROM sales_staff WHERE status = 'active' ORDER BY id ASC").all())
})

module.exports = router
