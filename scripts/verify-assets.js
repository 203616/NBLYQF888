#!/usr/bin/env node
/**
 * 校验代码中引用的图片资源是否存在（WebP 或 PNG 回退至少一种）
 * 不删除任何文件，仅报告缺失
 */
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const SKIP = new Set(['node_modules', 'apps', '.git', 'dist', 'cloudfunctions'])

const MAIN_FALLBACK_MAP = {
  '/images/banner1.webp': 'subpackages/banner/images/banner1.png',
  '/images/banner2.webp': 'subpackages/banner/images/banner2.png',
  '/images/banner3.webp': 'subpackages/banner/images/banner3.png',
  '/images/logo.webp': 'subpackages/banner/images/logo.png',
  '/images/avatar.webp': 'subpackages/banner/images/avatar.png'
}

function walkFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue
    const full = path.join(dir, name)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) walkFiles(full, acc)
    else if (/\.(js|wxml|wxss|json)$/.test(name)) acc.push(full)
  }
  return acc
}

function extractPaths(content) {
  const paths = new Set()
  const re = /['"](\/(?:images|subpackages)\/[^'"]+\.(?:webp|png|jpe?g|gif))['"]/gi
  let m
  while ((m = re.exec(content))) paths.add(m[1])
  return paths
}

function resolveCandidates(urlPath) {
  const rel = urlPath.replace(/^\//, '')
  const candidates = [path.join(root, rel)]
  if (urlPath.endsWith('.webp')) {
    candidates.push(path.join(root, rel.replace(/\.webp$/i, '.png')))
    const fb = MAIN_FALLBACK_MAP[urlPath]
    if (fb) candidates.push(path.join(root, fb))
  }
  if (urlPath.endsWith('.png')) {
    candidates.push(path.join(root, rel.replace(/\.png$/i, '.webp')))
  }
  return candidates
}

function existsAny(candidates) {
  return candidates.some(p => fs.existsSync(p))
}

const allPaths = new Set()
walkFiles(root).forEach(file => {
  const text = fs.readFileSync(file, 'utf8')
  extractPaths(text).forEach(p => allPaths.add(p))
})

const missing = []
allPaths.forEach(p => {
  if (!existsAny(resolveCandidates(p))) missing.push(p)
})

console.log('=== 图片资源完整性检查 ===')
console.log(`引用路径: ${allPaths.size}`)
if (missing.length) {
  console.error('MISSING:')
  missing.forEach(p => console.error(`  ${p}`))
  console.error(`\n共 ${missing.length} 个路径无 WebP/PNG 回退`)
  console.error('修复: pnpm ensure:fallbacks')
  process.exit(1)
}
console.log('ALL_ASSETS_OK', allPaths.size)
