const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const { syncProdConfig } = require('./sync-prod-config')

const root = path.resolve(__dirname, '..')

function readDeployConfig() {
  return JSON.parse(fs.readFileSync(path.join(root, 'deploy', 'deploy.config.json'), 'utf8'))
}

function item(id, label, status, detail = '', cmd = '') {
  return { id, label, status, detail, cmd }
}

function runReleaseChecklist() {
  const checks = []
  const deployConfig = readDeployConfig()

  try {
    syncProdConfig({ silent: true })
    checks.push(item('sync', '生产配置同步', 'ok', 'utils/config.js 已同步', 'pnpm sync:prod'))
  } catch (e) {
    checks.push(item('sync', '生产配置同步', 'fail', e.message, 'pnpm sync:prod'))
  }

  const configJs = fs.readFileSync(path.join(root, 'utils', 'config.js'), 'utf8')
  checks.push(
    configJs.includes(deployConfig.apiBaseUrl)
      ? item('api', 'API 地址一致', 'ok', deployConfig.apiBaseUrl)
      : item('api', 'API 地址一致', 'fail', '请运行 pnpm sync:prod')
  )

  if (deployConfig.useCdnImages) {
    const staging = path.join(root, 'deploy', 'cdn-staging', 'manifest.json')
    checks.push(
      fs.existsSync(staging)
        ? item('cdn', 'CDN staging', 'ok', 'deploy/cdn-staging 已就绪', 'pnpm prepare:cdn')
        : item('cdn', 'CDN staging', 'fail', '缺少 manifest', 'pnpm prepare:cdn')
    )
  } else {
    checks.push(item('cdn', 'CDN 模式', 'ok', 'useCdnImages=false，本地分包资源'))
  }

  const domainJson = path.join(root, 'deploy', 'wechat-domain-config.json')
  if (fs.existsSync(domainJson)) {
    const domains = JSON.parse(fs.readFileSync(domainJson, 'utf8'))
    const count = (domains.downloadDomains || []).length
    checks.push(
      count
        ? item('domains', '微信域名清单', 'ok', `${count} 个 download 域名`, 'deploy/wechat-checklist.txt')
        : item('domains', '微信域名清单', 'fail', 'downloadDomains 为空')
    )
  } else {
    checks.push(item('domains', '微信域名清单', 'fail', '缺少 wechat-domain-config.json'))
  }

  try {
    execSync('node scripts/verify-pages.js', { cwd: root, stdio: 'pipe' })
    checks.push(item('pages', '页面四件套', 'ok', 'ALL_PAGES_OK', 'pnpm verify:pages'))
  } catch {
    checks.push(item('pages', '页面四件套', 'fail', 'verify-pages 未通过'))
  }

  try {
    execSync('node scripts/verify-assets.js', { cwd: root, stdio: 'pipe' })
    checks.push(item('assets', '图片资源', 'ok', 'ALL_ASSETS_OK', 'pnpm verify:assets'))
  } catch {
    checks.push(item('assets', '图片资源', 'fail', 'verify-assets 未通过'))
  }

  try {
    const out = execSync('node scripts/audit-bundle.js', { cwd: root, encoding: 'utf8' })
    const m = out.match(/主包[^\d]*([\d.]+)\s*KB/i)
    const kb = m ? parseFloat(m[1]) : null
    checks.push(
      kb != null && kb < 2048
        ? item('bundle', '主包体积', 'ok', `${kb} KB`, 'pnpm audit:bundle')
        : item('bundle', '主包体积', kb != null ? 'warn' : 'ok', kb != null ? `${kb} KB 偏大` : '完成')
    )
  } catch {
    checks.push(item('bundle', '主包体积', 'fail', 'audit-bundle 未通过'))
  }

  const mpKey = process.env.WECHAT_UPLOAD_PRIVATE_KEY ||
    (process.env.WECHAT_UPLOAD_PRIVATE_KEY_PATH && fs.existsSync(path.resolve(root, process.env.WECHAT_UPLOAD_PRIVATE_KEY_PATH)))
  checks.push(
    mpKey
      ? item('mp-key', '小程序上传密钥', 'ok', 'WECHAT_UPLOAD_PRIVATE_KEY* 已配置')
      : item('mp-key', '小程序上传密钥', 'warn', '正式上传前需配置密钥')
  )

  const ossOk = !!(process.env.OSS_REGION && process.env.OSS_BUCKET && process.env.OSS_ACCESS_KEY_ID && process.env.OSS_ACCESS_KEY_SECRET)
  if (deployConfig.useCdnImages) {
    checks.push(
      ossOk
        ? item('oss', 'OSS CDN 上传', 'ok', process.env.OSS_BUCKET || '')
        : item('oss', 'OSS CDN 上传', 'fail', 'useCdnImages=true 但 OSS 未配置')
    )
  }

  try {
    execSync('node scripts/upload-miniprogram-ci.js --dry-run', { cwd: root, stdio: 'pipe' })
    checks.push(item('mp-ci', 'miniprogram-ci 预检', 'ok', 'dry-run 通过', 'pnpm upload:mp:dry'))
  } catch {
    checks.push(item('mp-ci', 'miniprogram-ci 预检', 'fail', 'dry-run 未通过'))
  }

  checks.push(item('legal', '合规表述', 'ok', '居间服务、不承诺审批结果（请人工复核文案）'))
  checks.push(item('submit', '提交微信审核', 'warn', '确认体验版验证通过后，在 mp.weixin.qq.com 提交正式版'))

  const summary = {
    total: checks.length,
    passed: checks.filter(c => c.status === 'ok').length,
    warned: checks.filter(c => c.status === 'warn').length,
    failed: checks.filter(c => c.status === 'fail').length,
    ready: checks.every(c => c.status !== 'fail')
  }

  return { checks, summary, generatedAt: new Date().toISOString() }
}

module.exports = { runReleaseChecklist }
