#!/usr/bin/env node
/**
 * 集成配置自检：读取 .env，可选探测本地 API
 * 用法：node scripts/verify-integrations.js [--ping]
 */
const fs = require('fs')
const path = require('path')
const http = require('http')

const root = path.join(__dirname, '..')
const envPath = path.join(root, '.env')
const examplePath = path.join(root, '.env.example')

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return {}
  const out = {}
  fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const m = trimmed.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) out[m[1]] = m[2].trim()
  })
  return out
}

function check(name, ok, detail) {
  return { name, ok, detail }
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, res => {
      let raw = ''
      res.on('data', c => { raw += c })
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }) }
        catch (e) { resolve({ status: res.statusCode, body: raw }) }
      })
    })
    req.on('error', reject)
    req.setTimeout(5000, () => req.destroy(new Error('timeout')))
  })
}

async function main() {
  const ping = process.argv.includes('--ping')
  const env = { ...loadEnvFile(examplePath), ...loadEnvFile(envPath) }
  const port = env.PORT || '3000'
  const base = `http://127.0.0.1:${port}/api/v1`

  const results = [
    check('OCR_PROVIDER', !!env.OCR_PROVIDER, env.OCR_PROVIDER || 'missing'),
    check('ALIYUN_ACCESS_KEY_ID', !!env.ALIYUN_ACCESS_KEY_ID, env.ALIYUN_ACCESS_KEY_ID ? 'set' : 'missing → mock OCR'),
    check('ALIYUN_ACCESS_KEY_SECRET', !!env.ALIYUN_ACCESS_KEY_SECRET, env.ALIYUN_ACCESS_KEY_SECRET ? 'set' : 'missing'),
    check('WECHAT_APPID', !!env.WECHAT_APPID, env.WECHAT_APPID || 'missing'),
    check('WECHAT_SECRET', !!env.WECHAT_SECRET, env.WECHAT_SECRET ? 'set' : 'missing → no subscribe send'),
    check('WECHAT_TEMPLATE_INTAKE_AUDIT', !!env.WECHAT_TEMPLATE_INTAKE_AUDIT, env.WECHAT_TEMPLATE_INTAKE_AUDIT || 'missing'),
    check('WECHAT_TEMPLATE_INTAKE_DISBURSE', !!env.WECHAT_TEMPLATE_INTAKE_DISBURSE, env.WECHAT_TEMPLATE_INTAKE_DISBURSE || 'missing'),
    check('PUBLIC_BASE_URL', !!env.PUBLIC_BASE_URL, env.PUBLIC_BASE_URL || 'missing'),
    check('CDN_BASE_URL', !!env.CDN_BASE_URL, env.CDN_BASE_URL || 'optional → 本地分包图片')
  ]

  console.log('=== 亮叶企服 · 集成配置自检 ===\n')
  results.forEach(r => {
    console.log(`${r.ok ? '✓' : '✗'} ${r.name}: ${r.detail}`)
  })

  if (ping) {
    console.log('\n--- API 探测 ---')
    try {
      const health = await httpGet(`${base}/health`)
      console.log(`✓ GET /health → ${health.status}`)
      const cfg = await httpGet(`${base}/config/integrations`)
      const d = cfg.body?.data || cfg.body
      console.log(`✓ GET /config/integrations → ocrMode=${d?.ocrMode}, subscribe=${d?.features?.subscribe}`)
    } catch (err) {
      console.log(`✗ API 不可达 (${base})：${err.message}`)
      console.log('  请先运行：pnpm dev:server')
    }
  } else {
    console.log('\n提示：加 --ping 参数可探测本地 API')
  }

  const failed = results.filter(r => !r.ok).length
  console.log(`\n${failed ? 'WARN' : 'OK'}: ${results.length - failed}/${results.length} 项已配置`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
