#!/usr/bin/env node
/**
 * 编译前综合校验：页面四件套 + 图片资源 + 主包体积
 */
const { execSync } = require('child_process')
const path = require('path')

const root = path.resolve(__dirname, '..')
const steps = [
  { name: '页面四件套', cmd: 'node scripts/verify-pages.js' },
  { name: '图片资源', cmd: 'node scripts/verify-assets.js' },
  { name: '主包体积', cmd: 'node scripts/audit-bundle.js' }
]

console.log('=== 编译前综合校验 ===\n')
let failed = false

for (const step of steps) {
  process.stdout.write(`>> ${step.name}... `)
  try {
    const out = execSync(step.cmd, { cwd: root, encoding: 'utf8' }).trim()
    console.log('OK')
    if (out) console.log(`   ${out.split('\n').pop()}`)
  } catch (e) {
    failed = true
    console.log('FAIL')
    const msg = (e.stdout || e.stderr || e.message || '').trim()
    if (msg) console.log(msg.split('\n').slice(-5).join('\n'))
  }
}

console.log(failed ? '\n=== 校验未通过，请修复后重新编译 ===' : '\n=== 全部通过，可正常编译上传 ===')
if (failed) process.exit(1)
