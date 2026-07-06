const express = require('express')
const db = require('../db')
const { ok, fail } = require('../utils/response')
const { askDeepSeek } = require('../services/aiChat.service')

const router = express.Router()

const faqs = [
  { q: '亮叶企服是否发放贷款？', a: '不发放贷款。平台定位为金融信息咨询与居间撮合服务，具体审批、额度、费用以持牌机构审核和合同为准。' },
  { q: '是否需要先交保证金？', a: '不建议向个人账户或不明主体支付任何前置费用。如遇“先收费后放款”“包过”等宣传，请保留证据并谨慎处理。' },
  { q: '如何准备企业经营贷材料？', a: '通常需要营业执照、法人身份证明、近6个月流水、纳税或开票记录、用途说明等，具体以机构要求为准。' }
]

router.get('/faq', (req, res) => {
  ok(res, faqs)
})

router.post('/chat', async (req, res, next) => {
  try {
    const { message, sessionId } = req.body
    if (!message || !String(message).trim()) return fail(res, '咨询内容不能为空')

    let currentSessionId = sessionId
    if (!currentSessionId) {
      const info = db.prepare('INSERT INTO service_sessions (title) VALUES (?)').run('智能客服咨询')
      currentSessionId = info.lastInsertRowid
    }

    db.prepare('INSERT INTO service_messages (session_id, role, content) VALUES (?, ?, ?)').run(currentSessionId, 'user', message)
    const history = db.prepare('SELECT role, content FROM service_messages WHERE session_id = ? ORDER BY id DESC LIMIT 8').all(currentSessionId).reverse()
    const result = await askDeepSeek(message, history)
    db.prepare('INSERT INTO service_messages (session_id, role, content) VALUES (?, ?, ?)').run(currentSessionId, 'assistant', result.answer)
    db.prepare("UPDATE service_sessions SET updated_at = datetime('now') WHERE id = ?").run(currentSessionId)

    ok(res, {
      sessionId: currentSessionId,
      answer: result.answer,
      source: result.source
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
