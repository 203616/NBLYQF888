#!/usr/bin/env node
/**
 * 小程序主包/分包体积审计
 * 输出各目录体积、大文件清单与优化建议
 */
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const MAIN_DIRS = ['pages', 'utils', 'api', 'components', 'images', 'styles', 'data']
const IGNORE = new Set(['node_modules', 'apps', 'cloudfunctions', '.git', 'dist'])

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files
  for (const name of fs.readdirSync(dir)) {
    if (IGNORE.has(name)) continue
    const full = path.join(dir, name)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) walk(full, files)
    else files.push({ path: full, size: stat.size })
  }
  return files
}

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

function sumFiles(files) {
  return files.reduce((s, f) => s + f.size, 0)
}

console.log('=== 小程序包体积审计 ===\n')

const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'))
const mainPages = app.pages || []
const subpackages = app.subpackages || []

let mainTotal = 0
const mainBreakdown = []

for (const dir of MAIN_DIRS) {
  const dirPath = path.join(root, dir)
  const files = walk(dirPath)
  const size = sumFiles(files)
  if (size > 0) {
    mainBreakdown.push({ name: dir, size, files: files.length })
    mainTotal += size
  }
}

mainBreakdown.sort((a, b) => b.size - a.size)
console.log('【主包目录体积】')
mainBreakdown.forEach(row => {
  console.log(`  ${row.name.padEnd(14)} ${formatSize(row.size).padStart(10)}  (${row.files} 文件)`)
})
console.log(`  ${'合计'.padEnd(14)} ${formatSize(mainTotal).padStart(10)}`)
console.log(`  主包页面数: ${mainPages.length}`)

console.log('\n【分包体积】')
let subTotal = 0
subpackages.forEach(pkg => {
  const pkgPath = path.join(root, pkg.root)
  const files = walk(pkgPath)
  const size = sumFiles(files)
  subTotal += size
  console.log(`  ${(pkg.name || pkg.root).padEnd(16)} ${formatSize(size).padStart(10)}  (${pkg.pages.length} 页)`)
})
console.log(`  ${'分包合计'.padEnd(16)} ${formatSize(subTotal).padStart(10)}`)

const allFiles = walk(root).filter(f => !f.path.includes('node_modules') && !f.path.includes(`${path.sep}apps${path.sep}`))
const largeFiles = allFiles.filter(f => f.size > 200 * 1024).sort((a, b) => b.size - a.size)

console.log('\n【大文件 (>200KB)】')
if (!largeFiles.length) {
  console.log('  无超过 200KB 的文件')
} else {
  largeFiles.slice(0, 15).forEach(f => {
    const rel = path.relative(root, f.path)
    console.log(`  ${formatSize(f.size).padStart(10)}  ${rel}`)
  })
  if (largeFiles.length > 15) console.log(`  ... 另有 ${largeFiles.length - 15} 个大文件`)
}

const MAIN_PKG_LIMIT = 2 * 1024 * 1024
const warnings = []
if (mainTotal > MAIN_PKG_LIMIT) {
  warnings.push(`主包体积 ${formatSize(mainTotal)} 超过微信建议 2MB，请将大资源移至分包或 CDN`)
}
if (largeFiles.some(f => /\.(png|jpg|jpeg)$/i.test(f.path) && f.size > 500 * 1024)) {
  warnings.push('存在超过 500KB 的位图，建议压缩为 WebP 或降低分辨率')
}

console.log('\n【优化建议】')
if (warnings.length) warnings.forEach(w => console.log(`  ⚠ ${w}`))
else console.log('  ✓ 主包体积在合理范围内')
console.log('  · 图片资源优先使用 WebP，tabBar 图标建议 < 40KB')
console.log('  · 已在 project.config.json 忽略 apps/node_modules 等目录')
console.log('  · 运行 pnpm optimize:images 可批量压缩为 WebP')
console.log('  · 内容图已迁移至各分包 images/ 目录')

console.log(`\n=== 审计完成：主包 ${formatSize(mainTotal)} + 分包 ${formatSize(subTotal)} ===`)
if (mainTotal > MAIN_PKG_LIMIT) process.exit(1)
