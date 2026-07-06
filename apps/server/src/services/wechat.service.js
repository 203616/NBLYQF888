const https = require('https')
const db = require('../db')

let tokenCache = { token: '', expiresAt: 0 }

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let raw = ''
      res.on('data', c => { raw += c })
      res.on('end', () => {
        try { resolve(JSON.parse(raw)) } catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

function httpsPost(url, data) {
  const body = JSON.stringify(data)
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      let raw = ''
      res.on('data', c => { raw += c })
      res.on('end', () => {
        try { resolve(JSON.parse(raw)) } catch (e) { reject(e) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function getAccessToken() {
  const appId = process.env.WECHAT_APPID
  const secret = process.env.WECHAT_SECRET
  if (!appId || !secret) return null
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) return tokenCache.token

  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${secret}`
  const res = await httpsGet(url)
  if (!res.access_token) throw new Error(res.errmsg || '获取微信 access_token 失败')
  tokenCache = { token: res.access_token, expiresAt: Date.now() + (res.expires_in - 300) * 1000 }
  return res.access_token
}

async function sendSubscribeMessage({ openid, templateId, page, data }) {
  if (!openid || !templateId) return { skipped: true, reason: 'missing openid or templateId' }
  const token = await getAccessToken()
  if (!token) return { skipped: true, reason: 'wechat not configured' }

  const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${token}`
  const payload = {
    touser: openid,
    template_id: templateId,
    page: page || 'subpackages/intake/pages/index/index',
    miniprogram_state: process.env.NODE_ENV === 'production' ? 'formal' : 'trial',
    lang: 'zh_CN',
    data
  }
  const res = await httpsPost(url, payload)
  return res
}

function notifyIntakeStatus(application, eventType) {
  const payload = application.payload || {}
  const personal = payload.personal || {}
  const userId = application.user_id
  if (!userId) return Promise.resolve({ skipped: true })

  const user = db.prepare('SELECT openid, phone FROM users WHERE id = ?').get(userId)
  if (!user || !user.openid) return Promise.resolve({ skipped: true, reason: 'no openid' })

  const templates = {
    audit: process.env.WECHAT_TEMPLATE_INTAKE_AUDIT,
    disburse: process.env.WECHAT_TEMPLATE_INTAKE_DISBURSE
  }
  const templateId = templates[eventType]
  if (!templateId) return Promise.resolve({ skipped: true, reason: 'no template' })

  const statusText = {
    auditing: '审核中',
    approved: '审核通过',
    disbursed: '已放款',
    archived: '已归档'
  }

  return sendSubscribeMessage({
    openid: user.openid,
    templateId,
    page: `subpackages/intake/pages/status/status?section=${eventType === 'disburse' ? 'disburse' : 'audit'}`,
    data: {
      thing1: { value: (application.product_name || '进件申请').slice(0, 20) },
      phrase2: { value: statusText[application.status] || application.status },
      name3: { value: (personal.realName || '客户').slice(0, 20) },
      character_string4: { value: application.application_no.slice(0, 32) }
    }
  }).then(res => {
    if (userId) {
      db.prepare('INSERT INTO notifications (user_id, title, content, type, link) VALUES (?, ?, ?, ?, ?)').run(
        userId,
        '进件进度更新',
        `您的进件 ${application.application_no} 状态已更新为：${statusText[application.status] || application.status}`,
        'intake',
        '/subpackages/intake/pages/status/status?section=audit'
      )
    }
    return res
  })
}

function findUserOpenidByPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.length < 11) return null
  const user = db.prepare('SELECT openid FROM users WHERE phone = ?').get(digits)
    || db.prepare('SELECT openid FROM users WHERE phone LIKE ?').get(`%${digits.slice(-11)}%`)
  return user?.openid || null
}

async function notifyFinanceReviewSubscribe({ authorPhone, postId, reviewStatus, reviewNote = '', contentPreview = '' }) {
  const templateId = process.env.WECHAT_TEMPLATE_FINANCE_REVIEW
  if (!templateId) return { skipped: true, reason: 'no template' }
  const openid = findUserOpenidByPhone(authorPhone)
  if (!openid) return { skipped: true, reason: 'no openid' }

  const approved = reviewStatus === 'approved'
  return sendSubscribeMessage({
    openid,
    templateId,
    page: 'pages/financeCircle/financeCircle',
    data: {
      thing1: { value: String(contentPreview || '融圈动态').slice(0, 20) },
      phrase2: { value: approved ? '审核通过' : '未通过' },
      thing3: { value: String(reviewNote || (approved ? '已展示' : '请修改后重试')).slice(0, 20) },
      time4: { value: new Date().toISOString().slice(0, 16).replace('T', ' ') }
    }
  }).then(res => ({ ...res, postId }))
}

module.exports = {
  getAccessToken,
  sendSubscribeMessage,
  notifyIntakeStatus,
  findUserOpenidByPhone,
  notifyFinanceReviewSubscribe
}
