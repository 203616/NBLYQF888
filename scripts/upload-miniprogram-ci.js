#!/usr/bin/env node
/**
 * 使用 miniprogram-ci 上传小程序代码（体验版/开发版）
 *
 * 环境变量:
 *   WECHAT_UPLOAD_PRIVATE_KEY       上传密钥内容（与路径二选一）
 *   WECHAT_UPLOAD_PRIVATE_KEY_PATH  上传密钥文件路径
 *   MINIPROGRAM_VERSION             版本号，默认 1.0.0
 *
 * 用法:
 *   pnpm upload:mp:dry
 *   pnpm upload:mp -- --desc "体验版 v1.0"
 *   pnpm upload:mp -- --preview --desc "预览"
 */
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execSync } = require('child_process')

const root = path.resolve(__dirname, '..')
const dryRun = process.argv.includes('--dry-run')
const preview = process.argv.includes('--preview')
const setTrial = process.argv.includes('--set-trial')

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return {}
  const out = {}
  fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach(line => {
    const t = line.trim()
    if (!t || t.startsWith('#')) return
    const m = t.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) out[m[1]] = m[2].trim()
  })
  return out
}

function parseDesc() {
  const arg = process.argv.find(a => a.startsWith('--desc='))
  if (arg) return arg.slice('--desc='.length)
  const idx = process.argv.indexOf('--desc')
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1]
  return process.env.MINIPROGRAM_DESC || '亮叶企服 CI 上传'
}

function parseRobot(deployConfig, env) {
  const arg = process.argv.find(a => a.startsWith('--robot='))
  if (arg) return parseInt(arg.slice('--robot='.length), 10)
  const idx = process.argv.indexOf('--robot')
  if (idx >= 0 && process.argv[idx + 1]) return parseInt(process.argv[idx + 1], 10)
  const fromEnv = env.MINIPROGRAM_ROBOT || deployConfig.miniprogramRobot
  const robot = parseInt(fromEnv || '1', 10)
  return Number.isFinite(robot) && robot >= 1 && robot <= 30 ? robot : 1
}

function resolvePrivateKey(env) {
  if (env.WECHAT_UPLOAD_PRIVATE_KEY) return { content: env.WECHAT_UPLOAD_PRIVATE_KEY, temp: false }
  const keyPath = env.WECHAT_UPLOAD_PRIVATE_KEY_PATH
  if (!keyPath) return null
  const candidates = [path.resolve(root, keyPath), keyPath]
  const found = candidates.find(p => fs.existsSync(p))
  if (found) return { content: fs.readFileSync(found, 'utf8'), temp: false, path: found }
  return null
}

function writeTempKey(content) {
  const file = path.join(os.tmpdir(), `lyqf-upload-${Date.now()}.key`)
  fs.writeFileSync(file, content, 'utf8')
  return file
}

async function main() {
  console.log('=== 小程序 miniprogram-ci 上传 ===\n')

  const deployConfig = JSON.parse(fs.readFileSync(path.join(root, 'deploy', 'deploy.config.json'), 'utf8'))
  const projectConfig = JSON.parse(fs.readFileSync(path.join(root, 'project.config.json'), 'utf8'))
  const appid = deployConfig.appId || projectConfig.appid
  if (!appid) {
    console.error('缺少 appId，请检查 deploy.config.json / project.config.json')
    process.exit(1)
  }
  if (deployConfig.appId && projectConfig.appid && deployConfig.appId !== projectConfig.appid) {
    console.error(`appId 不一致: deploy=${deployConfig.appId} project=${projectConfig.appid}`)
    process.exit(1)
  }

  console.log('>> 编译前校验')
  execSync('node scripts/verify-pages.js', { cwd: root, stdio: 'inherit' })
  execSync('node scripts/verify-assets.js', { cwd: root, stdio: 'inherit' })
  const auditOut = execSync('node scripts/audit-bundle.js', { cwd: root, encoding: 'utf8' })
  console.log(auditOut.trim())

  const env = { ...loadEnvFile(path.join(root, '.env.example')), ...loadEnvFile(path.join(root, '.env')), ...process.env }
  const version = env.MINIPROGRAM_VERSION || '1.0.0'
  const desc = parseDesc()
  const robot = parseRobot(deployConfig, env)
  const keyInfo = resolvePrivateKey(env)

  console.log(`\nAppID: ${appid}`)
  console.log(`版本: ${version}`)
  console.log(`说明: ${desc}`)
  console.log(`CI 机器人: ${robot}`)
  console.log(`模式: ${preview ? '预览' : dryRun ? 'dry-run' : '上传'}`)
  if (setTrial) {
    console.log('体验版: 若该 robot 已设为体验版槽位，上传后将自动替换为体验版')
  }

  if (dryRun) {
    if (keyInfo) console.log('上传密钥: 已配置')
    else console.log('上传密钥: 未配置（dry-run 仍可通过，正式上传需 WECHAT_UPLOAD_PRIVATE_KEY*）')
    console.log('\ndry-run 通过。正式上传: pnpm upload:mp -- --desc "体验版"')
    return
  }

  if (!keyInfo) {
    console.error('\n缺少上传密钥，请配置:')
    console.error('  WECHAT_UPLOAD_PRIVATE_KEY_PATH=deploy/private.key')
    console.error('或 WECHAT_UPLOAD_PRIVATE_KEY=<密钥内容>')
    console.error('密钥获取: 微信公众平台 → 开发管理 → 开发设置 → 小程序代码上传')
    process.exit(1)
  }

  let ci
  try {
    ci = require('miniprogram-ci')
  } catch {
    console.error('请先安装 miniprogram-ci: pnpm add -D miniprogram-ci')
    process.exit(1)
  }

  let privateKeyPath = keyInfo.path
  let tempKey = null
  if (!privateKeyPath) {
    tempKey = writeTempKey(keyInfo.content)
    privateKeyPath = tempKey
  }

  const project = new ci.Project({
    appid,
    type: 'miniProgram',
    projectPath: root,
    privateKeyPath,
    ignores: ['node_modules/**/*', 'apps/**/*', 'deploy/**/*', '.git/**/*']
  })

  const setting = {
    es6: true,
    es7: true,
    minifyJS: true,
    minifyWXML: true,
    minifyWXSS: true,
    minify: true,
    codeProtect: false,
    autoPrefixWXSS: true
  }

  try {
    if (preview) {
      console.log('\n>> 生成预览二维码…')
      const result = await ci.preview({
        project,
        desc,
        robot,
        setting,
        qrcodeFormat: 'image',
        qrcodeOutputDest: path.join(root, 'deploy', 'preview-qrcode.jpg'),
        onProgressUpdate: () => {}
      })
      console.log('预览完成')
      if (result?.subPackageInfo) {
        console.log('分包信息已返回')
      }
      console.log('二维码: deploy/preview-qrcode.jpg')
      return
    }

    console.log('\n>> 上传代码…')
    const result = await ci.upload({
      project,
      version,
      desc,
      robot,
      setting,
      onProgressUpdate: msg => {
        if (msg?.message) console.log(`[progress] ${msg.message}`)
      }
    })
    console.log('\n上传完成')
    if (result?.subPackageInfo?.length) {
      console.log(`分包: ${result.subPackageInfo.length} 个`)
    }
    if (setTrial || deployConfig.miniprogramAutoTrial) {
      console.log(`\n体验版说明:`)
      console.log(`  · CI 机器人 #${robot} 上传成功`)
      console.log(`  · 若 mp.weixin.qq.com 已将 robot ${robot} 设为体验版，本次版本已自动成为体验版`)
      console.log(`  · 首次发布请登录 版本管理 → 开发版本 → 选 robot ${robot} 的版本 → 设为体验版`)
    } else {
      console.log('请登录 mp.weixin.qq.com → 版本管理 → 选为体验版')
    }
  } finally {
    if (tempKey && fs.existsSync(tempKey)) fs.unlinkSync(tempKey)
  }
}

main().catch(err => {
  console.error('\n上传失败:', err.message || err)
  process.exit(1)
})
