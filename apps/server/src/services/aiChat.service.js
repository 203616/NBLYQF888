const db = require('../db')

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

const COMPLIANCE_PROMPT = [
  '你是亮叶企服的智能客服，只能提供金融信息咨询、材料清单、风险提示和流程说明。',
  '平台没有金融牌照，不发放贷款，不承诺放款、额度、利率、审批速度或收益。',
  '不得诱导用户支付前置保证金，不得建议规避监管、伪造材料、征信修复或非法民间借贷。',
  '涉及具体产品条件时，必须说明以持牌机构审核结果和正式合同为准。',
  '回答要简洁、合规、可执行，并优先提示用户保存合同和费用明细。'
].join('\n')

const CONTENT_ANALYSIS_PROMPT = [
  '你是一个金融内容分析助手。请根据用户输入的文本，完成以下任务：',
  '1. 内容分类：判断属于以下哪一类（产品咨询、进件问题、投诉建议、投诉举报、一般咨询、其他）',
  '2. 内容摘要：用一句话概括核心问题（不超过30字）',
  '3. 情感倾向：判断用户情绪（正面/中性/负面/愤怒）',
  '4. 紧急程度：判断紧急程度（低/中/高/紧急）',
  '5. 建议回复：给出一个合规的回复建议（不超过200字）',
  '请以 JSON 格式返回，key 使用驼峰命名，不要添加 markdown 代码块标记。'
].join('\n')

const fallbackFaqs = [
  {
    keyword: '贷款',
    answer: '亮叶企服不发放贷款，仅提供信息咨询与居间撮合服务。具体审批、额度、费用和期限以持牌机构审核及合同为准。'
  },
  {
    keyword: '保证金',
    answer: '请勿向个人账户或不明主体支付任何前置保证金。遇到"先收费后放款""包过"等宣传，应谨慎核验并保留证据。'
  },
  {
    keyword: '材料',
    answer: '常见材料包括身份证明、营业执照、近6个月经营流水、纳税或开票记录、用途说明和征信授权，具体以机构要求为准。'
  }
]

/**
 * 获取 DeepSeek 配置，优先级：数据库 config_settings > 环境变量
 */
function getDeepSeekConfig() {
  let apiKey = process.env.DEEPSEEK_API_KEY || ''
  let model = process.env.DEEPSEEK_MODEL || 'deepseek-chat'
  try {
    const row = db.prepare("SELECT key, value FROM config_settings WHERE category = 'integration' AND key IN ('integration_deepseek_key', 'integration_deepseek_model')").all()
    for (const r of row) {
      if (r.key === 'integration_deepseek_key' && r.value) apiKey = r.value
      if (r.key === 'integration_deepseek_model' && r.value) model = r.value
    }
  } catch {}
  return { apiKey, model }
}

function fallbackAnswer(message) {
  const matched = fallbackFaqs.find(item => message.includes(item.keyword)) || fallbackFaqs[0]
  return `${matched.answer}\n\n合规提示：本回复仅供信息咨询参考，不构成贷款承诺或金融产品销售。`
}

/**
 * 调用 DeepSeek API（非流式）
 */
async function askDeepSeek(message, history = []) {
  const { apiKey, model } = getDeepSeekConfig()
  if (!apiKey) {
    return { answer: fallbackAnswer(message), source: 'faq-fallback' }
  }

  const messages = [
    { role: 'system', content: COMPLIANCE_PROMPT },
    ...history.slice(-8),
    { role: 'user', content: message }
  ]

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: false
      }),
      signal: AbortSignal.timeout(30000)
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      console.warn('[DeepSeek] API error:', response.status, errText.slice(0, 200))
      return { answer: fallbackAnswer(message), source: 'faq-fallback' }
    }

    const body = await response.json()
    const answer = body.choices && body.choices[0] && body.choices[0].message
      ? body.choices[0].message.content
      : fallbackAnswer(message)
    return { answer, source: 'deepseek' }
  } catch (err) {
    console.warn('[DeepSeek] request failed:', err.message)
    return { answer: fallbackAnswer(message), source: 'faq-fallback' }
  }
}

/**
 * 内容分析：使用 DeepSeek 对用户消息进行智能分析
 */
async function analyzeContent(text) {
  const { apiKey, model } = getDeepSeekConfig()
  if (!apiKey || !text) {
    return {
      category: '一般咨询',
      summary: (text || '').slice(0, 30),
      sentiment: '中性',
      urgency: '低',
      suggestedReply: '',
      source: 'local'
    }
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: CONTENT_ANALYSIS_PROMPT },
          { role: 'user', content: `请分析以下用户消息：\n"""\n${text.slice(0, 2000)}\n"""` }
        ],
        temperature: 0.3,
        max_tokens: 1024,
        stream: false
      }),
      signal: AbortSignal.timeout(15000)
    })

    if (!response.ok) {
      console.warn('[DeepSeek-Analysis] API error:', response.status)
      return null
    }

    const body = await response.json()
    const raw = body.choices && body.choices[0] && body.choices[0].message
      ? body.choices[0].message.content
      : ''

    // 尝试解析 JSON
    try {
      const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim()
      return { ...JSON.parse(cleaned), source: 'deepseek' }
    } catch {
      return {
        category: '一般咨询',
        summary: text.slice(0, 30),
        sentiment: '中性',
        urgency: '低',
        suggestedReply: raw.slice(0, 200),
        source: 'deepseek-raw'
      }
    }
  } catch (err) {
    console.warn('[DeepSeek-Analysis] request failed:', err.message)
    return null
  }
}

/**
 * 验证 DeepSeek 连接是否可用（用于管理后台集成检测）
 */
async function testConnection() {
  const { apiKey, model } = getDeepSeekConfig()
  if (!apiKey) {
    return { ok: false, message: '未配置 DeepSeek API Key' }
  }
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: '请用一句话验证连接正常。' },
          { role: 'user', content: '连接测试' }
        ],
        max_tokens: 50,
        stream: false
      }),
      signal: AbortSignal.timeout(10000)
    })
    if (!response.ok) {
      return { ok: false, message: `API 返回 ${response.status}`, status: response.status }
    }
    const body = await response.json()
    return {
      ok: true,
      message: 'DeepSeek API 连接成功',
      model: body.model || model,
      usage: body.usage || null
    }
  } catch (err) {
    return { ok: false, message: `连接失败: ${err.message}` }
  }
}

/**
 * 对客服消息进行 AI 增强分析（接在 chat 回复后异步执行）
 */
async function enrichChatMessage(sessionId, messageId, userMessage) {
  try {
    const analysis = await analyzeContent(userMessage)
    if (!analysis) return

    // 将分析结果存储到消息记录的 metadata 字段（暂存到 config_settings 表作为临时方案，
    // 实际上应该扩展 service_messages 表结构，这里使用 JSON 字段存储在 content 旁的备注）
    // 但为了最小改动，我们用 config_settings 暂存分析结果
    const metaKey = `chat_analysis_${messageId}`
    db.prepare(
      "INSERT OR REPLACE INTO config_settings (category, key, value, description) VALUES (?, ?, ?, ?)"
    ).run('chat_meta', metaKey, JSON.stringify(analysis), `客服消息 ${messageId} 的 AI 分析`)
  } catch (err) {
    console.warn('[DeepSeek] enrich failed:', err.message)
  }
}

module.exports = {
  askDeepSeek,
  fallbackAnswer,
  COMPLIANCE_PROMPT,
  analyzeContent,
  testConnection,
  enrichChatMessage,
  getDeepSeekConfig
}
