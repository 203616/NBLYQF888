const express = require('express')
const db = require('../db')
const { ok, fail } = require('../utils/response')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()
router.use(requireAdmin)

router.get('/dashboard', (req, res) => {
  const todayDemands = db.prepare("SELECT COUNT(*) AS count FROM demands WHERE date(created_at) = date('now')").get().count
  const pendingReports = db.prepare("SELECT COUNT(*) AS count FROM exposure_reports WHERE status = 'pending'").get().count
  const applications = db.prepare("SELECT COUNT(*) AS count FROM finance_applications").get().count
  const intakeApplications = db.prepare("SELECT COUNT(*) AS count FROM intake_applications").get().count
  const intakeAuditing = db.prepare("SELECT COUNT(*) AS count FROM intake_applications WHERE status = 'auditing'").get().count
  const clues = db.prepare("SELECT COUNT(*) AS count FROM clues").get().count
  const warrantyApps = db.prepare("SELECT COUNT(*) AS count FROM warranty_applications").get().count
  const warrantyClaims = db.prepare("SELECT COUNT(*) AS count FROM warranty_claims").get().count
  const valuations = db.prepare("SELECT COUNT(*) AS count FROM vehicle_valuations").get().count
  const pendingFinancePosts = db.prepare("SELECT COUNT(*) AS count FROM finance_circle_posts WHERE review_status = 'pending'").get().count
  ok(res, { todayDemands, pendingReports, applications, intakeApplications, intakeAuditing, clues, warrantyApps, warrantyClaims, valuations, pendingFinancePosts })
})

router.get('/integrations', async (req, res) => {
  const { getIntegrationStatus, getWechatTokenStatus } = require('../services/integrations.service')
  const status = getIntegrationStatus()
  const wechatToken = status.wechat.configured ? await getWechatTokenStatus() : { ok: false, message: '未配置' }
  ok(res, { ...status, wechatToken })
})

router.get('/deploy', (req, res) => {
  const { getDeployStatus } = require('../services/deploy.service')
  const { listActions } = require('../services/deploy-actions.service')
  ok(res, { ...getDeployStatus(), actions: listActions() })
})

router.get('/deploy/qrcode', (req, res) => {
  const path = require('path')
  const fs = require('fs')
  const root = path.resolve(__dirname, '../../../..')
  const file = path.join(root, 'deploy', 'preview-qrcode.jpg')
  if (!fs.existsSync(file)) return fail(res, '暂无预览二维码，请先生成预览', 404)
  res.setHeader('Cache-Control', 'no-cache')
  res.sendFile(file)
})

router.get('/deploy/history', (req, res) => {
  const rows = db.prepare(`
    SELECT id, title, content, type, status, link, created_at AS createdAt
    FROM notifications WHERE type = 'deploy'
    ORDER BY id DESC LIMIT 20
  `).all()
  ok(res, rows)
})

router.get('/deploy/release-checklist', (req, res) => {
  const { runReleaseChecklist } = require('../services/release-checklist.service')
  ok(res, runReleaseChecklist())
})

router.post('/deploy/actions', async (req, res) => {
  const { runDeployAction, runDeployActionStream } = require('../services/deploy-actions.service')
  const action = req.body?.action
  if (!action) return fail(res, '缺少 action 参数', 400)

  const options = {
    desc: req.body?.desc,
    version: req.body?.version,
    robot: req.body?.robot,
    setTrial: req.body?.setTrial
  }

  if (req.query.stream === '1') {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders?.()

    const emit = evt => {
      try {
        res.write(`data: ${JSON.stringify(evt)}\n\n`)
      } catch {
        /* client disconnected */
      }
    }

    try {
      await runDeployActionStream(action, options, emit)
    } catch (err) {
      if (!err.result) emit({ type: 'done', ok: false, message: err.message })
    } finally {
      res.end()
    }
    return
  }

  try {
    const result = runDeployAction(action, options)
    ok(res, result, result.label + '完成')
  } catch (err) {
    if (err.result) {
      return res.status(err.status || 500).json({
        code: err.status || 500,
        message: err.message,
        data: err.result
      })
    }
    return fail(res, err.message || '操作失败', err.status || 500)
  }
})

router.get('/finance-circle/moderation-rules', (req, res) => {
  const { loadModerationRules } = require('../services/finance-circle-moderation.service')
  const { getContentSecurityStatus } = require('../services/aliyun-content-security.service')
  ok(res, { rules: loadModerationRules(), contentSecurity: getContentSecurityStatus() })
})

router.put('/finance-circle/moderation-rules', (req, res) => {
  const { saveModerationRules } = require('../services/finance-circle-moderation.service')
  try {
    const rules = saveModerationRules(req.body || {})
    ok(res, rules, '审核规则已保存')
  } catch (err) {
    fail(res, err.message || '保存失败', 400)
  }
})

router.get('/:resource', (req, res) => {
  const map = {
    products: 'products',
    articles: 'articles',
    demands: 'demands',
    clues: 'clues',
    exposures: 'exposures',
    reports: 'exposure_reports',
    applications: 'finance_applications',
    users: 'users',
    banners: 'banners',
    settings: 'system_settings',
    sources: 'data_sources',
    notifications: 'notifications',
    serviceSessions: 'service_sessions',
    warrantyApplications: 'warranty_applications',
    warrantyClaims: 'warranty_claims',
    vehicleValuations: 'vehicle_valuations',
    salesStaff: 'sales_staff',
    financeCirclePosts: 'finance_circle_posts'
  }
  const table = map[req.params.resource]
  if (!table) return fail(res, '资源不存在', 404)
  const rows = db.prepare(`SELECT * FROM ${table} ORDER BY rowid DESC LIMIT 200`).all()
  if (req.params.resource === 'financeCirclePosts') {
    const { buildPublicUrl } = require('../services/upload.service')
    const { publicBaseUrl } = require('../config')
    const normalized = rows.map(row => {
      let imageUrls = []
      try {
        const raw = row.images ? JSON.parse(row.images) : []
        imageUrls = (Array.isArray(raw) ? raw : []).map(url => {
          if (!url || typeof url !== 'string') return url
          if (url.startsWith('http://') || url.startsWith('https://')) return url
          if (url.startsWith('/uploads/')) return buildPublicUrl(url.replace(/^\/uploads\//, ''))
          if (publicBaseUrl && url.startsWith('/')) return `${publicBaseUrl.replace(/\/$/, '')}${url}`
          return url
        })
      } catch {
        imageUrls = []
      }
      return { ...row, image_urls: imageUrls }
    })
    return ok(res, normalized)
  }
  ok(res, rows)
})

router.patch('/:resource/:id', async (req, res) => {
  const map = {
    demands: 'demands',
    clues: 'clues',
    reports: 'exposure_reports',
    applications: 'finance_applications',
    products: 'products',
    articles: 'articles',
    exposures: 'exposures',
    warrantyApplications: 'warranty_applications',
    warrantyClaims: 'warranty_claims',
    salesStaff: 'sales_staff',
    financeCirclePosts: 'finance_circle_posts'
  }
  const table = map[req.params.resource]
  if (!table) return fail(res, '资源不支持更新', 404)
  const body = { ...req.body }
  const prevRow = req.params.resource === 'financeCirclePosts'
    ? db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id)
    : null
  if (req.params.resource === 'financeCirclePosts' && body.review_status) {
    body.reviewed_at = new Date().toISOString()
  }
  const entries = Object.entries(body).filter(([key]) => /^[a-zA-Z_]+$/.test(key))
  if (!entries.length) return fail(res, '没有可更新字段')
  const sets = entries.map(([key]) => `${key} = ?`).join(', ')
  db.prepare(`UPDATE ${table} SET ${sets} WHERE id = ?`).run(...entries.map(([, value]) => value), req.params.id)

  if (
    prevRow &&
    body.review_status &&
    prevRow.review_status !== body.review_status &&
    ['approved', 'rejected'].includes(body.review_status)
  ) {
    try {
      const { notifyFinancePostReviewResult } = require('../services/finance-circle-notification.service')
      await notifyFinancePostReviewResult({
        postId: prevRow.id,
        userName: prevRow.user_name,
        authorPhone: prevRow.author_phone,
        reviewStatus: body.review_status,
        reviewNote: body.review_note || prevRow.review_note || '',
        contentPreview: prevRow.content || ''
      })
    } catch (err) {
      console.warn('finance review notification failed', err.message)
    }
  }

  ok(res, true, '已更新')
})

module.exports = router
