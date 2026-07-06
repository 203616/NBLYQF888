const { post, get } = require('../utils/request')
const { getConfig } = require('../utils/config')
const mock = require('./mock')

function getFaqs() {
  if (getConfig().useMockFallback) {
    return Promise.resolve(mock.serviceFaqs)
  }
  return get('/service/faq')
}

function sendChatMessage(data) {
  if (getConfig().useMockFallback) {
    const question = data.message || ''
    const faq = mock.serviceFaqs.find(item => question.includes(item.q.slice(0, 4))) || mock.serviceFaqs[0]
    return Promise.resolve({
      sessionId: data.sessionId || Date.now(),
      answer: `${faq.a}\n\n温馨提示：本平台仅提供金融信息咨询与居间撮合服务，不承诺审批结果，不收取任何前置保证金。`,
      source: 'local-faq',
      aiEnabled: false
    })
  }
  return post('/service/chat', data).then(res => ({
    ...res,
    aiEnabled: res.source === 'deepseek'
  }))
}

module.exports = {
  getFaqs,
  sendChatMessage
}
