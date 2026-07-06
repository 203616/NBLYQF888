#!/usr/bin/env node
/**
 * 融圈自动审核规则冒烟测试
 */
const path = require('path')
const {
  evaluateFinancePostReview,
  evaluateFinancePostReviewAsync,
  saveModerationRules,
  loadModerationRules
} = require(path.join(__dirname, '../apps/server/src/services/finance-circle-moderation.service'))

async function main() {
  const rules = loadModerationRules()
  if (!rules.enabled) {
    console.log('  [WARN] moderation disabled in config')
  }

  const syncCases = [
    { content: '今天分享了经营贷办理心得', images: [], expect: 'approved' },
    { content: '附图说明', images: ['/uploads/x.jpg'], expect: 'pending' },
    { content: '请勿参与赌博活动', images: [], expect: 'rejected' }
  ]

  let failed = false
  for (const c of syncCases) {
    const result = evaluateFinancePostReview(c)
    if (result.status !== c.expect) {
      failed = true
      console.error(`  [FAIL] sync "${c.content.slice(0, 12)}" => ${result.status}, want ${c.expect}`)
    } else {
      console.log(`  [OK] sync ${c.expect} (${result.rule})`)
    }
  }

  const asyncResult = await evaluateFinancePostReviewAsync({
    content: '合规分享融资经验',
    images: []
  })
  if (asyncResult.status !== 'approved') {
    failed = true
    console.error(`  [FAIL] async approved => ${asyncResult.status}`)
  } else {
    console.log(`  [OK] async approved (${asyncResult.rule})`)
  }

  const saved = saveModerationRules(loadModerationRules())
  if (!Array.isArray(saved.blockedKeywords)) {
    failed = true
    console.error('  [FAIL] saveModerationRules')
  } else {
    console.log('  [OK] saveModerationRules')
  }

  if (failed) process.exit(1)
  console.log('ALL_FINANCE_MODERATION_OK')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
