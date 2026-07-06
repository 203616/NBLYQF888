const { ocrProvider } = require('../config')
const { getAccessToken } = require('./wechat.service')

function maskSecret(value) {
  if (!value) return ''
  const s = String(value)
  if (s.length <= 8) return '****'
  return `${s.slice(0, 4)}****${s.slice(-4)}`
}

function getIntegrationStatus() {
  const aliyunKeyId = process.env.ALIYUN_ACCESS_KEY_ID || ''
  const aliyunSecret = process.env.ALIYUN_ACCESS_KEY_SECRET || ''
  const wechatSecret = process.env.WECHAT_SECRET || ''
  const wechatAppId = process.env.WECHAT_APPID || ''
  const templateAudit = process.env.WECHAT_TEMPLATE_INTAKE_AUDIT || ''
  const templateDisburse = process.env.WECHAT_TEMPLATE_INTAKE_DISBURSE || ''
  const templateFinanceReview = process.env.WECHAT_TEMPLATE_FINANCE_REVIEW || ''

  const ocrReady = ocrProvider === 'aliyun' && !!aliyunKeyId && !!aliyunSecret
  const wechatReady = !!wechatAppId && !!wechatSecret
  const subscribeReady = !!(templateAudit && templateDisburse)
  const financeSubscribeReady = !!templateFinanceReview

  let contentSecurity = { configured: false, mode: 'mock', hint: '' }
  try {
    contentSecurity = require('./aliyun-content-security.service').getContentSecurityStatus()
  } catch {
    contentSecurity = { configured: false, mode: 'mock', hint: '内容安全模块未加载' }
  }

  return {
    ocr: {
      provider: ocrProvider,
      configured: ocrReady,
      mode: ocrReady ? 'aliyun' : 'mock',
      endpoint: process.env.ALIYUN_OCR_ENDPOINT || 'ocr-api.cn-hangzhou.aliyuncs.com',
      accessKeyId: maskSecret(aliyunKeyId),
      hint: ocrReady ? '阿里云 OCR 已配置' : '未配置密钥时将使用 Mock 识别结果'
    },
    wechat: {
      appId: wechatAppId,
      secretConfigured: !!wechatSecret,
      configured: wechatReady,
      publicBaseUrl: process.env.PUBLIC_BASE_URL || '',
      hint: wechatReady ? '可获取 access_token 并发送订阅消息' : '请配置 WECHAT_SECRET'
    },
    subscribeTemplates: {
      intakeAudit: templateAudit,
      intakeDisburse: templateDisburse,
      financeReview: templateFinanceReview,
      configured: subscribeReady,
      financeConfigured: financeSubscribeReady,
      hint: subscribeReady ? '小程序可请求用户订阅进件通知' : '请在微信公众平台配置模板 ID 并写入 .env'
    },
    contentSecurity,
    deepseek: {
      configured: !!process.env.DEEPSEEK_API_KEY,
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat'
    },
    cdn: {
      baseUrl: process.env.CDN_BASE_URL || '',
      useCdnImages: process.env.USE_CDN_IMAGES === 'true',
      hint: '小程序 CDN 开关在 deploy.config.json useCdnImages，同步后写入 utils/config.js'
    }
  }
}

async function getWechatTokenStatus() {
  try {
    const token = await getAccessToken()
    return { ok: !!token, message: token ? 'access_token 获取成功' : '未配置微信密钥' }
  } catch (err) {
    return { ok: false, message: err.message || 'access_token 获取失败' }
  }
}

function getPublicIntegrationConfig() {
  const status = getIntegrationStatus()
  return {
    subscribeTemplates: {
      intakeAudit: status.subscribeTemplates.intakeAudit,
      intakeDisburse: status.subscribeTemplates.intakeDisburse,
      financeReview: status.subscribeTemplates.financeReview
    },
    ocrMode: status.ocr.mode,
    features: {
      subscribe: status.subscribeTemplates.configured,
      financeSubscribe: status.subscribeTemplates.financeConfigured,
      aliyunOcr: status.ocr.configured,
      aliyunContentSecurity: status.contentSecurity?.configured,
      cdnConfigured: !!status.cdn.baseUrl
    },
    cdnBaseUrl: status.cdn.baseUrl || null
  }
}

module.exports = {
  getIntegrationStatus,
  getWechatTokenStatus,
  getPublicIntegrationConfig
}
