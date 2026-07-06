const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

const COMPLIANCE_PROMPT = [
  '你是亮叶企服的智能客服，只能提供金融信息咨询、材料清单、风险提示和流程说明。',
  '平台没有金融牌照，不发放贷款，不承诺放款、额度、利率、审批速度或收益。',
  '不得诱导用户支付前置保证金，不得建议规避监管、伪造材料、征信修复或非法民间借贷。',
  '涉及具体产品条件时，必须说明以持牌机构审核结果和正式合同为准。',
  '回答要简洁、合规、可执行，并优先提示用户保存合同和费用明细。'
].join('\n')

const fallbackFaqs = [
  {
    keyword: '贷款',
    answer: '亮叶企服不发放贷款，仅提供信息咨询与居间撮合服务。具体审批、额度、费用和期限以持牌机构审核及合同为准。'
  },
  {
    keyword: '保证金',
    answer: '请勿向个人账户或不明主体支付任何前置保证金。遇到“先收费后放款”“包过”等宣传，应谨慎核验并保留证据。'
  },
  {
    keyword: '材料',
    answer: '常见材料包括身份证明、营业执照、近6个月经营流水、纳税或开票记录、用途说明和征信授权，具体以机构要求为准。'
  }
]

function fallbackAnswer(message) {
  const matched = fallbackFaqs.find(item => message.includes(item.keyword)) || fallbackFaqs[0]
  return `${matched.answer}\n\n合规提示：本回复仅供信息咨询参考，不构成贷款承诺或金融产品销售。`
}

async function askDeepSeek(message, history = []) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return { answer: fallbackAnswer(message), source: 'faq-fallback' }
  }

  const messages = [
    { role: 'system', content: COMPLIANCE_PROMPT },
    ...history.slice(-8),
    { role: 'user', content: message }
  ]

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages,
      stream: false
    })
  })

  if (!response.ok) {
    return { answer: fallbackAnswer(message), source: 'faq-fallback' }
  }

  const body = await response.json()
  const answer = body.choices && body.choices[0] && body.choices[0].message
    ? body.choices[0].message.content
    : fallbackAnswer(message)
  return { answer, source: 'deepseek' }
}

module.exports = {
  askDeepSeek,
  fallbackAnswer,
  COMPLIANCE_PROMPT
}
