#!/usr/bin/env node
/**
 * 进件流转：同步 → 提交 → 后台推进 → 小程序拉取 验证
 */
const http = require('http')

const BASE = process.env.API_BASE || 'http://localhost:3000/api/v1'
const APP_NO = `LYTEST${Date.now()}`

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(path.startsWith('http') ? path : `${BASE}${path}`)
    const payload = body ? JSON.stringify(body) : null
    const r = http.request({
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, res => {
      let raw = ''
      res.on('data', c => { raw += c })
      res.on('end', () => {
        try {
          const json = JSON.parse(raw || '{}')
          resolve({ status: res.statusCode, json })
        } catch {
          reject(new Error(`Invalid JSON: ${raw.slice(0, 200)}`))
        }
      })
    })
    r.on('error', reject)
    if (payload) r.write(payload)
    r.end()
  })
}

async function main() {
  const steps = []
  const ok = (name, pass, detail = '') => {
    steps.push({ name, pass, detail })
    console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`)
  }

  const health = await req('GET', '/health')
  ok('health', health.status === 200)

  const login = await req('POST', '/auth/admin/login', { username: 'admin', password: 'admin123' })
  const token = login.json?.data?.token
  ok('admin login', !!token)

  const payload = {
    meta: {
      applicationNo: APP_NO,
      productType: 'newCar',
      productName: '流转测试',
      status: 'draft',
      progress: 60
    },
    basic: { applyCity: '宁波市', loanPurpose: '购车消费', expectedAmount: '20万' },
    personal: { realName: '测试用户', mobile: '13800000000', idCard: '330102199001011234', address: '测试地址' },
    finance: { loanAmount: '15万', loanTerm: '36', downPayment: '5万' },
    uploads: {
      idCardFront: { status: 'done', count: 1, files: [] },
      idCardBack: { status: 'done', count: 1, files: [] },
      bankFlow: { status: 'done', count: 1, files: [] },
      creditAuth: { status: 'done', count: 1, files: [] }
    },
    workflow: {
      audit: { status: 'pending', remark: '等待提交' },
      disburse: { status: 'locked', remark: '' },
      archive: { status: 'locked', remark: '' },
      collection: { status: 'locked', remark: '' }
    }
  }

  const sync = await req('POST', '/intake/sync', payload)
  ok('sync intake', sync.status === 200, APP_NO)

  const submit = await req('POST', `/intake/${APP_NO}/submit`, payload)
  ok('submit audit', submit.status === 200, submit.json?.data?.status)

  const wf = await req('POST', `/intake/admin/${submit.json?.data?.id}/workflow`, {
    stage: 'audit', status: 'done', metaStatus: 'approved', remark: '初审通过'
  }, token)
  ok('admin workflow audit', wf.status === 200, wf.json?.data?.workflow?.audit?.status)

  const pull = await req('GET', `/intake/${APP_NO}`)
  ok('pull intake', pull.status === 200, pull.json?.data?.workflow?.audit?.status)

  const failed = steps.filter(s => !s.pass)
  if (failed.length) {
    console.error('\nINTAKE_WORKFLOW_FAIL', failed.length)
    process.exit(1)
  }
  console.log('\nINTAKE_WORKFLOW_OK')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
