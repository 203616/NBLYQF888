#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const http = require('http')

const root = path.resolve(__dirname, '..')
const deployConfig = JSON.parse(fs.readFileSync(path.join(root, 'deploy', 'deploy.config.json'), 'utf8'))
const port = deployConfig.serverPort || 3000

const checks = []

function ok(name, detail) {
  checks.push({ name, status: 'ok', detail })
  console.log(`  [OK] ${name}${detail ? ' - ' + detail : ''}`)
}

function fail(name, detail) {
  checks.push({ name, status: 'fail', detail })
  console.log(`  [FAIL] ${name} - ${detail}`)
}

console.log('=== 部署状态检查 ===\n')

if (fs.existsSync(path.join(root, '.env'))) ok('.env 配置文件')
else fail('.env 配置文件', '请运行 pnpm run deploy')

const imageDir = path.join(root, 'images')
if (fs.existsSync(imageDir)) {
  const count = fs.readdirSync(imageDir, { recursive: true }).filter(f => /\.(png|webp)$/i.test(String(f))).length
  if (count >= 50) ok('图片资源', `${count} 个文件`)
  else fail('图片资源', `仅 ${count} 个，请运行 pnpm run generate:images`)
} else {
  fail('图片资源', 'images/ 目录不存在')
}

const dbPath = path.join(root, 'apps', 'server', 'data', 'liangye.db')
if (fs.existsSync(dbPath)) ok('SQLite 数据库', dbPath)
else fail('SQLite 数据库', '请运行 pnpm run db:reset')

const adminDist = path.join(root, 'apps', 'admin', 'dist', 'index.html')
if (fs.existsSync(adminDist)) ok('管理后台构建', adminDist)
else fail('管理后台构建', '请运行 pnpm run build:admin')

const configJs = fs.readFileSync(path.join(root, 'utils', 'config.js'), 'utf8')
if (configJs.includes(deployConfig.apiBaseUrl)) ok('小程序 API 地址', deployConfig.apiBaseUrl)
else fail('小程序 API 地址', '与 deploy.config.json 不一致，请运行 pnpm sync:prod')

if (deployConfig.cdnBaseUrl && configJs.includes(deployConfig.cdnBaseUrl)) {
  ok('小程序 CDN 地址', deployConfig.cdnBaseUrl)
} else if (configJs.includes('PRODUCTION_CDN_BASE')) {
  ok('小程序 CDN 配置', '已写入 config.js')
} else {
  fail('小程序 CDN 配置', '请运行 pnpm sync:prod')
}

const domainJsonPath = path.join(root, 'deploy', 'wechat-domain-config.json')
if (fs.existsSync(domainJsonPath)) ok('微信域名 JSON', 'deploy/wechat-domain-config.json')
else fail('微信域名 JSON', '请运行 pnpm sync:prod')

const checklist = path.join(root, 'deploy', 'wechat-checklist.txt')
if (fs.existsSync(checklist)) ok('微信配置清单', 'deploy/wechat-checklist.txt')
else fail('微信配置清单', '请运行 pnpm run deploy')

console.log('\n>> API 健康检查...')
const req = http.get(`http://127.0.0.1:${port}/api/v1/health`, res => {
  let body = ''
  res.on('data', c => { body += c })
  res.on('end', () => {
    try {
      const json = JSON.parse(body)
      if (json.code === 0) ok('API 服务', `localhost:${port}`)
      else fail('API 服务', body)
    } catch (e) {
      fail('API 服务', '响应解析失败')
    }
    printSummary()
  })
})
req.on('error', () => {
  fail('API 服务', '未运行，请执行 pnpm run start:server')
  printSummary()
})
req.setTimeout(3000, () => {
  req.destroy()
  fail('API 服务', '连接超时')
  printSummary()
})

let printed = false
function printSummary() {
  if (printed) return
  printed = true
  const passed = checks.filter(c => c.status === 'ok').length
  const total = checks.length
  console.log(`\n=== 结果: ${passed}/${total} 通过 ===`)
  if (passed < total) process.exit(1)
}
