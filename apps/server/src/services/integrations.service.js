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
      hint: wechatReady ? 'Access Token、登录校验、订阅消息、内容安全、小程序码等 API 可用' : '请配置 WECHAT_SECRET',
      apis: {
        accessToken: wechatReady,
        jscode2session: wechatReady,
        getPhoneNumber: wechatReady,
        msgSecCheck: wechatReady,
        wxaCode: wechatReady,
        urlLink: wechatReady,
        shortLink: wechatReady,
        sendCustomMsg: wechatReady,
        generateScheme: wechatReady
      },
      links: {
        doc: 'https://developers.weixin.qq.com/miniprogram/dev/server/API/',
        mpPlatform: 'https://mp.weixin.qq.com/'
      }
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
    ai: getAIStatus(),
    esig: getEsigStatus(),
    zilliz: getZillizStatus(),
    cdn: {
      baseUrl: process.env.CDN_BASE_URL || '',
      useCdnImages: process.env.USE_CDN_IMAGES === 'true',
      hint: '小程序 CDN 开关在 deploy.config.json useCdnImages，同步后写入 utils/config.js'
    }
  }
}

function getAIStatus() {
  const deepseekKey = process.env.DEEPSEEK_API_KEY || ''
  const qwenKey = process.env.QWEN_API_KEY || ''
  const anthropicKey = process.env.ANTHROPIC_API_KEY || ''
  const defaultProvider = process.env.AI_DEFAULT_PROVIDER || 'deepseek'

  return {
    defaultProvider,
    providers: {
      deepseek: {
        configured: !!deepseekKey,
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        apiKeyHint: maskSecret(deepseekKey),
        hint: !!deepseekKey ? 'DeepSeek 已配置' : '未配置 DeepSeek API Key'
      },
      qwen: {
        configured: !!qwenKey,
        model: process.env.QWEN_MODEL || 'qwen-plus',
        apiBase: process.env.QWEN_API_BASE || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        apiKeyHint: maskSecret(qwenKey),
        hint: !!qwenKey ? '通义千问已配置（OpenAI 兼容模式）' : '未配置通义千问 API Key'
      },
      anthropic: {
        configured: !!anthropicKey,
        model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku',
        apiBase: process.env.ANTHROPIC_API_BASE || 'https://dashscope.aliyuncs.com/apps/anthropic',
        apiKeyHint: maskSecret(anthropicKey),
        hint: !!anthropicKey ? 'Anthropic 兼容已配置（通义千问 Anthropic 兼容接口）' : '未配置 Anthropic API Key'
      }
    },
    deepseek: getDeepSeekStatus()
  }
}

function getEsigStatus() {
  const key = process.env.ESIG_APP_KEY || ''
  const secret = process.env.ESIG_APP_SECRET || ''
  const code = process.env.ESIG_APP_CODE || ''
  return {
    configured: !!(key && secret && code),
    appKeyConfigured: !!key,
    appSecretConfigured: !!secret,
    appCodeConfigured: !!code,
    apiUrl: process.env.ESIG_API_URL || '',
    hint: !!(key && secret && code) ? '电子签章 API 已配置，可用于合同在线签署' : '请配置 ESIG_APP_KEY / ESIG_APP_SECRET / ESIG_APP_CODE'
  }
}

function getZillizStatus() {
  const clusterId = process.env.ZILLIZ_CLUSTER_ID || ''
  const endpoint = process.env.ZILLIZ_ENDPOINT || ''
  const token = process.env.ZILLIZ_TOKEN || ''
  return {
    configured: !!(clusterId && endpoint && token),
    clusterId: clusterId ? clusterId.slice(0, 8) + '****' : '',
    region: process.env.ZILLIZ_REGION || 'ali-cn-hangzhou',
    endpointConfigured: !!endpoint,
    tokenConfigured: !!token,
    hint: !!(clusterId && endpoint && token) ? 'Zilliz Cloud 向量数据库已配置，可用于智能搜索' : '请配置 ZILLIZ_CLUSTER_ID / ZILLIZ_ENDPOINT / ZILLIZ_TOKEN'
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
      cdnConfigured: !!status.cdn.baseUrl,
      esigConfigured: status.esig.configured,
      zillizConfigured: status.zilliz.configured,
      aiDeepSeek: status.ai.providers.deepseek.configured,
      aiQwen: status.ai.providers.qwen.configured,
      aiAnthropic: status.ai.providers.anthropic.configured
    },
    cdnBaseUrl: status.cdn.baseUrl || null
  }
}

function getDeepSeekStatus() {
  const db = require('../db')
  let envKey = process.env.DEEPSEEK_API_KEY || ''
  let envModel = process.env.DEEPSEEK_MODEL || 'deepseek-chat'
  let dbKey = ''
  let dbModel = ''
  try {
    const rows = db.prepare("SELECT key, value FROM config_settings WHERE category = 'integration' AND key IN ('integration_deepseek_key', 'integration_deepseek_model')").all()
    for (const r of rows) {
      if (r.key === 'integration_deepseek_key') dbKey = r.value
      if (r.key === 'integration_deepseek_model') dbModel = r.value
    }
  } catch {}
  const effectiveKey = dbKey || envKey
  const effectiveModel = dbModel || envModel
  return {
    configured: !!effectiveKey,
    model: effectiveModel,
    keySource: dbKey ? 'database' : (envKey ? 'env' : 'none'),
    envKeyConfigured: !!envKey,
    dbKeyConfigured: !!dbKey
  }
}

module.exports = {
  getIntegrationStatus,
  getWechatTokenStatus,
  getPublicIntegrationConfig
}
