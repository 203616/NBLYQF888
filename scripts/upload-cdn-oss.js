#!/usr/bin/env node
/**
 * 上传 deploy/cdn-staging/ 至阿里云 OSS（仅上传镜像，不删源文件）
 *
 * 环境变量:
 *   OSS_REGION=oss-cn-hangzhou
 *   OSS_BUCKET=liangye-cdn
 *   OSS_ACCESS_KEY_ID=
 *   OSS_ACCESS_KEY_SECRET=
 *   OSS_PREFIX=          # 可选，对象 key 前缀
 *
 * 用法:
 *   pnpm prepare:cdn
 *   node scripts/upload-cdn-oss.js --dry-run
 *   node scripts/upload-cdn-oss.js
 */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const root = path.resolve(__dirname, '..')
const staging = path.join(root, 'deploy', 'cdn-staging')
const dryRun = process.argv.includes('--dry-run')

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

function listFiles(dir, base = dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const name of fs.readdirSync(dir)) {
    if (name === 'manifest.json' || name === 'README.txt') continue
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) out.push(...listFiles(full, base))
    else out.push({ local: full, key: path.relative(base, full).replace(/\\/g, '/') })
  }
  return out
}

function contentType(key) {
  if (key.endsWith('.webp')) return 'image/webp'
  if (key.endsWith('.png')) return 'image/png'
  if (key.endsWith('.jpg') || key.endsWith('.jpeg')) return 'image/jpeg'
  if (key.endsWith('.gif')) return 'image/gif'
  return 'application/octet-stream'
}

async function uploadWithAliOss(files, env) {
  let OSS
  try {
    OSS = require('ali-oss')
  } catch {
    throw new Error('请先安装 ali-oss: pnpm add -D ali-oss')
  }

  const prefix = (env.OSS_PREFIX || '').replace(/\/$/, '')
  const client = new OSS({
    region: env.OSS_REGION,
    accessKeyId: env.OSS_ACCESS_KEY_ID,
    accessKeySecret: env.OSS_ACCESS_KEY_SECRET,
    bucket: env.OSS_BUCKET
  })

  let uploaded = 0
  for (const file of files) {
    const objectKey = prefix ? `${prefix}/${file.key}` : file.key
    if (dryRun) {
      console.log(`  [dry-run] ${objectKey}`)
      uploaded += 1
      const pct = Math.round((uploaded / files.length) * 100)
      console.log(`[progress] ${uploaded}/${files.length} ${pct}% ${objectKey}`)
      continue
    }
    await client.put(objectKey, file.local, {
      headers: { 'Content-Type': contentType(file.key), 'Cache-Control': 'public, max-age=31536000' }
    })
    uploaded += 1
    const pct = Math.round((uploaded / files.length) * 100)
    console.log(`[progress] ${uploaded}/${files.length} ${pct}% ${objectKey}`)
  }
  return uploaded
}

async function main() {
  console.log('=== CDN → OSS 上传 ===\n')

  if (!fs.existsSync(staging)) {
    console.log('缺少 deploy/cdn-staging/，正在生成…')
    execSync('node scripts/prepare-cdn-bundle.js', { cwd: root, stdio: 'inherit' })
  }

  const files = listFiles(staging)
  if (!files.length) {
    console.error('cdn-staging 无图片文件，请先 pnpm prepare:cdn')
    process.exit(1)
  }

  const env = { ...loadEnvFile(path.join(root, '.env.example')), ...loadEnvFile(path.join(root, '.env')), ...process.env }
  const required = ['OSS_REGION', 'OSS_BUCKET', 'OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET']
  const missing = required.filter(k => !env[k])

  console.log(`待上传 ${files.length} 个文件${dryRun ? ' (dry-run)' : ''}`)

  if (missing.length) {
    if (dryRun) {
      let i = 0
      for (const f of files) {
        i += 1
        console.log(`  [dry-run] ${f.key}`)
        const pct = Math.round((i / files.length) * 100)
        console.log(`[progress] ${i}/${files.length} ${pct}% ${f.key}`)
      }
      console.log('\n未配置 OSS 密钥，dry-run 通过。正式上传请配置 .env 中 OSS_* 变量')
      return
    }
    console.error('缺少环境变量:', missing.join(', '))
    console.error('示例见 .env.example 中 OSS_* 配置')
    process.exit(1)
  }

  const uploaded = await uploadWithAliOss(files, env)
  if (dryRun) {
    console.log('\ndry-run 完成')
    return
  }
  console.log(`\n上传完成: ${uploaded} 个文件 → oss://${env.OSS_BUCKET}/`)
  console.log('请在 deploy.config.json 设置 useCdnImages: true 后执行 pnpm sync:prod')
}

main().catch(err => {
  console.error('\n上传失败:', err.message)
  process.exit(1)
})
