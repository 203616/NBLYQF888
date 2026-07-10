const db = require('../db')
const { deepseek, qwen, anthropic, aiDefaultProvider } = require('../config')

const COMPLIANCE_PROMPT = [
  '你叫"亮叶助手"，是亮叶企服的资深金融顾问，用自然、热情、人性化的语气与客户交流。',
  '用口语化的方式回答，像一位专业且耐心的金融顾问在面对面沟通，不要机械地罗列条款。',
  '当客户问问题时，先理解客户真正的需求（资金用途、紧急程度、资质情况），再针对性地给出建议。',
  '在给出建议时，可以说"我建议您…""您可以考虑…""一般来说…"等自然语气，而不是冷冰冰地列规则。',
  '重要合规红线必须说清，但要用温和的方式表达，例如"提醒您注意，我们平台不直接发放贷款，具体审批结果以持牌机构正式审核为准哦"。',
  '可以在回答末尾主动追问一句，比如"您方便告诉我大概需要多少资金吗？我帮您推荐更合适的方案"，让客户感受到是真人服务。',
  '如果客户情绪激动或不满，先表示理解再解释，例如"我完全理解您的顾虑，我帮您详细说明一下…"。',
  '回答要简洁有用，避免长篇大论，关键信息分点说明即可，每句话控制在30字以内。',
  '提供材料清单、流程说明时，可以用"您需要准备以下几样东西：1…2…"这样自然的口吻。',
  '所有回答必须合法合规：不承诺审批结果、不放贷、不收费、不诱导违规操作。',
  '涉及具体产品条件时，务必加上"以持牌机构审核结果和正式合同为准"。'
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
  { keyword: '贷款', answer: '我们平台不直接发放贷款哈，主要是提供金融信息咨询和居间撮合服务。具体能不能批、额度多少、利率多少，最终还是以持牌金融机构的审核结果和合同为准。您可以告诉我大概需要多少资金，我帮您推荐合适的方案。' },
  { keyword: '保证金', answer: '提醒您注意哦，不要向个人账户或不明平台支付任何前置保证金或"包装费"。如果遇到"先交费后放款""包过"之类的宣传，一定要谨慎核实并保留好证据。有任何疑问随时问我！' },
  { keyword: '材料', answer: '一般需要准备这几样东西：1️⃣ 身份证（法人及配偶） 2️⃣ 营业执照 3️⃣ 近6个月银行流水 4️⃣ 纳税或开票记录 5️⃣ 资金用途说明 6️⃣ 征信授权书。具体以机构要求为准，您办的是哪种业务？我帮您确认具体清单。' }
]

/**
 * 获取 AI 提供商的配置，优先级：数据库 > 环境变量
 */
function getAIProviderConfig(providerName) {
  const configs = {
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY || deepseek.apiKey,
      model: process.env.DEEPSEEK_MODEL || deepseek.model,
      apiUrl: 'https://api.deepseek.com/chat/completions'
    },
    qwen: {
      apiKey: process.env.QWEN_API_KEY || qwen.apiKey,
      model: process.env.QWEN_MODEL || qwen.model,
      apiUrl: (process.env.QWEN_API_BASE || qwen.apiBase).replace(/\/$/, '') + '/chat/completions'
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || anthropic.apiKey,
      model: process.env.ANTHROPIC_MODEL || anthropic.model,
      apiUrl: (process.env.ANTHROPIC_API_BASE || anthropic.apiBase).replace(/\/$/, '') + '/messages'
    }
  }

  // 尝试从数据库覆盖
  try {
    const rows = db.prepare("SELECT key, value FROM config_settings WHERE category = 'integration' AND key LIKE 'ai_%'").all()
    for (const r of rows) {
      const envVar = r.key.replace(/^ai_/, '').toUpperCase()
      if (providerName === 'deepseek') {
        if (r.key === 'ai_deepseek_key') configs.deepseek.apiKey = r.value
        if (r.key === 'ai_deepseek_model') configs.deepseek.model = r.value
      } else if (providerName === 'qwen') {
        if (r.key === 'ai_qwen_key') configs.qwen.apiKey = r.value
        if (r.key === 'ai_qwen_model') configs.qwen.model = r.value
      } else if (providerName === 'anthropic') {
        if (r.key === 'ai_anthropic_key') configs.anthropic.apiKey = r.value
        if (r.key === 'ai_anthropic_model') configs.anthropic.model = r.value
      }
    }
  } catch {}

  return configs[providerName] || configs.deepseek
}

/**
 * 获取当前默认 AI 提供商
 */
function getActiveConfig() {
  const provider = process.env.AI_DEFAULT_PROVIDER || aiDefaultProvider || 'deepseek'
  return { provider, ...getAIProviderConfig(provider) }
}

function getDeepSeekConfig() {
  return getAIProviderConfig('deepseek')
}

function fallbackAnswer(message) {
  const matched = fallbackFaqs.find(item => message.includes(item.keyword)) || fallbackFaqs[0]
  return `${matched.answer}\n\n合规提示：本回复仅供信息咨询参考，不构成贷款承诺或金融产品销售。`
}

/**
 * 通用的 AI API 调用
 */
async function callAI(providerName, messages, options = {}) {
  const provider = getAIProviderConfig(providerName)
  if (!provider.apiKey) return null

  const { temperature = 0.7, maxTokens = 1024 } = options

  try {
    if (providerName === 'anthropic') {
      // Anthropic 格式：需要 system 参数
      const systemMsg = messages.find(m => m.role === 'system')
      const userMessages = messages.filter(m => m.role !== 'system')

      const response = await fetch(provider.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': provider.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: provider.model,
          system: systemMsg?.content || '',
          messages: userMessages.map(m => ({ role: m.role, content: m.content })),
          max_tokens: maxTokens,
          temperature
        }),
        signal: AbortSignal.timeout(30000)
      })

      if (!response.ok) {
        const errText = await response.text().catch(() => '')
        console.warn(`[Anthropic] API error:`, response.status, errText.slice(0, 200))
        return null
      }

      const body = await response.json()
      const content = body.content?.[0]?.text || ''
      return { content, model: body.model || provider.model }

    } else {
      // OpenAI 兼容格式（DeepSeek / 通义千问）
      const response = await fetch(provider.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${provider.apiKey}`
        },
        body: JSON.stringify({
          model: provider.model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false
        }),
        signal: AbortSignal.timeout(30000)
      })

      if (!response.ok) {
        const errText = await response.text().catch(() => '')
        console.warn(`[${providerName}] API error:`, response.status, errText.slice(0, 200))
        return null
      }

      const body = await response.json()
      const content = body.choices?.[0]?.message?.content || ''
      return { content, model: body.model || provider.model }
    }
  } catch (err) {
    console.warn(`[${providerName}] request failed:`, err.message)
    return null
  }
}

/**
 * 智能调用 AI：先主提供商，失败后自动切换备用
 */
async function askAI(message, history = []) {
  const active = getActiveConfig()
  const messages = [
    { role: 'system', content: COMPLIANCE_PROMPT },
    ...history.slice(-8),
    { role: 'user', content: message }
  ]

  // 尝试主提供商
  const result = await callAI(active.provider, messages)
  if (result) return { answer: result.content, source: active.provider, model: result.model }

  // 尝试备用提供商
  const fallbackProviders = ['deepseek', 'qwen', 'anthropic'].filter(p => p !== active.provider)
  for (const provider of fallbackProviders) {
    const backup = await callAI(provider, messages)
    if (backup) return { answer: backup.content, source: `${provider}-fallback`, model: backup.model }
  }

  return { answer: fallbackAnswer(message), source: 'faq-fallback' }
}

/**
 * 保留原 askDeepSeek 接口兼容性
 */
async function askDeepSeek(message, history = []) {
  return askAI(message, history)
}

/**
 * 内容分析：使用默认 AI 提供商
 */
async function analyzeContent(text) {
  const active = getActiveConfig()
  if (!active.apiKey || !text) {
    return {
      category: '一般咨询',
      summary: (text || '').slice(0, 30),
      sentiment: '中性',
      urgency: '低',
      suggestedReply: '',
      source: 'local'
    }
  }

  const messages = [
    { role: 'system', content: CONTENT_ANALYSIS_PROMPT },
    { role: 'user', content: `请分析以下用户消息：\n"""\n${text.slice(0, 2000)}\n"""` }
  ]

  const result = await callAI(active.provider, messages, { temperature: 0.3, maxTokens: 1024 })
  if (!result) return null

  const raw = result.content
  try {
    const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim()
    return { ...JSON.parse(cleaned), source: active.provider }
  } catch {
    return {
      category: '一般咨询',
      summary: text.slice(0, 30),
      sentiment: '中性',
      urgency: '低',
      suggestedReply: raw.slice(0, 200),
      source: `${active.provider}-raw`
    }
  }
}

/**
 * 验证 AI 连接是否可用
 */
async function testConnection(providerName) {
  const provider = providerName || process.env.AI_DEFAULT_PROVIDER || 'deepseek'
  const config = getAIProviderConfig(provider)
  if (!config.apiKey) {
    return { ok: false, message: `未配置 ${provider} API Key`, provider }
  }
  try {
    const result = await callAI(provider, [
      { role: 'system', content: '请用一句话验证连接正常。' },
      { role: 'user', content: '连接测试' }
    ], { maxTokens: 50 })

    if (!result) return { ok: false, message: `API 无响应`, provider }
    return {
      ok: true,
      message: `${provider} API 连接成功`,
      model: result.model || config.model,
      provider
    }
  } catch (err) {
    return { ok: false, message: `连接失败: ${err.message}`, provider }
  }
}

/**
 * 对客服消息进行 AI 增强分析
 */
async function enrichChatMessage(sessionId, messageId, userMessage) {
  try {
    const analysis = await analyzeContent(userMessage)
    if (!analysis) return
    const metaKey = `chat_analysis_${messageId}`
    db.prepare(
      "INSERT OR REPLACE INTO config_settings (category, key, value, description) VALUES (?, ?, ?, ?)"
    ).run('chat_meta', metaKey, JSON.stringify(analysis), `客服消息 ${messageId} 的 AI 分析`)
  } catch (err) {
    console.warn('[AI] enrich failed:', err.message)
  }
}

module.exports = {
  askDeepSeek,
  askAI,
  fallbackAnswer,
  COMPLIANCE_PROMPT,
  analyzeContent,
  testConnection,
  enrichChatMessage,
  getDeepSeekConfig,
  getActiveConfig,
  callAI
}
