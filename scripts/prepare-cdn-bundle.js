#!/usr/bin/env node
/**
 * 打包 CDN 静态资源到 deploy/cdn-staging/（复制，不删除源文件）
 * 目录结构与小程序路径一致：/images/... /subpackages/...
 */
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const staging = path.join(root, 'deploy', 'cdn-staging')
const IMAGE_EXT = /\.(webp|png|jpe?g|gif)$/i
const SKIP = new Set(['node_modules', 'apps', '.git', 'cloudfunctions'])

let copied = 0
let bytes = 0

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function shouldInclude(filePath) {
  const rel = path.relative(root, filePath).replace(/\\/g, '/')
  if (!IMAGE_EXT.test(rel)) return false
  if (rel.startsWith('deploy/cdn-staging')) return false
  if (rel.includes('/node_modules/')) return false
  if (rel.startsWith('apps/')) return false
  if (rel.startsWith('images/icon/')) {
    // tabBar 图标保留在主包，可不传 CDN；仍复制以便完整镜像
    return true
  }
  return rel.startsWith('images/') || rel.includes('/images/')
}

function walkCopy(srcDir) {
  if (!fs.existsSync(srcDir)) return
  for (const name of fs.readdirSync(srcDir)) {
    const full = path.join(srcDir, name)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      if (SKIP.has(name)) continue
      walkCopy(full)
    } else if (shouldInclude(full)) {
      const rel = path.relative(root, full)
      const dest = path.join(staging, rel)
      ensureDir(path.dirname(dest))
      fs.copyFileSync(full, dest)
      copied += 1
      bytes += stat.size
    }
  }
}

function writeManifest() {
  const manifest = {
    generatedAt: new Date().toISOString(),
    files: copied,
    totalBytes: bytes,
    uploadHint: '将 cdn-staging 内所有文件按相对路径上传至 CDN 根目录（与小程序 /images、/subpackages 路径一致）',
    localTestUrl: 'http://localhost:3000/mp-assets/images/banner1.webp'
  }
  fs.writeFileSync(path.join(staging, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8')
}

function main() {
  console.log('=== CDN 静态资源打包（仅复制）===\n')
  ensureDir(staging)

  walkCopy(path.join(root, 'images'))
  const subRoot = path.join(root, 'subpackages')
  if (fs.existsSync(subRoot)) {
    for (const pkg of fs.readdirSync(subRoot)) {
      const imgDir = path.join(subRoot, pkg, 'images')
      if (fs.existsSync(imgDir)) walkCopy(imgDir)
    }
  }

  writeManifest()

  console.log(`已复制 ${copied} 个文件 → deploy/cdn-staging/`)
  console.log(`合计 ${(bytes / 1024 / 1024).toFixed(2)} MB`)
  console.log('源文件未改动。上传 CDN 后可在 deploy.config.json 设置 useCdnImages: true')
}

main()
