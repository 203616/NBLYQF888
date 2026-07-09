const express = require('express')
const db = require('../db')
const { ok, fail } = require('../utils/response')
const { requireAdmin } = require('../middleware/auth')
const { logAudit } = require('../services/audit.service')

const router = express.Router()
router.use(requireAdmin)

// =============================================
// 新建/专用路由（必须在 /:resource 泛化路由之前）
// =============================================

// 审计日志查询
router.get('/audit-logs', (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20))
  const offset = (page - 1) * pageSize
  const action = req.query.action || ''
  const keyword = req.query.keyword || ''

  let where = 'WHERE 1=1'
  const params = []
  if (action) { where += ' AND action = ?'; params.push(action) }
  if (keyword) { where += ' AND (admin_name LIKE ? OR detail LIKE ? OR resource_type LIKE ?)'; const k = `%${keyword}%`; params.push(k, k, k) }

  const total = db.prepare(`SELECT COUNT(*) AS count FROM audit_logs ${where}`).get(...params).count
  const list = db.prepare(`SELECT * FROM audit_logs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, pageSize, offset)
  ok(res, { list, total, page, pageSize })
})

// 系统状态监控
router.get('/system-status', (req, res) => {
  try {
    const dbSize = db.prepare("SELECT page_count * page_size AS size FROM pragma_page_count, pragma_page_size").get().size
    const tableCount = db.prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").get().count
    const totalRecords = []
    const tables = ['users', 'products', 'articles', 'demands', 'clues', 'intake_applications', 'banners', 'exposures', 'finance_circle_posts', 'notifications']
    for (const t of tables) {
      try { totalRecords.push({ table: t, count: db.prepare(`SELECT COUNT(*) AS c FROM ${t}`).get().c }) } catch (e) {}
    }
    ok(res, {
      nodeVersion: process.version,
      dbSize,
      tableCount,
      uptime: Math.floor(process.uptime()),
      memoryUsage: process.memoryUsage().rss,
      totalRecords
    })
  } catch (e) {
    fail(res, '系统状态查询失败: ' + e.message)
  }
})

// 系统配置管理
router.get('/config-settings', (req, res) => {
  const category = req.query.category || ''
  const where = category ? 'WHERE category = ?' : ''
  const params = category ? [category] : []
  const list = db.prepare(`SELECT * FROM config_settings ${where} ORDER BY category, id`).all(...params)
  ok(res, { list })
})

router.patch('/config-settings/:id', (req, res) => {
  const { id } = req.params
  const { value } = req.body
  if (value === undefined) return fail(res, '缺少 value 参数')
  db.prepare("UPDATE config_settings SET value = ?, updated_at = datetime('now') WHERE id = ?").run(value, id)
  ok(res, true, '配置已更新')
})

router.get('/export-records', (req, res) => {
  const limit = Math.min(50, Number(req.query.limit) || 20)
  const list = db.prepare('SELECT * FROM export_records ORDER BY created_at DESC LIMIT ?').all(limit)
  ok(res, { list })
})

// 数据导出
router.get('/export/:resource', (req, res) => {
  const { resource } = req.params
  const allowedTables = ['products', 'articles', 'demands', 'clues', 'users', 'banners', 'exposures', 'notifications', 'finance_circle_posts', 'intake_applications']
  if (!allowedTables.includes(resource)) return fail(res, '不支持的导出类型', 400)
  try {
    const data = db.prepare(`SELECT * FROM ${resource} ORDER BY id DESC`).all()
    const adminName = req.user?.username || req.user?.name || 'admin'
    db.prepare(
      'INSERT INTO export_records (admin_id, resource_type, file_name, record_count, status) VALUES (?, ?, ?, ?, ?)'
    ).run(req.user.id, resource, `${resource}_${Date.now()}.json`, data.length, 'completed')
    logAudit(req.user.id, adminName, 'export', resource, '', `导出了 ${data.length} 条记录`, req.ip)
    ok(res, data)
  } catch (e) {
    fail(res, '导出失败: ' + e.message)
  }
})

// =============================================
// 仪表盘 — 运营概览
// =============================================
router.get('/dashboard', (req, res) => {
  // 批量统计：一次查询获取所有计数
  const batch = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM demands WHERE date(created_at) = date('now')) AS todayDemands,
      (SELECT COUNT(*) FROM exposure_reports WHERE status = 'pending') AS pendingReports,
      (SELECT COUNT(*) FROM finance_applications) AS applications,
      (SELECT COUNT(*) FROM intake_applications) AS intakeApplications,
      (SELECT COUNT(*) FROM intake_applications WHERE status = 'auditing') AS intakeAuditing,
      (SELECT COUNT(*) FROM clues) AS clues,
      (SELECT COUNT(*) FROM warranty_applications) AS warrantyApps,
      (SELECT COUNT(*) FROM warranty_claims) AS warrantyClaims,
      (SELECT COUNT(*) FROM vehicle_valuations) AS valuations,
      (SELECT COUNT(*) FROM finance_circle_posts WHERE review_status = 'pending') AS pendingFinancePosts
  `).get()

  // 并行获取 inbox 数据
  const financeInbox = db.prepare(`
    SELECT id, user_name AS userName, content, created_at AS createdAt
    FROM finance_circle_posts
    WHERE review_status = 'pending'
    ORDER BY id DESC LIMIT 8
  `).all().map(row => ({
    type: 'finance_post',
    id: row.id,
    title: row.userName || '匿名用户',
    desc: String(row.content || '').slice(0, 80) || '（无文字内容）',
    createdAt: row.createdAt
  }))

  const intakeInbox = db.prepare(`
    SELECT id, application_no AS no, product_name AS title, status
    FROM intake_applications
    WHERE status = 'auditing'
    ORDER BY id DESC LIMIT 8
  `).all().map(row => ({
    type: 'intake',
    id: row.id,
    title: row.no || row.title || '进件',
    desc: `产品: ${row.title || ''} | 状态: ${row.status}`,
    no: row.no
  }))

  const auditCount = db.prepare('SELECT COUNT(*) AS c FROM audit_logs WHERE date(created_at) = date(\'now\')').get().c || 0

  ok(res, {
    metrics: [
      { label: '今日需求', value: batch.todayDemands, icon: '🤝' },
      { label: '汽车线索', value: batch.clues, icon: '🚗' },
      { label: '进件总数', value: batch.intakeApplications, icon: '📋' },
      { label: '审核中进件', value: batch.intakeAuditing, icon: '⏳' },
      { label: '融资申请', value: batch.applications, icon: '💰' },
      { label: '待审举报', value: batch.pendingReports, icon: '⚠️' },
      { label: '待审融圈', value: batch.pendingFinancePosts, icon: '💬' },
      { label: '今日操作', value: auditCount, icon: '📝' }
    ],
    inbox: [...financeInbox, ...intakeInbox].slice(0, 12),
    metadata: {
      serverUptime: Math.floor(process.uptime()),
      nodeVersion: process.version
    }
  })
})

// =============================================
// 集成配置
// =============================================
router.get('/integrations', async (req, res, next) => {
  try {
    const { getIntegrationStatus, getWechatTokenStatus } = require('../services/integrations.service')
    const status = getIntegrationStatus()
    const wechatToken = await getWechatTokenStatus()
    ok(res, { ...status, wechatToken })
  } catch (e) {
    next(e)
  }
})

// =============================================
// 集成配置保存（写入 config_settings 表）
// =============================================
router.post('/integrations/save', (req, res) => {
  const allowedKeys = [
    'integration_aliyun_key_id',
    'integration_aliyun_key_secret',
    'integration_wechat_appid',
    'integration_wechat_secret',
    'integration_template_intake_audit',
    'integration_template_intake_disburse',
    'integration_template_finance_review',
    'integration_deepseek_key',
    'integration_deepseek_model',
    'integration_cdn_base_url',
    'integration_ocr_endpoint'
  ]
  const body = req.body || {}
  const upsert = db.prepare(
    'INSERT OR REPLACE INTO config_settings (category, key, value, description, updated_at) VALUES (?, ?, ?, ?, datetime(\'now\'))'
  )
  let count = 0
  for (const [key, value] of Object.entries(body)) {
    if (!allowedKeys.includes(key)) continue
    const descMap = {
      integration_aliyun_key_id: '阿里云 AccessKey ID',
      integration_aliyun_key_secret: '阿里云 AccessKey Secret',
      integration_wechat_appid: '微信 AppID',
      integration_wechat_secret: '微信 Secret',
      integration_template_intake_audit: '进件审核通知模板 ID',
      integration_template_intake_disburse: '进件放款通知模板 ID',
      integration_template_finance_review: '融圈审核结果模板 ID',
      integration_deepseek_key: 'DeepSeek API Key',
      integration_deepseek_model: 'DeepSeek 模型',
      integration_cdn_base_url: 'CDN 基础 URL',
      integration_ocr_endpoint: '阿里云 OCR 端点'
    }
    upsert.run('integration', key, String(value ?? ''), descMap[key] || '')
    count++
  }
  logAudit(req.user.id, req.user.username || 'admin', 'update', 'integrations', '', `更新了 ${count} 项集成配置`)
  ok(res, { count }, `已保存 ${count} 项配置`)
})

// =============================================
// 集成配置读取（从 config_settings 表）
// =============================================
router.get('/integrations/config', (req, res) => {
  const rows = db.prepare("SELECT key, value FROM config_settings WHERE category = 'integration'").all()
  const config = {}
  for (const row of rows) {
    config[row.key] = row.value
  }
  ok(res, config)
})

// =============================================
// 部署相关
// =============================================
router.get('/deploy', (req, res) => {
  // (existing implementation unchanged)
  const deployHistory = db.prepare('SELECT * FROM notifications WHERE type = ? ORDER BY id DESC LIMIT 1').get('deploy')
  const ciStatus = ['docker-ci', 'preview-ci', 'cdn-ci'].map(type => {
    const row = db.prepare('SELECT * FROM notifications WHERE type = ? ORDER BY id DESC LIMIT 1').get(type)
    return { type, status: row?.status || 'unknown', message: row?.content?.slice(0, 100) || '无记录', updatedAt: row?.created_at || '' }
  })
  ok(res, {
    lastDeploy: deployHistory ? { id: deployHistory.id, content: deployHistory.content, status: deployHistory.status, createdAt: deployHistory.created_at } : null,
    ciStatus
  })
})

router.get('/deploy/qrcode', (req, res) => {
  // (existing implementation unchanged)
  const path = require('path')
  const fs = require('fs')
  const qrPath = path.join(require('../config').uploadsDir, 'preview-qrcode.jpg')
  if (fs.existsSync(qrPath)) return res.sendFile(qrPath)
  res.status(404).json({ code: 404, message: '预览二维码尚未生成' })
})

router.get('/deploy/history', (req, res) => {
  // (existing implementation unchanged)
  const list = db.prepare("SELECT * FROM notifications WHERE type = 'deploy' ORDER BY id DESC LIMIT 20").all().map(r => ({
    id: r.id, content: r.content?.slice(0, 200) || '', status: r.status, createdAt: r.created_at
  }))
  ok(res, list)
})

router.get('/deploy/release-checklist', (req, res) => {
  // (existing implementation unchanged)
  const checks = []
  const { default: s } = JSON.parse(JSON.stringify({})) // dummy
  const fs = require('fs')
  const path = require('path')
  const root = path.resolve(__dirname, '..', '..', '..', '..')

  checks.push({ key: 'env', label: '环境变量模板', status: 'passed', detail: '.env 已配置' })
  checks.push({ key: 'db', label: '数据库就绪', status: db ? 'passed' : 'failed', detail: db ? `数据库已连接` : '数据库连接异常' })
  checks.push({ key: 'admin', label: '管理后台 UI', status: fs.existsSync(path.join(root, 'apps/admin/dist/index.html')) ? 'passed' : 'warned', detail: fs.existsSync(path.join(root, 'apps/admin/dist/index.html')) ? '管理后台已构建' : '管理后台未构建，请运行 pnpm build:admin' })
  checks.push({ key: 'images', label: '主包图片 < 150KB', status: 'warned', detail: '请在提审前使用 pnpm optimize:images' })
  checks.push({ key: 'assets', label: '部署资源完整性', status: 'warned', detail: '运行 pnpm verify:assets 检查' })

  ok(res, { checks, updatedAt: new Date().toISOString() })
})

router.post('/deploy/actions', async (req, res) => {
  const { action, setTrial } = req.body
  if (req.query.stream === '1') {
    const { runDeployActionStream } = require('../services/deploy-actions.service')
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    })
    try {
      await runDeployActionStream(action, req.user.id, req.user.username || 'admin', (event) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`)
      }, setTrial)
    } catch (err) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`)
    }
    res.end()
  } else {
    const { runDeployAction } = require('../services/deploy-actions.service')
    try {
      const result = await runDeployAction(action, req.user.id, req.user.username || 'admin', setTrial)
      ok(res, result, '操作已执行')
    } catch (err) {
      fail(res, err.message)
    }
  }
})

// =============================================
// 融圈审核规则
// =============================================
router.get('/finance-circle/moderation-rules', (req, res) => {
  // (existing implementation unchanged)
  const rules = db.prepare("SELECT value FROM system_settings WHERE key = 'finance_moderation_rules'").get()
  const parsed = rules ? JSON.parse(rules.value) : {
    enabled: true,
    textOnlyAutoApprove: true,
    textMaxLength: 200,
    requireImageReview: false,
    blockedKeywords: ['诈骗', '高利贷', '套现', '洗钱', '赌博'],
    keywordAction: 'reject',
    aliyunTextAction: 'review',
    aliyunImageAction: 'review'
  }
  ok(res, parsed)
})

router.put('/finance-circle/moderation-rules', (req, res) => {
  // (existing implementation unchanged)
  db.prepare("INSERT OR REPLACE INTO system_settings (key, value) VALUES ('finance_moderation_rules', ?)").run(JSON.stringify(req.body))
  ok(res, true, '审核规则已保存')
})

// =============================================
// DeepSeek AI 连接测试
// =============================================
router.get('/ai/test', async (req, res, next) => {
  try {
    const { testConnection } = require('../services/aiChat.service')
    const result = await testConnection()
    ok(res, result)
  } catch (e) {
    next(e)
  }
})

// =============================================
// 客服会话详情（含消息预览，用于管理后台）
// =============================================
router.get('/service-sessions/:sessionId/messages', (req, res) => {
  const { sessionId } = req.params
  const session = db.prepare('SELECT * FROM service_sessions WHERE id = ?').get(sessionId)
  if (!session) return fail(res, '会话不存在', 404)
  const messages = db.prepare('SELECT * FROM service_messages WHERE session_id = ? ORDER BY id ASC').all(sessionId)
  ok(res, { session, messages })
})

// 获取客服对话的 AI 分析结果
router.get('/chat-analysis/:messageId', (req, res) => {
  const { messageId } = req.params
  const row = db.prepare("SELECT value FROM config_settings WHERE category = 'chat_meta' AND key = ?").get(`chat_analysis_${messageId}`)
  if (!row) return fail(res, '未找到分析结果', 404)
  try {
    ok(res, JSON.parse(row.value))
  } catch {
    ok(res, { raw: row.value })
  }
})

// =============================================
// RBAC：管理员管理
// =============================================
const bcrypt = require('bcryptjs')

router.get('/admin-users', (req, res) => {
  const list = db.prepare(`
    SELECT au.id, au.username, au.name, au.role, au.status, au.last_login_at, au.created_at,
      GROUP_CONCAT(DISTINCT r.name) AS role_names,
      GROUP_CONCAT(DISTINCT r.id) AS role_ids
    FROM admin_users au
    LEFT JOIN admin_role_assignments ara ON ara.admin_id = au.id
    LEFT JOIN roles r ON r.id = ara.role_id
    GROUP BY au.id
    ORDER BY au.id
  `).all()
  ok(res, list.map(a => ({
    ...a,
    roleNames: a.role_names ? a.role_names.split(',') : [],
    roleIds: a.role_ids ? a.role_ids.split(',').map(Number) : []
  })))
})

router.post('/admin-users', (req, res) => {
  const { username, password, name, roleIds } = req.body
  if (!username || !password) return fail(res, '用户名和密码必填')
  const existing = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(username)
  if (existing) return fail(res, '用户名已存在')
  const hash = bcrypt.hashSync(password, 10)
  const result = db.prepare('INSERT INTO admin_users (username, password_hash, name) VALUES (?, ?, ?)').run(username, hash, name || '')
  const adminId = result.lastInsertRowid
  if (roleIds && Array.isArray(roleIds)) {
    const assign = db.prepare('INSERT OR IGNORE INTO admin_role_assignments (admin_id, role_id) VALUES (?, ?)')
    for (const rid of roleIds) assign.run(adminId, rid)
  }
  ok(res, true, '管理员已创建')
})

router.patch('/admin-users/:id', (req, res) => {
  const { id } = req.params
  const { password, name, status, roleIds } = req.body
  const sets = []
  const params = []
  if (password) { sets.push('password_hash = ?'); params.push(bcrypt.hashSync(password, 10)) }
  if (name !== undefined) { sets.push('name = ?'); params.push(name) }
  if (status) { sets.push('status = ?'); params.push(status) }
  if (sets.length > 0) {
    db.prepare(`UPDATE admin_users SET ${sets.join(', ')} WHERE id = ?`).run(...params, id)
  }
  if (roleIds && Array.isArray(roleIds)) {
    db.prepare('DELETE FROM admin_role_assignments WHERE admin_id = ?').run(id)
    const assign = db.prepare('INSERT OR IGNORE INTO admin_role_assignments (admin_id, role_id) VALUES (?, ?)')
    for (const rid of roleIds) assign.run(id, rid)
  }
  ok(res, true, '管理员已更新')
})

router.delete('/admin-users/:id', (req, res) => {
  const { id } = req.params
  if (Number(id) === 1) return fail(res, '不能删除超级管理员')
  db.prepare('DELETE FROM admin_users WHERE id = ?').run(id)
  ok(res, true, '管理员已删除')
})

// =============================================
// RBAC：角色管理
// =============================================
router.get('/roles', (req, res) => {
  const roles = db.prepare(`
    SELECT r.*, GROUP_CONCAT(rp.permission_code) AS perm_codes
    FROM roles r
    LEFT JOIN role_permissions rp ON rp.role_id = r.id
    GROUP BY r.id ORDER BY r.id
  `).all()
  ok(res, roles.map(r => ({
    ...r,
    permissions: r.perm_codes ? r.perm_codes.split(',') : []
  })))
})

router.post('/roles', (req, res) => {
  const { name, description, permissions } = req.body
  if (!name) return fail(res, '角色名必填')
  const result = db.prepare('INSERT INTO roles (name, description) VALUES (?, ?)').run(name, description || '')
  const roleId = result.lastInsertRowid
  if (permissions && Array.isArray(permissions)) {
    const insert = db.prepare('INSERT OR IGNORE INTO role_permissions (role_id, permission_code) VALUES (?, ?)')
    for (const code of permissions) insert.run(roleId, code)
  }
  ok(res, true, '角色已创建')
})

router.patch('/roles/:id', (req, res) => {
  const { id } = req.params
  const { name, description, permissions } = req.body
  if (name) db.prepare('UPDATE roles SET name = ? WHERE id = ?').run(name, id)
  if (description !== undefined) db.prepare('UPDATE roles SET description = ? WHERE id = ?').run(description, id)
  if (permissions && Array.isArray(permissions)) {
    db.prepare('DELETE FROM role_permissions WHERE role_id = ?').run(id)
    const insert = db.prepare('INSERT OR IGNORE INTO role_permissions (role_id, permission_code) VALUES (?, ?)')
    for (const code of permissions) insert.run(id, code)
  }
  ok(res, true, '角色已更新')
})

router.delete('/roles/:id', (req, res) => {
  const { id } = req.params
  const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(id)
  if (role?.is_system) return fail(res, '系统角色不能删除')
  db.prepare('DELETE FROM roles WHERE id = ?').run(id)
  ok(res, true, '角色已删除')
})

// =============================================
// RBAC：获取当前用户权限
// =============================================
router.get('/my-permissions', (req, res) => {
  const perms = require('../services/rbac.service').getUserPermissions(req.user.id)
  ok(res, { permissions: perms })
})

// =============================================
// 通用 CRUD 路由（必须放在最后）
// =============================================

// 元数据查询：枚举值、分类、统计
router.get('/meta/:type', (req, res) => {
  const { type } = req.params
  try {
    switch (type) {
      case 'product-categories': {
        const rows = db.prepare("SELECT DISTINCT category FROM products ORDER BY category").all()
        return ok(res, rows.map(r => r.category))
      }
      case 'product-tags': {
        const rows = db.prepare("SELECT DISTINCT tag FROM product_tags ORDER BY tag").all()
        return ok(res, rows.map(r => r.tag))
      }
      case 'article-categories': {
        const rows = db.prepare("SELECT DISTINCT category FROM articles WHERE category IS NOT NULL AND category != '' ORDER BY category").all()
        return ok(res, rows.map(r => r.category))
      }
      case 'exposure-types': {
        const rows = db.prepare("SELECT DISTINCT type FROM exposures ORDER BY type").all()
        return ok(res, rows.map(r => r.type))
      }
      case 'exposure-statuses': {
        return ok(res, ['pending', 'verified', 'dismissed'])
      }
      case 'report-statuses': {
        return ok(res, ['pending', 'confirmed', 'dismissed'])
      }
      case 'user-statuses': {
        return ok(res, ['active', 'disabled', 'banned'])
      }
      case 'product-statuses': {
        return ok(res, ['published', 'draft', 'archived'])
      }
      case 'article-statuses': {
        return ok(res, ['published', 'draft', 'archived'])
      }
      default:
        return fail(res, '不支持的元数据类型', 404)
    }
  } catch (e) {
    fail(res, '查询失败: ' + e.message)
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
  try {
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
  } catch (e) {
    fail(res, '查询失败: ' + e.message, 500)
  }
})

// =============================================
// 通用新增路由 POST /:resource（在 PATCH 之前）
// =============================================
const INSERTABLE_TABLES = [
  'demands', 'clues', 'exposures', 'reports', 'applications',
  'products', 'articles', 'banners', 'users', 'sources',
  'notifications', 'warrantyApplications', 'warrantyClaims',
  'salesStaff', 'vehicleValuations', 'financeCirclePosts'
]

const TABLE_NAME_MAP = {
  products: 'products',
  articles: 'articles',
  demands: 'demands',
  clues: 'clues',
  exposures: 'exposures',
  reports: 'exposure_reports',
  applications: 'finance_applications',
  users: 'users',
  banners: 'banners',
  sources: 'data_sources',
  notifications: 'notifications',
  serviceSessions: 'service_sessions',
  warrantyApplications: 'warranty_applications',
  warrantyClaims: 'warranty_claims',
  salesStaff: 'sales_staff',
  vehicleValuations: 'vehicle_valuations',
  financeCirclePosts: 'finance_circle_posts'
}

router.post('/:resource', (req, res) => {
  const resource = req.params.resource
  if (!INSERTABLE_TABLES.includes(resource)) return fail(res, '不支持新增此资源', 400)
  const table = TABLE_NAME_MAP[resource]
  if (!table) return fail(res, '资源不存在', 404)

  const body = req.body || {}
  const keys = Object.keys(body).filter(k => /^[a-zA-Z_]+$/.test(k) && k !== 'id' && !k.startsWith('created_at'))
  if (!keys.length) return fail(res, '没有可新增字段')

  const placeholders = keys.map(() => '?').join(', ')
  const values = keys.map(k => body[k])
  try {
    const result = db.prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`).run(...values)
    logAudit(req.user.id, req.user.username || req.user.name || 'admin', 'create', resource, String(result.lastInsertRowid), `新增记录`)
    ok(res, { id: result.lastInsertRowid }, '已创建')
  } catch (e) {
    fail(res, '新增失败: ' + e.message)
  }
})

router.patch('/:resource/:id', async (req, res, next) => {
  try {
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
      financeCirclePosts: 'finance_circle_posts',
      users: 'users',
      banners: 'banners',
      sources: 'data_sources',
      notifications: 'notifications',
      settings: 'system_settings',
      vehicleValuations: 'vehicle_valuations'
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
  } catch (e) {
    next(e)
  }
})

module.exports = router
