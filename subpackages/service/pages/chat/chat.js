const { getFaqs, sendChatMessage } = require('../../api/service')

const SOURCE_MAP = {
  system: '系统欢迎语',
  'local-faq': '常见问题库',
  fallback: '离线提示',
  deepseek: 'AI 智能回复',
  'faq-fallback': '智能降级回复',
  faq: '常见问题库'
}

let msgId = 1

Page({
  data: {
    faqs: [],
    topics: [
      { icon: '📋', title: '材料清单', question: '汽车金融进件需要准备哪些材料？' },
      { icon: '🏦', title: '宁波容易贷', question: '宁波银行容易贷需要什么条件和材料？' },
      { icon: '💰', title: '费用说明', question: '平台是否收取前置费用或保证金？' },
      { icon: '🚗', title: '车抵咨询', question: '车抵贷和不押车有什么区别？' },
      { icon: '🏠', title: '房抵经营贷', question: '工行e抵快贷和宁波银行房抵贷有什么区别？' },
      { icon: '🛡️', title: '延保服务', question: '汽车延保和车险有什么区别？' }
    ],
    messages: [],
    inputValue: '',
    sessionId: '',
    loading: false,
    scrollInto: '',
    userAvatar: '/images/avatar.webp',
    botAvatar: '/images/logo.webp',
    aiOnline: false,
    lastError: ''
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: '智能客服' })
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo?.avatarUrl) {
      this.setData({ userAvatar: userInfo.avatarUrl })
    }
    const { getConfig } = require('../../../../utils/config')
    const online = !getConfig().useMockFallback
    this.setData({ aiOnline: online })
    this.appendMessage({
      role: 'assistant',
      content: online
        ? '您好，我是亮叶企服智能客服（DeepSeek 驱动）。可为您说明材料清单、服务流程、风险提示和合规注意事项。'
        : '您好，我是亮叶企服智能客服。当前为离线演示模式，连接服务端后将启用 AI 智能回复。',
      source: 'system'
    })
    this.loadFaqs()
  },

  appendMessage(msg) {
    const item = {
      ...msg,
      id: msgId++,
      sourceText: SOURCE_MAP[msg.source] || msg.source || '',
      aiBadge: msg.aiBadge || (msg.source === 'deepseek' ? 'DeepSeek' : '')
    }
    const messages = [...this.data.messages, item].slice(-80)
    this.setData({
      messages,
      scrollInto: `msg-${item.id}`
    })
  },

  loadFaqs() {
    getFaqs().then(faqs => this.setData({ faqs: faqs || [] })).catch(() => {
      this.setData({
        faqs: [
          { q: '需要哪些材料？', a: '身份证、流水、收入证明、征信授权等。' },
          { q: '是否收费？', a: '平台不收取前置费用。' }
        ]
      })
    })
  },

  useTopic(e) {
    const question = e.currentTarget.dataset.question
    this.setData({ inputValue: question }, () => this.sendMessage())
  },

  useFaq(e) {
    const question = e.currentTarget.dataset.question
    this.setData({ inputValue: question }, () => this.sendMessage())
  },

  onInput(e) {
    this.setData({ inputValue: e.detail.value })
  },

  callService() {
    wx.makePhoneCall({ phoneNumber: '4008887777' })
  },

  sendMessage() {
    const message = this.data.inputValue.trim()
    if (!message || this.data.loading) return

    this.appendMessage({ role: 'user', content: message })
    this.setData({ inputValue: '', loading: true, scrollInto: 'msg-typing' })

    sendChatMessage({ message, sessionId: this.data.sessionId })
      .then(res => {
        this.setData({ sessionId: res.sessionId })
        this.appendMessage({
          role: 'assistant',
          content: res.answer,
          source: res.source || 'faq',
          aiBadge: res.source === 'deepseek' ? 'DeepSeek' : ''
        })
        if (res.source === 'deepseek') {
          this.setData({ aiOnline: true, lastError: '' })
        }
      })
      .catch((err) => {
        this.setData({ lastError: '连接失败' })
        this.appendMessage({
          role: 'assistant',
          content: '当前网络响应较慢，请稍后重试。您也可以拨打客服电话 400-888-7777，或查看下方常见问题。',
          source: 'fallback'
        })
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  }
})
