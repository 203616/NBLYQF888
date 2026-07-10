const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') })

const rootDir = path.resolve(__dirname, '..', '..', '..', '..')

module.exports = {
  port: Number(process.env.PORT || 3000),
  jwtSecret: process.env.JWT_SECRET || 'liangye-local-secret',
  dbPath: process.env.DB_PATH
    ? path.resolve(rootDir, process.env.DB_PATH)
    : path.join(rootDir, 'apps', 'server', 'data', 'liangye.db'),
  uploadsDir: process.env.UPLOADS_DIR
    ? path.resolve(rootDir, process.env.UPLOADS_DIR)
    : path.join(rootDir, 'apps', 'server', 'uploads'),
  nodeEnv: process.env.NODE_ENV || 'development',
  adminDist: path.join(rootDir, 'apps', 'admin', 'dist'),
  adminBase: (process.env.ADMIN_BASE_PATH || '/ly-admin').replace(/\/$/, ''),
  ocrProvider: process.env.OCR_PROVIDER || 'aliyun',
  publicBaseUrl: process.env.PUBLIC_BASE_URL || '',

  // 微信小程序配置
  wechat: {
    appId: process.env.WECHAT_APPID || '',
    secret: process.env.WECHAT_SECRET || '',
    templates: {
      intakeAudit: process.env.WECHAT_TEMPLATE_INTAKE_AUDIT || '',
      intakeDisburse: process.env.WECHAT_TEMPLATE_INTAKE_DISBURSE || '',
      financeReview: process.env.WECHAT_TEMPLATE_FINANCE_REVIEW || ''
    }
  },

  // AI 大模型配置
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat'
  },
  qwen: {
    apiKey: process.env.QWEN_API_KEY || '',
    model: process.env.QWEN_MODEL || 'qwen-plus',
    apiBase: process.env.QWEN_API_BASE || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    apiBase: process.env.ANTHROPIC_API_BASE || 'https://dashscope.aliyuncs.com/apps/anthropic',
    model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku'
  },
  aiDefaultProvider: process.env.AI_DEFAULT_PROVIDER || 'deepseek',

  // 电子签章
  esig: {
    appKey: process.env.ESIG_APP_KEY || '',
    appSecret: process.env.ESIG_APP_SECRET || '',
    appCode: process.env.ESIG_APP_CODE || '',
    apiUrl: process.env.ESIG_API_URL || 'https://qbq2024.market.alicloudapi.com/api/task/taskDetail'
  },

  // 向量数据库（Zilliz Cloud）
  zilliz: {
    clusterId: process.env.ZILLIZ_CLUSTER_ID || '',
    region: process.env.ZILLIZ_REGION || 'ali-cn-hangzhou',
    endpoint: process.env.ZILLIZ_ENDPOINT || '',
    token: process.env.ZILLIZ_TOKEN || ''
  }
}
