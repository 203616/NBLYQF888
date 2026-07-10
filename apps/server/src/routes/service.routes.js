const express = require('express')
const db = require('../db')
const { ok, fail } = require('../utils/response')
const { askDeepSeek, enrichChatMessage, testConnection, getActiveConfig } = require('../services/aiChat.service')

const router = express.Router()

const faqs = [
  { q: '亮叶企服是否发放贷款？', a: '不发放贷款。平台定位为金融信息咨询与居间撮合服务，具体审批、额度、费用以持牌机构审核和合同为准。' },
  { q: '是否需要先交保证金？', a: '不建议向个人账户或不明主体支付任何前置费用。如遇"先收费后放款""包过"等宣传，请保留证据并谨慎处理。' },
  { q: '如何准备企业经营贷材料？', a: '通常需要营业执照、法人身份证明、近6个月流水、纳税或开票记录、用途说明等，具体以机构要求为准。' }
]

// AI 连接测试
router.get('/test-ai', async (req, res) => {
  try {
    const result = await testConnection(req.query.provider)
    ok(res, result)
  } catch (err) {
    fail(res, err.message)
  }
})

// 获取当前 AI 配置状态
router.get('/ai-config', (req, res) => {
  const config = getActiveConfig()
  ok(res, {
    provider: config.provider,
    model: config.model,
    hasApiKey: !!config.apiKey
  })
})

// 常见问题列表
router.get('/faq', (req, res) => {
  ok(res, faqs)
})

// 获取历史会话列表（按用户）
router.get('/sessions', (req, res) => {
  const { userId, page = 1, pageSize = 20 } = req.query
  const offset = (Math.max(1, Number(page)) - 1) * Number(pageSize)
  const limit = Math.min(100, Math.max(1, Number(pageSize) || 20))

  let where = 'WHERE 1=1'
  const params = []
  if (userId) { where += ' AND user_id = ?'; params.push(Number(userId)) }

  const total = db.prepare(`SELECT COUNT(*) AS count FROM service_sessions ${where}`).get(...params).count
  const list = db.prepare(`SELECT * FROM service_sessions ${where} ORDER BY updated_at DESC LIMIT ? OFFSET ?`).all(limit, offset)
  ok(res, { list, total, page: Number(page), pageSize: limit })
})

// 获取会话消息历史
router.get('/sessions/:sessionId/messages', (req, res) => {
  const { sessionId } = req.params
  const session = db.prepare('SELECT * FROM service_sessions WHERE id = ?').get(sessionId)
  if (!session) return fail(res, '会话不存在', 404)

  const messages = db.prepare('SELECT * FROM service_messages WHERE session_id = ? ORDER BY id ASC').all(sessionId)
  ok(res, { session, messages })
})

// 创建新会话
router.post('/sessions', (req, res) => {
  const { userId, title } = req.body
  const info = db.prepare('INSERT INTO service_sessions (user_id, title) VALUES (?, ?)').run(userId || null, title || '智能客服咨询')
  ok(res, { id: info.lastInsertRowid }, '会话已创建')
})

// 发送消息（核心客服接口）
router.post('/chat', async (req, res, next) => {
  try {
    const { message, sessionId, userId, source } = req.body
    if (!message || !String(message).trim()) return fail(res, '咨询内容不能为空')

    let currentSessionId = sessionId
    if (!currentSessionId) {
      const title = source ? `【${source}】智能客服咨询` : '智能客服咨询'
      const info = db.prepare('INSERT INTO service_sessions (user_id, title) VALUES (?, ?)').run(userId || null, title)
      currentSessionId = info.lastInsertRowid
    }

    // 保存用户消息
    const userMsg = db.prepare('INSERT INTO service_messages (session_id, role, content) VALUES (?, ?, ?)').run(currentSessionId, 'user', message)
    const userMsgId = userMsg.lastInsertRowid

    // 获取最近历史
    const history = db.prepare('SELECT role, content FROM service_messages WHERE session_id = ? ORDER BY id DESC LIMIT 8').all(currentSessionId).reverse()

    // 调用 DeepSeek
    const result = await askDeepSeek(message, history)

    // 保存 AI 回复
    const aiMsg = db.prepare('INSERT INTO service_messages (session_id, role, content) VALUES (?, ?, ?)').run(currentSessionId, 'assistant', result.answer)

    // 更新会话时间戳
    db.prepare("UPDATE service_sessions SET updated_at = datetime('now') WHERE id = ?").run(currentSessionId)

    // 异步进行 AI 内容分析（不阻塞回复）
    enrichChatMessage(currentSessionId, userMsgId, message)

    ok(res, {
      sessionId: currentSessionId,
      answer: result.answer,
      source: result.source,
      userMsgId,
      aiMsgId: aiMsg.lastInsertRowid
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
