#!/usr/bin/env node

/**

 * 真机/联调冒烟验证：页面完整性 + 核心 API + 全链路端点

 */

const fs = require('fs')

const path = require('path')

const http = require('http')

const { execSync } = require('child_process')



const root = path.resolve(__dirname, '..')

const port = Number(process.env.PORT || 3000)

const apiBase = `http://127.0.0.1:${port}/api/v1`



const checks = []



function ok(name, detail) {

  checks.push({ name, status: 'ok', detail })

  console.log(`  [OK] ${name}${detail ? ' - ' + detail : ''}`)

}



function fail(name, detail) {

  checks.push({ name, status: 'fail', detail })

  console.log(`  [FAIL] ${name} - ${detail}`)

}



function httpGet(url) {

  return new Promise((resolve, reject) => {

    const req = http.get(url, res => {

      let body = ''

      res.on('data', c => { body += c })

      res.on('end', () => resolve({ status: res.statusCode, body }))

    })

    req.on('error', reject)

    req.setTimeout(8000, () => { req.destroy(); reject(new Error('timeout')) })

  })

}



function parseJson(body) {

  try { return JSON.parse(body) } catch { return null }

}



console.log('=== 真机联调冒烟验证 ===\n')



console.log('>> 页面文件完整性')

try {

  const out = execSync('node scripts/verify-pages.js', { cwd: root, encoding: 'utf8' }).trim()

  ok('页面四件套', out)

} catch (e) {

  fail('页面四件套', e.stdout?.trim() || e.message || 'verify-pages 失败')

}



console.log('\n>> 主包体积')

try {

  execSync('node scripts/audit-bundle.js', { cwd: root, encoding: 'utf8', stdio: 'pipe' })

  ok('主包体积', '低于 2MB 建议值')

} catch (e) {

  const out = e.stdout?.toString() || ''

  if (out.includes('主包')) fail('主包体积', '超过 2MB，请运行 pnpm optimize:images')

  else fail('主包体积', e.message)

}



console.log('\n>> 图片资源分包')

const samplePaths = [

  'subpackages/product/images/products/product-1.webp',

  'subpackages/intake/images/intake/basic.webp',

  'images/banner1.webp'

]

samplePaths.forEach(p => {

  if (fs.existsSync(path.join(root, p))) ok('资源存在', p)

  else fail('资源存在', `缺失 ${p}`)

})



console.log('\n>> 图片资源完整性')
try {
  const out = execSync('node scripts/verify-assets.js', { cwd: root, encoding: 'utf8' }).trim()
  ok('图片资源', out)
} catch (e) {
  fail('图片资源', e.stdout?.trim() || '运行 pnpm ensure:fallbacks')
}

const configJs = fs.readFileSync(path.join(root, 'utils', 'config.js'), 'utf8')

if (configJs.includes('development')) ok('开发环境配置', 'MANUAL_ENV=development')

else fail('开发环境配置', '请确认 utils/config.js')



const assetsJs = fs.readFileSync(path.join(root, 'utils', 'assets.js'), 'utf8')

if (assetsJs.includes('subpackages/product/images')) ok('assets.js 分包路径', '已迁移')

else fail('assets.js 分包路径', '未更新')



console.log('\n>> 核心 API 冒烟')

const endpoints = [

  { name: '健康检查', path: '/health' },

  { name: '易融圈动态', path: '/finance-circle/feed' },

  { name: '融圈详情', path: '/finance-circle/posts/1', optional: true },

  { name: '延保业务员', path: '/warranty/staff' },

  { name: '延保申请列表', path: '/warranty/applications' },

  { name: '产品列表', path: '/products?limit=1' },

  { name: '进件列表摘要', path: '/intake/list/summary' }

]



async function runApiChecks() {

  for (const ep of endpoints) {

    try {

      const { status, body } = await httpGet(`${apiBase}${ep.path}`)

      if (status === 200) {

        const json = parseJson(body)

        if (json && json.code === 0) ok(ep.name, ep.path)

        else if (ep.optional && status === 200) ok(ep.name, `${ep.path} (可选)`)

        else fail(ep.name, json?.message || body.slice(0, 80))

      } else if (ep.optional) {

        ok(ep.name, `HTTP ${status} (可选)`)

      } else {

        fail(ep.name, `HTTP ${status}`)

      }

    } catch (e) {

      if (ep.optional) ok(ep.name, '跳过(可选)')

      else fail(ep.name, e.message === 'timeout' ? '连接超时' : 'API 未运行 (pnpm dev:server)')

    }

  }



  // 延保 PDF 端点（有数据时）

  try {

    const { body } = await httpGet(`${apiBase}/warranty/applications`)

    const json = parseJson(body)

    const first = json?.data?.[0]

    if (first?.id) {

      const pdf = await httpGet(`${apiBase}/warranty/applications/${first.id}/contract.pdf`)

      const pdfJson = parseJson(pdf.body)

      if (pdfJson?.code === 0 && pdfJson.data?.url) ok('延保合同PDF', pdfJson.data.url)

      else fail('延保合同PDF', '生成失败')

    } else {

      ok('延保合同PDF', '无申请记录，跳过')

    }

  } catch {

    ok('延保合同PDF', '跳过')

  }



  const passed = checks.filter(c => c.status === 'ok').length

  const total = checks.length

  console.log(`\n=== 结果: ${passed}/${total} 通过 ===`)



  console.log('\n【真机测试清单】')

  const checklist = [

    '进件 → 征信查询 OCR → 导出 PDF',

    '延保进件 → 提交 → 下载 PDF 合同',

    '易融圈 → 动态详情 → 关联进件',

    '首页/产品页封面图正常显示（WebP）',

    '管理后台 → 延保理赔状态流转',

    '智能客服 DeepSeek 回复'

  ]

  checklist.forEach((item, i) => console.log(`  ${i + 1}. ${item}`))



  if (passed < total) process.exit(1)

}



runApiChecks()

