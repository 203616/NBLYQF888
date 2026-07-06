#!/usr/bin/env node
/**
 * CI 专用校验：不依赖 .env / 运行中 API，适合 GitHub Actions
 */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const root = path.resolve(__dirname, '..')
let failed = false

function step(name, fn) {
  process.stdout.write(`>> ${name}... `)
  try {
    fn()
    console.log('OK')
  } catch (e) {
    failed = true
    console.log('FAIL')
    console.error(e.message || e)
  }
}

console.log('=== CI 校验 ===\n')

step('页面四件套', () => {
  execSync('node scripts/verify-pages.js', { cwd: root, stdio: 'pipe' })
})

step('图片资源', () => {
  execSync('node scripts/verify-assets.js', { cwd: root, stdio: 'pipe' })
})

step('主包体积', () => {
  execSync('node scripts/audit-bundle.js', { cwd: root, stdio: 'pipe' })
})

step('生产配置同步', () => {
  execSync('node scripts/sync-prod-config.js', { cwd: root, stdio: 'pipe' })
  const deployConfig = JSON.parse(fs.readFileSync(path.join(root, 'deploy', 'deploy.config.json'), 'utf8'))
  const configJs = fs.readFileSync(path.join(root, 'utils', 'config.js'), 'utf8')
  if (!configJs.includes(deployConfig.apiBaseUrl)) {
    throw new Error('config.js 与 deploy.config.json API 不一致')
  }
})

step('微信域名 JSON', () => {
  const p = path.join(root, 'deploy', 'wechat-domain-config.json')
  if (!fs.existsSync(p)) throw new Error('缺少 wechat-domain-config.json')
  const json = JSON.parse(fs.readFileSync(p, 'utf8'))
  if (!(json.downloadDomains || []).length) throw new Error('downloadDomains 为空')
})

step('CDN staging 可生成', () => {
  execSync('node scripts/prepare-cdn-bundle.js', { cwd: root, stdio: 'pipe' })
  const manifest = path.join(root, 'deploy', 'cdn-staging', 'manifest.json')
  if (!fs.existsSync(manifest)) throw new Error('manifest 未生成')
})

step('服务端语法', () => {
  execSync('node --check apps/server/src/server.js', { cwd: root, stdio: 'pipe' })
  execSync('node --check apps/server/src/app.js', { cwd: root, stdio: 'pipe' })
})

step('小程序上传预检', () => {
  execSync('node scripts/upload-miniprogram-ci.js --dry-run', { cwd: root, stdio: 'pipe' })
})

step('融圈自动审核', () => {
  execSync('node scripts/verify-finance-moderation.js', { cwd: root, stdio: 'inherit' })
})

step('多端兼容', () => {
  execSync('node scripts/verify-platform.js', { cwd: root, stdio: 'inherit' })
})

console.log(failed ? '\n=== CI 校验失败 ===' : '\n=== CI 校验通过 ===')
if (failed) process.exit(1)
