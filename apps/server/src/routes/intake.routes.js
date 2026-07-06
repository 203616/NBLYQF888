const express = require('express')
const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')
const db = require('../db')
const { ok, fail } = require('../utils/response')
const { requireAuth, requireAdmin } = require('../middleware/auth')
const { jwtSecret, uploadsDir, publicBaseUrl } = require('../config')
const {
  syncIntake,
  submitIntake,
  updateWorkflow,
  saveDocument,
  getByApplicationNo,
  getById,
  listDocuments,
  listWorkflowEvents,
  normalizeRow
} = require('../services/intakeIngest.service')
const { recognizeIdCard, mapOcrToPersonalFields } = require('../services/ocr.service')
const { generateIntakePdf } = require('../services/pdf.service')
const { notifyIntakeStatus } = require('../services/wechat.service')

const router = express.Router()

function optionalAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.replace(/^Bearer\s+/i, '')
  if (!token) return next()
  try {
    req.user = jwt.verify(token, jwtSecret)
  } catch (error) {
    // optional
  }
  next()
}

function ensureIntakeDir(applicationNo) {
  const dir = path.join(uploadsDir, 'intake', applicationNo)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

function decodeBase64Image(contentBase64) {
  const raw = String(contentBase64 || '').replace(/^data:image\/\w+;base64,/, '')
  return Buffer.from(raw, 'base64')
}

// —— 管理后台（须在动态路由之前）——

router.get('/admin/list', requireAdmin, (req, res) => {
  const { status, productType, q } = req.query
  let sql = 'SELECT * FROM intake_applications WHERE 1=1'
  const params = []
  if (status) { sql += ' AND status = ?'; params.push(status) }
  if (productType) { sql += ' AND product_type = ?'; params.push(productType) }
  if (q) {
    sql += ' AND (application_no LIKE ? OR product_name LIKE ? OR payload LIKE ?)'
    const like = `%${q}%`
    params.push(like, like, like)
  }
  sql += ' ORDER BY updated_at DESC LIMIT 200'
  ok(res, db.prepare(sql).all(...params).map(normalizeRow))
})

router.get('/admin/detail/:id', requireAdmin, (req, res) => {
  const application = getById(req.params.id)
  if (!application) return fail(res, '进件不存在', 404)
  ok(res, {
    ...application,
    documents: listDocuments(application.id),
    events: listWorkflowEvents(application.id)
  })
})

router.patch('/admin/:id', requireAdmin, (req, res) => {
  const application = getById(req.params.id)
  if (!application) return fail(res, '进件不存在', 404)

  const { status, assignee, admin_note, progress } = req.body
  const payload = application.payload
  if (status) {
    payload.meta = payload.meta || {}
    payload.meta.status = status
  }
  if (progress !== undefined) {
    payload.meta = payload.meta || {}
    payload.meta.progress = progress
  }

  db.prepare(`
    UPDATE intake_applications
    SET status = COALESCE(?, status),
        assignee = COALESCE(?, assignee),
        admin_note = COALESCE(?, admin_note),
        progress = COALESCE(?, progress),
        payload = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `).run(status || null, assignee || null, admin_note || null, progress ?? null, JSON.stringify(payload), application.id)

  ok(res, getById(application.id), '已更新')
})

router.get('/admin/pdf/:id', requireAdmin, async (req, res) => {
  try {
    const application = getById(req.params.id)
    if (!application) return fail(res, '进件不存在', 404)
    const pdf = await generateIntakePdf(application)
    ok(res, pdf, 'PDF已生成')
  } catch (error) {
    fail(res, error.message || 'PDF生成失败', 500)
  }
})

router.post('/admin/:id/workflow', requireAdmin, (req, res) => {
  try {
    const application = getById(req.params.id)
    if (!application) return fail(res, '进件不存在', 404)
    const { stage, status, remark, metaStatus } = req.body
    if (!stage) return fail(res, '缺少 stage', 400)
    const updated = updateWorkflow(application.application_no, stage, {
      status: status || 'processing',
      remark,
      metaStatus,
      operator: req.user.username || '管理员'
    }, req.user.username || '管理员')
    notifyIntakeStatus(updated, stage === 'disburse' ? 'disburse' : 'audit').catch(() => null)
    ok(res, updated, '流程已更新')
  } catch (error) {
    fail(res, error.message || '更新失败', 400)
  }
})

// —— 小程序端 ——

router.post('/sync', optionalAuth, (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || null
    const result = syncIntake(req.body, userId)
    ok(res, {
      applicationNo: result.application.application_no,
      serverId: result.application.id,
      created: result.created,
      status: result.application.status,
      progress: result.application.progress
    }, result.created ? '进件已创建' : '进件已同步')
  } catch (error) {
    fail(res, error.message || '同步失败', 400)
  }
})

router.post('/upload', optionalAuth, (req, res) => {
  try {
    const { applicationNo, docKey, fileName, contentBase64 } = req.body
    if (!applicationNo || !docKey || !contentBase64) {
      return fail(res, '缺少 applicationNo / docKey / contentBase64', 400)
    }
    const buffer = decodeBase64Image(contentBase64)
    if (buffer.length > 8 * 1024 * 1024) return fail(res, '单文件不能超过 8MB', 400)

    const dir = ensureIntakeDir(applicationNo)
    const safeName = `${docKey}-${Date.now()}-${fileName || 'image.jpg'}`.replace(/[^\w.\-]/g, '_')
    const filePath = path.join(dir, safeName)
    fs.writeFileSync(filePath, buffer)

    const relative = path.relative(uploadsDir, filePath).replace(/\\/g, '/')
    const fileUrl = publicBaseUrl ? `${publicBaseUrl}/uploads/${relative}` : `/uploads/${relative}`

    const doc = saveDocument({
      applicationNo,
      docKey,
      fileName: safeName,
      filePath: relative,
      fileUrl
    })

    ok(res, {
      id: doc.id,
      docKey: doc.doc_key,
      fileUrl: doc.file_url,
      fileName: doc.file_name
    }, '上传成功')
  } catch (error) {
    fail(res, error.message || '上传失败', 500)
  }
})

router.post('/ocr', optionalAuth, async (req, res) => {
  try {
    const { applicationNo, docKey, documentId, side } = req.body
    let imagePath = null
    let resolvedDocKey = docKey

    if (documentId) {
      const doc = db.prepare('SELECT * FROM intake_documents WHERE id = ?').get(documentId)
      if (!doc) return fail(res, '文档不存在', 404)
      imagePath = path.join(uploadsDir, doc.file_path)
      resolvedDocKey = doc.doc_key
    } else if (applicationNo && docKey) {
      const doc = db.prepare(`
        SELECT * FROM intake_documents
        WHERE application_no = ? AND doc_key = ?
        ORDER BY id DESC LIMIT 1
      `).get(applicationNo, docKey)
      if (doc) imagePath = path.join(uploadsDir, doc.file_path)
    }

    if (!imagePath) return fail(res, '请先上传影像资料', 400)

    const ocrSide = side || (String(resolvedDocKey).includes('Back') ? 'back' : 'front')
    const ocrResult = await recognizeIdCard(imagePath, ocrSide)
    const personalFields = mapOcrToPersonalFields(ocrResult)

    const targetId = documentId || db.prepare(`
      SELECT id FROM intake_documents WHERE application_no = ? AND doc_key = ? ORDER BY id DESC LIMIT 1
    `).get(applicationNo, resolvedDocKey)?.id

    if (targetId) {
      db.prepare('UPDATE intake_documents SET ocr_payload = ? WHERE id = ?').run(JSON.stringify(ocrResult), targetId)
    }

    ok(res, { ocr: ocrResult, personalFields, docKey: resolvedDocKey }, '识别完成')
  } catch (error) {
    fail(res, error.message || 'OCR 识别失败', 500)
  }
})

router.get('/mine', requireAuth, (req, res) => {
  const userId = req.user.id || req.user.userId
  const rows = db.prepare(`
    SELECT id, application_no, product_type, product_name, status, progress, updated_at, submitted_at, created_at
    FROM intake_applications WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50
  `).all(userId)
  ok(res, rows.map(r => ({
    id: r.id,
    applicationNo: r.application_no,
    productType: r.product_type,
    productName: r.product_name,
    status: r.status,
    progress: r.progress,
    updatedAt: r.updated_at,
    submittedAt: r.submitted_at,
    createdAt: r.created_at
  })))
})

router.get('/list/summary', optionalAuth, (req, res) => {
  const userId = req.user?.id || req.user?.userId
  const phone = String(req.query.phone || '').replace(/\D/g, '')
  const nos = String(req.query.nos || '').split(',').map(s => s.trim()).filter(Boolean)
  const rows = new Map()

  function addRow(r) {
    if (!r?.application_no) return
    rows.set(r.application_no, {
      id: r.id,
      applicationNo: r.application_no,
      productType: r.product_type,
      productName: r.product_name,
      status: r.status,
      progress: r.progress,
      updatedAt: r.updated_at,
      submittedAt: r.submitted_at,
      createdAt: r.created_at
    })
  }

  if (userId) {
    db.prepare(`
      SELECT id, application_no, product_type, product_name, status, progress, updated_at, submitted_at, created_at
      FROM intake_applications WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50
    `).all(userId).forEach(addRow)
  }

  if (phone.length >= 11) {
    db.prepare(`
      SELECT id, application_no, product_type, product_name, status, progress, updated_at, submitted_at, created_at
      FROM intake_applications
      WHERE payload LIKE ?
      ORDER BY updated_at DESC LIMIT 50
    `).all(`%"mobile":"${phone}"%`).forEach(addRow)
  }

  nos.forEach(no => {
    const r = db.prepare(`
      SELECT id, application_no, product_type, product_name, status, progress, updated_at, submitted_at, created_at
      FROM intake_applications WHERE application_no = ?
    `).get(no)
    addRow(r)
  })

  const list = Array.from(rows.values()).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
  ok(res, list)
})

router.get('/:applicationNo/pdf', optionalAuth, async (req, res) => {
  try {
    const application = getByApplicationNo(req.params.applicationNo)
    if (!application) return fail(res, '进件不存在', 404)
    const pdf = await generateIntakePdf(application)
    const url = publicBaseUrl ? `${publicBaseUrl}${pdf.url}` : pdf.url
    ok(res, { ...pdf, url }, 'PDF已生成')
  } catch (error) {
    fail(res, error.message || 'PDF生成失败', 500)
  }
})

router.get('/:applicationNo', optionalAuth, (req, res) => {
  const application = getByApplicationNo(req.params.applicationNo)
  if (!application) return fail(res, '进件不存在', 404)
  ok(res, {
    ...application,
    documents: listDocuments(application.id),
    events: listWorkflowEvents(application.id)
  })
})

router.post('/:applicationNo/submit', optionalAuth, (req, res) => {
  try {
    if (req.body && req.body.meta) syncIntake(req.body, req.user?.id || req.user?.userId)
    const application = submitIntake(req.params.applicationNo, req.user?.id || req.user?.userId)
    ok(res, application, '已提交审核')
  } catch (error) {
    fail(res, error.message || '提交失败', 400)
  }
})

module.exports = router
