#!/usr/bin/env node
/**
 * 生产密钥模板完整性检查（CI 与本地均可运行，不读取真实 .env）
 */
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
let failed = false

function ok(msg) { console.log(`  [OK] ${msg}`) }
function fail(msg) { failed = true; console.error(`  [FAIL] ${msg}`) }

/** 生产必填（值可为空，键必须存在） */
const PRODUCTION_REQUIRED = [
  'PORT', 'NODE_ENV', 'JWT_SECRET', 'DB_PATH', 'UPLOADS_DIR', 'PUBLIC_BASE_URL',
  'ADMIN_URL', 'ADMIN_PORT', 'ADMIN_BASE_PATH',
  'WECHAT_APPID', 'WECHAT_SECRET',
  'WECHAT_TEMPLATE_INTAKE_AUDIT', 'WECHAT_TEMPLATE_INTAKE_DISBURSE', 'WECHAT_TEMPLATE_FINANCE_REVIEW',
  'OCR_PROVIDER', 'ALIYUN_ACCESS_KEY_ID', 'ALIYUN_ACCESS_KEY_SECRET', 'ALIYUN_OCR_ENDPOINT',
  'ALIYUN_GREEN_ENABLED', 'ALIYUN_GREEN_REGION', 'ALIYUN_GREEN_ENDPOINT',
  'USE_CDN_IMAGES', 'CDN_BASE_URL',
  'OSS_REGION', 'OSS_BUCKET', 'OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET',
  'WECHAT_UPLOAD_PRIVATE_KEY_PATH', 'MINIPROGRAM_VERSION', 'MINIPROGRAM_DESC', 'MINIPROGRAM_ROBOT',
  'DEEPSEEK_API_KEY', 'DEEPSEEK_MODEL'
]

/** 开发示例至少应包含的键 */
const EXAMPLE_REQUIRED = [
  'PORT', 'JWT_SECRET', 'WECHAT_APPID', 'WECHAT_SECRET', 'PUBLIC_BASE_URL',
  'ALIYUN_ACCESS_KEY_ID', 'WECHAT_TEMPLATE_INTAKE_AUDIT', 'WECHAT_TEMPLATE_FINANCE_REVIEW'
]

/** GitHub Actions publish workflow 引用的 Secrets */
const GITHUB_SECRETS = [
  'WECHAT_UPLOAD_PRIVATE_KEY',
  'OSS_REGION', 'OSS_BUCKET', 'OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET', 'OSS_PREFIX'
]

function parseEnvKeys(filePath) {
  if (!fs.existsSync(filePath)) return null
  const keys = new Set()
  fs.readFileSync(filePath, 'utf8').split(/\r?\n/).forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const m = trimmed.match(/^([A-Z0-9_]+)=/)
    if (m) keys.add(m[1])
  })
  return keys
}

function checkKeys(label, filePath, required) {
  const keys = parseEnvKeys(filePath)
  if (!keys) {
    fail(`缺少 ${label}: ${path.relative(root, filePath)}`)
    return
  }
  ok(`${label} 可读 (${keys.size} 项)`)
  required.forEach(k => {
    if (keys.has(k)) ok(`${label} 含 ${k}`)
    else fail(`${label} 缺少 ${k}`)
  })
}

console.log('=== 生产密钥模板检查 ===\n')

checkKeys('.env.production.example', path.join(root, '.env.production.example'), PRODUCTION_REQUIRED)
checkKeys('.env.example', path.join(root, '.env.example'), EXAMPLE_REQUIRED)

const prodDoc = path.join(root, 'deploy', 'production-secrets.md')
const ghSecrets = path.join(root, '.github', 'SECRETS.md')
const publishYml = path.join(root, '.github', 'workflows', 'publish-miniprogram.yml')

if (fs.existsSync(prodDoc)) ok('deploy/production-secrets.md')
else fail('缺少 deploy/production-secrets.md')

if (fs.existsSync(ghSecrets)) {
  ok('.github/SECRETS.md')
  const doc = fs.readFileSync(ghSecrets, 'utf8')
  GITHUB_SECRETS.forEach(s => {
    if (doc.includes(s)) ok(`SECRETS.md 文档含 ${s}`)
    else fail(`SECRETS.md 未提及 ${s}`)
  })
} else fail('缺少 .github/SECRETS.md')

if (fs.existsSync(publishYml)) {
  const yml = fs.readFileSync(publishYml, 'utf8')
  if (yml.includes('secrets.WECHAT_UPLOAD_PRIVATE_KEY')) ok('publish workflow 引用 secrets.WECHAT_UPLOAD_PRIVATE_KEY')
  else fail('publish workflow 未引用 secrets.WECHAT_UPLOAD_PRIVATE_KEY')
  ;['OSS_REGION', 'OSS_BUCKET', 'OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET', 'OSS_PREFIX'].forEach(s => {
    if (yml.includes(`secrets.${s}`)) ok(`publish workflow 引用 secrets.${s}`)
    else fail(`publish workflow 未引用 secrets.${s}`)
  })
} else fail('缺少 publish-miniprogram.yml')

console.log(failed ? '\n=== 模板检查失败 ===' : '\nALL_ENV_TEMPLATE_OK')
if (failed) process.exit(1)
