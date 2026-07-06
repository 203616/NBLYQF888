#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { execSync } = require('child_process')

const root = path.resolve(__dirname, '..')
const deployConfigPath = path.join(root, 'deploy', 'deploy.config.json')
const envPath = path.join(root, '.env')
const deployConfig = JSON.parse(fs.readFileSync(deployConfigPath, 'utf8'))

function run(cmd, label) {
  console.log(`\n>> ${label}`)
  console.log(`   ${cmd}`)
  execSync(cmd, { cwd: root, stdio: 'inherit', shell: true })
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function writeEnv() {
  const jwtSecret = crypto.randomBytes(48).toString('hex')
  const envContent = [
    `PORT=${deployConfig.serverPort || 3000}`,
    `NODE_ENV=${deployConfig.nodeEnv || 'production'}`,
    `JWT_SECRET=${jwtSecret}`,
    'DB_PATH=apps/server/data/liangye.db',
    'UPLOADS_DIR=apps/server/uploads',
    'DEEPSEEK_API_KEY=',
    'DEEPSEEK_MODEL=deepseek-v4-flash',
    `API_BASE_URL=${deployConfig.apiBaseUrl}`,
    `PUBLIC_BASE_URL=${(deployConfig.apiBaseUrl || '').replace('/api/v1', '')}`,
    deployConfig.cdnBaseUrl ? `CDN_BASE_URL=${deployConfig.cdnBaseUrl}` : '# CDN_BASE_URL=',
    `ADMIN_URL=${deployConfig.adminUrl}`
  ].join('\n') + '\n'

  if (fs.existsSync(envPath)) {
    const existing = fs.readFileSync(envPath, 'utf8')
    if (existing.includes('JWT_SECRET=') && !existing.includes('please-change-this-secret')) {
      console.log('>> .env 已存在且已配置，保留现有 JWT_SECRET')
      return
    }
  }

  fs.writeFileSync(envPath, envContent, 'utf8')
  console.log('>> 已生成 .env（含随机 JWT_SECRET）')
}

function syncMiniProgramConfig() {
  const { syncProdConfig } = require(path.join(root, 'scripts', 'sync-prod-config'))
  syncProdConfig()
}

function writeWechatChecklist() {
  const { writeWechatArtifacts } = require(path.join(root, 'scripts', 'sync-prod-config'))
  writeWechatArtifacts(deployConfig)
  console.log('>> 已生成微信配置清单: deploy/wechat-checklist.txt')
  console.log('>> 已生成域名 JSON: deploy/wechat-domain-config.json')
}

function verifyDeployment() {
  const http = require('http')
  const port = deployConfig.serverPort || 3000
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}/api/v1/health`, res => {
      let body = ''
      res.on('data', chunk => { body += chunk })
      res.on('end', () => {
        try {
          const json = JSON.parse(body)
          if (json.code === 0) {
            console.log('>> API 健康检查通过')
            resolve()
          } else {
            reject(new Error('健康检查返回异常: ' + body))
          }
        } catch (e) {
          reject(e)
        }
      })
    })
    req.on('error', reject)
    req.setTimeout(5000, () => {
      req.destroy()
      reject(new Error('健康检查超时'))
    })
  })
}

async function main() {
  console.log('=== 亮叶企服 一键部署 ===\n')

  ensureDir(path.join(root, 'apps', 'server', 'data'))
  ensureDir(path.join(root, 'apps', 'server', 'uploads'))

  writeEnv()
  syncMiniProgramConfig()
  writeWechatChecklist()

  run('python scripts/generate_all_assets.py', '生成图片资源')
  run('pnpm run db:reset', '初始化数据库')
  run('pnpm run build:admin', '构建管理后台')

  const imageCount = fs.readdirSync(path.join(root, 'images'), { recursive: true })
    .filter(f => /\.(png|webp)$/i.test(String(f))).length
  console.log(`>> 图片资源: ${imageCount} 个文件`)

  const adminDist = path.join(root, 'apps', 'admin', 'dist', 'index.html')
  if (!fs.existsSync(adminDist)) {
    throw new Error('管理后台构建失败: dist/index.html 不存在')
  }
  console.log('>> 管理后台构建产物已就绪')

  console.log('\n>> 启动 API 服务进行健康检查...')
  const { spawn } = require('child_process')
  const server = spawn('node', ['src/server.js'], {
    cwd: path.join(root, 'apps', 'server'),
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    env: { ...process.env, NODE_ENV: 'production' }
  })

  let serverOutput = ''
  server.stdout.on('data', d => { serverOutput += d.toString() })
  server.stderr.on('data', d => { serverOutput += d.toString() })

  await new Promise(r => setTimeout(r, 2500))

  try {
    await verifyDeployment()
  } finally {
    server.kill()
  }

  console.log('\n=== 部署完成 ===')
  console.log(`API:   http://localhost:${deployConfig.serverPort}/api/v1`)
  console.log(`Admin: 构建产物位于 apps/admin/dist（可由服务端 /admin 托管）`)
  console.log(`微信:  请按 deploy/wechat-checklist.txt 配置公众平台域名`)
  console.log(`启动:  pnpm run start:server`)
}

main().catch(err => {
  console.error('\n部署失败:', err.message)
  process.exit(1)
})
