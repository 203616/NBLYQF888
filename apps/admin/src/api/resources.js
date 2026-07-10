import request from './request'

export function login(data) {
  return request.post('/auth/admin/login', data)
}

export function getDashboard() {
  return request.get('/admin/dashboard')
}

export function getSystemStatus() {
  return request.get('/admin/system-status')
}

export function getIntegrations() {
  return request.get('/admin/integrations')
}

export function getReleaseChecklist() {
  return request.get('/admin/deploy/release-checklist')
}

export function getFinanceModerationRules() {
  return request.get('/admin/finance-circle/moderation-rules')
}

export function saveFinanceModerationRules(rules) {
  return request.put('/admin/finance-circle/moderation-rules', rules)
}

export function getDeployStatus() {
  return request.get('/admin/deploy')
}

export function getDeployHistory() {
  return request.get('/admin/deploy/history')
}

export async function fetchDeployQrcodeBlob() {
  const token = localStorage.getItem('adminToken')
  const res = await fetch('/api/v1/admin/deploy/qrcode', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
  if (!res.ok) return null
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

export function runDeployAction(action, payload = {}) {
  return request.post('/admin/deploy/actions', { action, ...payload })
}

export async function runDeployActionStream(action, payload = {}, onEvent) {
  const token = localStorage.getItem('adminToken')
  const res = await fetch('/api/v1/admin/deploy/actions?stream=1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ action, setTrial: true, ...payload })
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body?.message || `请求失败 (${res.status})`)
    err.data = body?.data
    throw err
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('当前浏览器不支持流式响应')

  const decoder = new TextDecoder()
  let buffer = ''
  let lastDone = null

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n\n')
    buffer = parts.pop() || ''
    for (const part of parts) {
      const line = part.split('\n').find(l => l.startsWith('data: '))
      if (!line) continue
      const evt = JSON.parse(line.slice(6))
      onEvent?.(evt)
      if (evt.type === 'done') lastDone = evt
    }
  }

  if (lastDone && !lastDone.ok) {
    const err = new Error(lastDone.message || '操作失败')
    err.data = lastDone
    throw err
  }
  return lastDone
}

export function listResource(resource) {
  return request.get(`/admin/${resource}`)
}

export function updateResource(resource, id, data) {
  return request.patch(`/admin/${resource}/${id}`, data)
}

export function createResource(resource, data) {
  return request.post(`/admin/${resource}`, data)
}

export function getMeta(type) {
  return request.get(`/admin/meta/${type}`)
}

// =============================================
// 分润规则 API
// =============================================
export function getCommissionRules() {
  return request.get('/admin/commission-rules')
}

export function saveCommissionRule(data) {
  return request.post('/admin/commission-rules', data)
}

export function deleteCommissionRule(id) {
  return request.delete(`/admin/commission-rules/${id}`)
}

export function getCommissionReports(params) {
  return request.get('/admin/commission-reports', { params })
}

// =============================================
// OA工作台 API
// =============================================
export function getOAWorkbench() {
  return request.get('/admin/oa-workbench')
}
