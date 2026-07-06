#!/usr/bin/env node
/**
 * 将 deploy/deploy.config.json 同步到 utils/config.js（不删改其他源码）
 */
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const deployConfigPath = path.join(root, 'deploy', 'deploy.config.json')
const configJsPath = path.join(root, 'utils', 'config.js')

function syncProdConfig(options = {}) {
  const { silent = false } = options
  const deployConfig = JSON.parse(fs.readFileSync(deployConfigPath, 'utf8'))
  let content = fs.readFileSync(configJsPath, 'utf8')

  const apiBase = deployConfig.apiBaseUrl || 'https://api.liangyeqf.com/api/v1'
  const cdnBase = deployConfig.cdnBaseUrl || 'https://cdn.liangyeqf.com'
  const useCdn = deployConfig.useCdnImages === true

  content = content.replace(
    /const PRODUCTION_API_BASE = '[^']*'/,
    `const PRODUCTION_API_BASE = '${apiBase}'`
  )
  content = content.replace(
    /const PRODUCTION_CDN_BASE = '[^']*'/,
    `const PRODUCTION_CDN_BASE = '${cdnBase}'`
  )
  content = content.replace(
    /const PRODUCTION_USE_CDN = (true|false)/,
    `const PRODUCTION_USE_CDN = ${useCdn}`
  )
  if (!content.includes('PRODUCTION_USE_CDN')) {
    content = content.replace(
      /const PRODUCTION_CDN_BASE = '[^']*'/,
      `const PRODUCTION_CDN_BASE = '${cdnBase}'\nconst PRODUCTION_USE_CDN = ${useCdn}`
    )
  }
  content = content.replace(
    /cdnBaseUrl: PRODUCTION_CDN_BASE,\s*\n\s*useCdnImages: (true|false)/,
    `cdnBaseUrl: PRODUCTION_CDN_BASE,\n    useCdnImages: PRODUCTION_USE_CDN`
  )

  fs.writeFileSync(configJsPath, content, 'utf8')

  writeWechatArtifacts(deployConfig)

  if (!silent) {
    console.log('>> 已同步生产配置 → utils/config.js')
    console.log(`   API:  ${apiBase}`)
    console.log(`   CDN:  ${cdnBase}`)
    console.log(`   CDN图片: ${useCdn ? '开启' : '关闭（默认本地分包）'}`)
  }

  return deployConfig
}

function uniqueDomains(list) {
  return [...new Set(list.filter(Boolean))]
}

function writeWechatArtifacts(deployConfig) {
  const cdn = deployConfig.cdnBaseUrl || ''
  const requestDomains = uniqueDomains(deployConfig.requestDomains || [])
  const uploadDomains = uniqueDomains(deployConfig.uploadDomains || [])
  const downloadDomains = uniqueDomains([
    ...(deployConfig.downloadDomains || []),
    ...(deployConfig.useCdnImages && cdn ? [cdn] : [])
  ])
  const webViewDomains = uniqueDomains(deployConfig.webViewDomains || [])

  const domainJson = {
    appId: deployConfig.appId,
    appName: deployConfig.appName,
    updatedAt: new Date().toISOString(),
    mpAdminUrl: 'https://mp.weixin.qq.com → 开发 → 开发管理 → 开发设置 → 服务器域名',
    requestDomains,
    uploadDomains,
    downloadDomains,
    webViewDomains,
    notes: [
      '启用 CDN 图片时，须将 cdn 域名加入 downloadFile 合法域名',
      'useCdnImages 为 false 时仍可使用本地分包 WebP/PNG，不影响编译',
      '正式版 request/upload/download 均须 HTTPS'
    ]
  }

  fs.writeFileSync(
    path.join(root, 'deploy', 'wechat-domain-config.json'),
    JSON.stringify(domainJson, null, 2),
    'utf8'
  )

  const lines = [
    `# 微信公众平台配置清单（AppID: ${deployConfig.appId}）`,
    '',
    '登录 https://mp.weixin.qq.com → 开发 → 开发管理 → 开发设置 → 服务器域名',
    '',
    '【request 合法域名】',
    ...requestDomains.map(d => `  ${d}`),
    '',
    '【uploadFile 合法域名】',
    ...uploadDomains.map(d => `  ${d}`),
    '',
    '【downloadFile 合法域名】（含 CDN 图片域名）',
    ...downloadDomains.map(d => `  ${d}`),
    '',
    '【业务域名 / web-view】',
    ...webViewDomains.map(d => `  ${d}`),
    '',
    '【CDN 静态资源】',
    `  域名: ${cdn || '未配置'}`,
    `  小程序 useCdnImages: ${deployConfig.useCdnImages ? 'true' : 'false'}`,
    '  打包: pnpm prepare:cdn → 上传 deploy/cdn-staging/ 至 CDN 根目录',
    '',
    '【管理后台】',
    `  ${deployConfig.adminUrl}`,
    '',
    '【API 健康检查】',
    `  ${(deployConfig.apiBaseUrl || '').replace('/api/v1', '')}/api/v1/health`,
    '',
    '【上传前检查】',
    '  pnpm verify:production',
    '  pnpm verify:compile',
    '',
    '注意: 域名须完成 HTTPS 备案与解析后再提交审核。'
  ]

  fs.writeFileSync(path.join(root, 'deploy', 'wechat-checklist.txt'), lines.join('\n'), 'utf8')
}

if (require.main === module) {
  syncProdConfig()
}

module.exports = { syncProdConfig, writeWechatArtifacts }
