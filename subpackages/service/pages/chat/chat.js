const { getFaqs, sendChatMessage } = require('../../api/service')
const { getConfig } = require('../../../../utils/config')

const SOURCE_MAP = {
  system: '亮叶助手（系统消息）',
  'local-faq': '常见问题库（离线）',
  fallback: '离线提示',
  deepseek: 'DeepSeek AI 智能回复',
  'faq-fallback': '备用回复',
  faq: '常见问题库'
}

let msgId = 1

/** 格式化时间戳 */
function formatTime(ts) {
  const d = new Date(ts)
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

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
    inputFocused: false,
    sessionId: '',
    loading: false,
    scrollInto: '',
    userAvatar: '/images/avatar.webp',
    botAvatar: '/images/logo.webp',
    aiOnline: false,
    aiChecking: true,
    aiStatusText: '正在连接AI服务…',
    lastError: ''
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: '智能客服' })
    const userInfo = wx.getStorageSync('userInfo')
    const customAvatar = wx.getStorageSync('userAvatar')
    if (customAvatar) {
      this.setData({ userAvatar: customAvatar })
    } else if (userInfo?.avatarUrl) {
      this.setData({ userAvatar: userInfo.avatarUrl })
    }

    // Check DeepSeek AI connection
    this.checkAiConnection()

    this.loadFaqs()
  },

  /** Check DeepSeek AI service status via /api/v1/service/test-ai */
  checkAiConnection() {
    this.setData({ aiChecking: true, aiStatusText: '正在连接AI服务…' })

    const cfg = getConfig()
    if (cfg.useMockFallback) {
      // Offline mode - use config flag
      this.setData({
        aiOnline: false,
        aiChecking: false,
        aiStatusText: '离线演示模式'
      })
      this.appendSystemWelcome(false)
      return
    }

    // Attempt real API health check
    const baseUrl = cfg.apiBaseUrl || 'http://localhost:4008/api/v1'
    wx.request({
      url: `${baseUrl}/service/test-ai`,
      method: 'GET',
      timeout: 5000,
      success: (res) => {
        const body = res.data || {}
        const result = body.data || {}
        const online = result.ok === true
        this.setData({
          aiOnline: online,
          aiChecking: false,
          aiStatusText: online ? 'DeepSeek AI 已连接 · 真人级智能回复' : 'AI 服务暂不可用'
        })
        this.appendSystemWelcome(online)
      },
      fail: () => {
        // Fallback: mark as offline
        this.setData({
          aiOnline: false,
          aiChecking: false,
          aiStatusText: '离线演示模式'
        })
        this.appendSystemWelcome(false)
      }
    })
  },

  /** 系统欢迎消息：强制展示在顶部 */
  appendSystemWelcome(online) {
    if (this.data.messages.length > 0) return // already set

    const welcomeMsg = {
      id: msgId++,
      role: 'assistant',
      content: online
        ? '您好呀 🙌 我是亮叶助手，由 DeepSeek AI 驱动，很高兴为您服务！\n\n您可以向我咨询以下内容：\n• 🚗 汽车金融进件材料与流程\n• 🏦 企业经营贷产品对比\n• 🛡️ 延保服务与车险区别\n• ⚠️ 合规风险与费用说明\n\n直接输入您的问题就行，我24小时在线～请问您今天想了解什么？'
        : '您好 🤝 欢迎来到亮叶企服智能客服。\n\n当前为离线模式，您仍然可以查看下方常见问题，或直接拨打客服热线 400-888-7777 进行咨询。',
      source: 'system',
      sourceText: SOURCE_MAP.system,
      time: formatTime(Date.now()),
      status: ''
    }
    const messages = [welcomeMsg]
    this.setData({
      messages,
      scrollInto: `msg-${welcomeMsg.id}`
    })
  },

  appendMessage(msg) {
    const now = Date.now()
    const item = {
      ...msg,
      id: msg.id || msgId++,
      sourceText: msg.sourceText || SOURCE_MAP[msg.source] || msg.source || '',
      aiBadge: msg.aiBadge || (msg.source === 'deepseek' ? 'DeepSeek' : ''),
      time: msg.time || formatTime(now)
    }
    const messages = [...this.data.messages, item].slice(-80)
    this.setData({
      messages,
      scrollInto: `msg-${item.id}`
    })
  },

  /** 更新指定消息的状态 */
  updateMessageStatus(id, updates) {
    const messages = this.data.messages.map(m =>
      m.id === id ? { ...m, ...updates } : m
    )
    this.setData({ messages })
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

  onInputFocus() {
    this.setData({ inputFocused: true })
  },

  onInputBlur() {
    this.setData({ inputFocused: false })
  },

  callService() {
    wx.makePhoneCall({ phoneNumber: '4008887777' })
  },

  sendMessage() {
    const message = this.data.inputValue.trim()
    if (!message || this.data.loading) return

    // 添加用户消息（发送中状态）
    const userMsgId = msgId++
    this.appendMessage({
      id: userMsgId,
      role: 'user',
      content: message,
      status: 'sending'
    })
    this.setData({ inputValue: '', loading: true, scrollInto: 'msg-typing' })

    // 保存会话到本地
    this.saveSessionToLocal(message)

    sendChatMessage({ message, sessionId: this.data.sessionId })
      .then(res => {
        this.setData({ sessionId: res.sessionId, lastError: '' })
        // 更新用户消息为已发送
        this.updateMessageStatus(userMsgId, { status: 'sent' })
        // 添加AI回复
        this.appendMessage({
          role: 'assistant',
          content: res.answer,
          source: res.source || 'faq',
          aiBadge: res.source === 'deepseek' ? 'DeepSeek' : ''
        })
        if (res.source === 'deepseek') {
          this.setData({ aiOnline: true, aiStatusText: 'DeepSeek AI 已连接' })
        }
      })
      .catch(() => {
        // 标记为发送失败
        this.updateMessageStatus(userMsgId, { status: 'failed' })
        this.setData({ lastError: '连接失败' })
        this.appendMessage({
          role: 'assistant',
          content: '抱歉，网络出了点小状况 😅 您可以稍后重试，或者直接拨打客服电话 400-888-7777 与我沟通。下方也有一些常见问题供您参考。',
          source: 'fallback'
        })
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },

  /** 重试发送失败的消息 */
  retryMessage(e) {
    const id = e.currentTarget.dataset.id
    const messages = this.data.messages
    const msg = messages.find(m => m.id === id)
    if (!msg || msg.role !== 'user') return

    // 删除该消息及之后的所有消息
    const idx = messages.findIndex(m => m.id === id)
    this.setData({
      messages: messages.slice(0, idx),
      inputValue: msg.content,
      loading: false,
      scrollInto: `msg-${messages[idx - 1]?.id || 'msg-0'}`
    }, () => {
      // 自动触发发送
      this.sendMessage()
    })
  },

  /** 将会话消息保存到本地存储 */
  saveSessionToLocal(message) {
    try {
      const sessions = wx.getStorageSync('chatSessions') || []
      const now = Date.now()
      const today = new Date().toLocaleDateString('zh-CN')
      sessions.unshift({
        id: this.data.sessionId || `local_${now}`,
        lastMessage: message.slice(0, 50),
        time: today,
        ts: now
      })
      wx.setStorageSync('chatSessions', sessions.slice(0, 50))
    } catch (e) {
      // 存储满时不阻塞
    }
  }
})
