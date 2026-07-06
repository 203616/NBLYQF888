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
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, res => {
      let raw = ''
      res.on('data', c => { raw += c })
      res.on('end', () => {
        try { resolve({ status: res.statusCode, json: JSON.parse(raw || '{}') }) }
        catch { reject(new Error(raw)) }
      })
    })
    r.on('error', reject)
    if (payload) r.write(payload)
    r.end()
  })
}

async function main() {
  const health = await req('GET', '/health')
  console.log(health.status === 200 ? '✓ health' : '✗ health')

  const list = await req('GET', '/demands')
  console.log(list.status === 200 ? `✓ list demands (${(list.json.data || []).length})` : '✗ list')

  const created = await req('POST', '/demands', {
    type: 'funding',
    title: '测试需求-经营周转',
    amount: '50万',
    period: '1年',
    contact: '13800001234',
    city: '宁波市',
    purpose: '经营周转',
    remark: '自动化测试',
    tags: ['经营贷']
  })
  const id = created.json?.data?.id
  console.log(created.status === 200 && id ? `✓ create demand #${id}` : '✗ create')

  const mine = await req('GET', '/demands/mine?phone=13800001234')
  const mineRows = Array.isArray(mine.json?.data) ? mine.json.data : (mine.json?.data ? [mine.json.data] : [])
  const found = mineRows.some(d => String(d.id) === String(id))
  console.log(found ? '✓ mine by phone' : '✗ mine by phone')

  if (!found || created.status !== 200) process.exit(1)
  console.log('\nDEMANDS_API_OK')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
