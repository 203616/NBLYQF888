const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const root = path.resolve(__dirname, '../../../..')

function maskSecret(value) {
  if (!value) return ''
  const s = String(value)
  if (s.length <= 8) return '****'
  return `${s.slice(0, 4)}****${s.slice(-4)}`
}

function readJson(file, fallback = null) {
  try {
    if (!fs.existsSync(file)) return fallback
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}

function countStagingFiles() {
  const staging = path.join(root, 'deploy', 'cdn-staging')
  if (!fs.existsSync(staging)) return { exists: false, count: 0, bytes: 0 }
  const manifest = readJson(path.join(staging, 'manifest.json'))
  if (manifest?.fileCount) {
    return {
      exists: true,
      count: manifest.fileCount,
      bytes: manifest.totalBytes || 0,
      updatedAt: manifest.generatedAt || null
    }
  }
  let count = 0
  let bytes = 0
  const walk = dir => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name)
      if (fs.statSync(full).isDirectory()) walk(full)
      else if (!/manifest\.json|README\.txt/i.test(name)) {
        count += 1
        bytes += fs.statSync(full).size
      }
    }
  }
  walk(staging)
  return { exists: count > 0, count, bytes, updatedAt: null }
}

function getMainPackageSizeKb() {
  try {
    const out = execSync('node scripts/audit-bundle.js', { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    const m = out.match(/主包[^\d]*([\d.]+)\s*KB/i) || out.match(/([\d.]+)\s*KB/i)
    return m ? parseFloat(m[1]) : null
  } catch {
    return null
  }
}

function resolvePrivateKeyPath() {
  const envPath = process.env.WECHAT_UPLOAD_PRIVATE_KEY_PATH || ''
  if (!envPath) return null
  const candidates = [path.resolve(root, envPath), envPath]
  return candidates.find(p => fs.existsSync(p)) || null
}

function getDeployStatus() {
  const deployConfig = readJson(path.join(root, 'deploy', 'deploy.config.json'), {})
  const projectConfig = readJson(path.join(root, 'project.config.json'), {})
  const domainConfig = readJson(path.join(root, 'deploy', 'wechat-domain-config.json'), {})
  const configJs = fs.existsSync(path.join(root, 'utils', 'config.js'))
    ? fs.readFileSync(path.join(root, 'utils', 'config.js'), 'utf8')
    : ''

  const appId = deployConfig.appId || projectConfig.appid || ''
  const appIdMatch = !appId || !projectConfig.appid || appId === projectConfig.appid
  const staging = countStagingFiles()
  const mainPackageKb = getMainPackageSizeKb()

  const ossConfigured = !!(
    process.env.OSS_REGION &&
    process.env.OSS_BUCKET &&
    process.env.OSS_ACCESS_KEY_ID &&
    process.env.OSS_ACCESS_KEY_SECRET
  )

  const privateKeyInline = !!process.env.WECHAT_UPLOAD_PRIVATE_KEY
  const privateKeyPath = resolvePrivateKeyPath()
  const miniprogramUploadReady = !!(privateKeyInline || privateKeyPath)
  const previewQrcodePath = path.join(root, 'deploy', 'preview-qrcode.jpg')
  const previewQrcodeExists = fs.existsSync(previewQrcodePath)

  const configSynced = deployConfig.apiBaseUrl
    ? configJs.includes(deployConfig.apiBaseUrl)
    : false

  const useCdn = !!deployConfig.useCdnImages
  const cdnReady = !useCdn || staging.exists

  const steps = [
    { id: 'sync', label: '同步生产配置', done: configSynced, cmd: 'pnpm sync:prod' },
    { id: 'verify', label: '发布前校验', done: true, cmd: 'pnpm verify:production' },
    { id: 'cdn', label: 'CDN 镜像打包', done: staging.exists, cmd: 'pnpm prepare:cdn' },
    { id: 'oss', label: 'OSS 上传', done: ossConfigured, cmd: 'pnpm upload:cdn' },
    { id: 'domains', label: '微信域名配置', done: !!(domainConfig.downloadDomains || []).length, cmd: '见 deploy/wechat-checklist.txt' },
    { id: 'upload', label: '小程序代码上传', done: miniprogramUploadReady, cmd: 'pnpm upload:mp' }
  ]

  return {
    app: {
      appId,
      appName: deployConfig.appName || '亮叶企服',
      appIdMatch,
      libVersion: projectConfig.libVersion || '-'
    },
    api: {
      baseUrl: deployConfig.apiBaseUrl || '',
      configSynced
    },
    cdn: {
      baseUrl: deployConfig.cdnBaseUrl || process.env.CDN_BASE_URL || '',
      useCdnImages: useCdn,
      staging,
      cdnReady,
      oss: {
        configured: ossConfigured,
        region: process.env.OSS_REGION || '',
        bucket: process.env.OSS_BUCKET || '',
        accessKeyId: maskSecret(process.env.OSS_ACCESS_KEY_ID)
      }
    },
    miniprogram: {
      uploadReady: miniprogramUploadReady,
      privateKeyConfigured: miniprogramUploadReady,
      privateKeyPath: privateKeyPath ? path.basename(privateKeyPath) : '',
      mainPackageKb,
      version: process.env.MINIPROGRAM_VERSION || '1.0.0',
      robot: deployConfig.miniprogramRobot || parseInt(process.env.MINIPROGRAM_ROBOT || '1', 10),
      autoTrial: deployConfig.miniprogramAutoTrial !== false,
      trialHint: '首次需在 mp.weixin.qq.com 版本管理将 robot 对应版本设为体验版，之后同 robot 上传会自动替换',
      uploadCmd: 'pnpm upload:mp -- --set-trial --desc "体验版"',
      dryRunCmd: 'pnpm upload:mp:dry',
      previewCmd: 'pnpm upload:mp:preview',
      previewQrcodeExists,
      previewQrcodeUrl: previewQrcodeExists ? '/api/v1/admin/deploy/qrcode' : ''
    },
    wechatDomains: {
      request: domainConfig.requestDomains || deployConfig.requestDomains || [],
      upload: domainConfig.uploadDomains || deployConfig.uploadDomains || [],
      download: domainConfig.downloadDomains || deployConfig.downloadDomains || [],
      webView: domainConfig.webViewDomains || deployConfig.webViewDomains || [],
      mpAdminUrl: domainConfig.mpAdminUrl || ''
    },
    steps,
    commands: [
      'pnpm sync:prod',
      'pnpm verify:production',
      'pnpm prepare:cdn',
      'pnpm upload:cdn:dry',
      'pnpm upload:cdn',
      'pnpm upload:mp:dry',
      'pnpm upload:mp -- --desc "体验版"'
    ]
  }
}

module.exports = { getDeployStatus }
