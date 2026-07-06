#!/usr/bin/env node
/**
 * 正式版发布检查清单 CLI（与后台「正式版清单」页同源）
 *
 * 用法:
 *   pnpm release:checklist
 *   node scripts/release-checklist.js
 */
const { runReleaseChecklist } = require('./release-checklist-core')

const STATUS_LABEL = { ok: 'OK', warn: 'WARN', fail: 'FAIL' }

function main() {
  console.log('=== 正式版发布检查清单 ===\n')
  const { checks, summary, generatedAt } = runReleaseChecklist()

  for (const c of checks) {
    const tag = STATUS_LABEL[c.status] || c.status.toUpperCase()
    console.log(`  [${tag}] ${c.label}${c.detail ? ' - ' + c.detail : ''}`)
    if (c.cmd) console.log(`         → ${c.cmd}`)
  }

  console.log('\n--- 汇总 ---')
  console.log(`  共 ${summary.total} 项 | 通过 ${summary.passed} | 警告 ${summary.warned} | 失败 ${summary.failed}`)
  console.log(`  可提交正式版: ${summary.ready ? '是（无失败项）' : '否'}`)
  console.log(`  生成时间: ${generatedAt}`)

  if (!summary.ready) process.exit(1)
}

main()
