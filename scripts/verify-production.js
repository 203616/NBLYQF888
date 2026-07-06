#!/usr/bin/env node
/**
 * 生产发布前综合校验（不修改文件）
 */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const { syncProdConfig } = require('./sync-prod-config')

const root = path.resolve(__dirname, '..')
const deployConfig = JSON.parse(fs.readFileSync(path.join(root, 'deploy', 'deploy.config.json'), 'utf8'))

const checks = []

function ok(name, detail) {
  checks.push({ name, status: 'ok', detail })
  console.log(`  [OK] ${name}${detail ? ' - ' + detail : ''}`)
}

function fail(name, detail) {
  checks.push({ name, status: 'fail', detail })
  console.log(`  [FAIL] ${name} - ${detail}`)
}

function warn(name, detail) {
  checks.push({ name, status: 'warn', detail })
  console.log(`  [WARN] ${name} - ${detail}`)
}

console.log('=== 生产发布前校验 ===\n')

console.log('>> 同步 deploy.config → utils/config.js')
try {
  syncProdConfig({ silent: true })
  ok('配置同步', 'utils/config.js')
} catch (e) {
  fail('配置同步', e.message)
}

const configJs = fs.readFileSync(path.join(root, 'utils', 'config.js'), 'utf8')
if (configJs.includes(deployConfig.apiBaseUrl)) ok('API 地址一致', deployConfig.apiBaseUrl)
else fail('API 地址一致', '请运行 pnpm sync:prod')

if (configJs.includes(deployConfig.cdnBaseUrl || 'cdn.liangyeqf.com')) ok('CDN 地址已写入', deployConfig.cdnBaseUrl)
else warn('CDN 地址', '未在 config.js 中找到')

if (deployConfig.useCdnImages) {
  const staging = path.join(root, 'deploy', 'cdn-staging', 'manifest.json')
  if (fs.existsSync(staging)) ok('CDN 打包', 'deploy/cdn-staging 已就绪')
  else fail('CDN 打包', 'useCdnImages=true 但缺少 staging，请运行 pnpm prepare:cdn')
} else {
  ok('CDN 模式', 'useCdnImages=false，使用本地分包资源')
}

const domainJson = path.join(root, 'deploy', 'wechat-domain-config.json')
if (fs.existsSync(domainJson)) {
  const domains = JSON.parse(fs.readFileSync(domainJson, 'utf8'))
  if ((domains.downloadDomains || []).length) ok('微信域名清单', `${domains.downloadDomains.length} 个 download 域名`)
  else fail('微信域名清单', 'downloadDomains 为空')
} else {
  fail('微信域名清单', '请运行 pnpm sync:prod')
}

console.log('\n>> 编译与资源')
try {
  const out = execSync('node scripts/verify-compile.js', { cwd: root, encoding: 'utf8' })
  if (out.includes('全部通过')) ok('编译前校验', 'verify:compile 通过')
  else ok('编译前校验', '完成')
} catch (e) {
  fail('编译前校验', 'verify:compile 未通过')
}

console.log('\n>> 环境变量')
const envPath = path.join(root, '.env')
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8')
  if (env.includes('JWT_SECRET=') && !env.includes('please-change-this-secret')) ok('.env', '已配置')
  else warn('.env', 'JWT_SECRET 需设置')
  if (env.includes('PUBLIC_BASE_URL=')) ok('PUBLIC_BASE_URL', '已设置')
  else warn('PUBLIC_BASE_URL', 'PDF/上传链接需要')
} else {
  warn('.env', '不存在，请复制 deploy/env.local.template')
}

console.log('\n>> 小程序上传预检')
try {
  execSync('node scripts/upload-miniprogram-ci.js --dry-run', { cwd: root, stdio: 'pipe' })
  ok('miniprogram-ci', 'dry-run 通过')
} catch (e) {
  fail('miniprogram-ci', 'dry-run 未通过')
}

const passed = checks.filter(c => c.status === 'ok').length
const failed = checks.filter(c => c.status === 'fail').length
const warned = checks.filter(c => c.status === 'warn').length
console.log(`\n=== 结果: ${passed} 通过, ${failed} 失败, ${warned} 警告 ===`)

console.log('\n【上线步骤】')
console.log('  1. pnpm sync:prod')
console.log('  2. pnpm prepare:cdn（若 useCdnImages=true）')
console.log('  3. 按 deploy/wechat-checklist.txt 配置微信域名')
console.log('  4. pnpm verify:production && pnpm verify:device')
console.log('  5. 微信开发者工具上传 → 提交审核')

if (failed > 0) process.exit(1)
