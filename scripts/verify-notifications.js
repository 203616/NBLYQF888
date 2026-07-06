#!/usr/bin/env node
const http = require('http')
const BASE = process.env.API_BASE || 'http://localhost:3000/api/v1'

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE}${path}`)
    const payload = body ? JSON.stringify(body) : null
    const r = http.request({
      hostname: url.hostname,
      port: url.port || 80,
      method,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, res => {
      let raw = ''
      res.on('data', c => { raw += c })
      res.on('end', () => resolve({ status: res.statusCode, json: JSON.parse(raw || '{}') }))
    })
    r.on('error', reject)
    if (payload) r.write(payload)
    r.end()
  })
}

async function main() {
  const health = await req('GET', '/health')
  console.log(health.status === 200 ? '✓ health' : '✗ health')

  const created = await req('POST', '/notifications', {
    title: '测试通知',
    content: '自动化测试消息 13800009999',
    type: 'system'
  })
  const id = created.json?.data?.id
  console.log(id ? `✓ create #${id}` : '✗ create')

  const count1 = await req('GET', '/notifications/unread-count?phone=13800009999')
  const unreadBefore = Number(count1.json?.data?.count || 0)
  console.log(unreadBefore > 0 ? `✓ unread-count ${unreadBefore}` : '✗ unread-count')

  if (id) await req('POST', `/notifications/${id}/read`)
  await req('POST', '/notifications/read-all')

  const count2 = await req('GET', '/notifications/unread-count')
  console.log(Number(count2.json?.data?.count) === 0 ? '✓ read-all' : '✗ read-all')

  const list = await req('GET', '/notifications/mine?phone=13800009999')
  const rows = Array.isArray(list.json?.data) ? list.json.data : []
  console.log(rows.length ? `✓ mine list (${rows.length})` : '✗ mine list')

  if (!id || !rows.length) process.exit(1)
  console.log('\nNOTIFICATIONS_API_OK')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
