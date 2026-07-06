const fs = require('fs')
const path = require('path')
const db = require('../db')

const { notifyIntakeStatus } = require('./wechat.service')
const { createNotification } = require('./notification.service')

function linkDemandToIntake(meta = {}, applicationNo) {
  const demandId = meta.demandId
  if (!demandId || !applicationNo) return
  const demand = db.prepare('SELECT * FROM demands WHERE id = ?').get(demandId)
  if (!demand) return
  const progress = Math.max(Number(demand.progress || 0), 45)
  const status = meta.status === 'auditing' ? '进件审核中' : (demand.status || '匹配中')
  db.prepare(`
    UPDATE demands SET linked_application_no = ?, progress = ?, status = ? WHERE id = ?
  `).run(applicationNo, progress, status, demandId)
  createNotification({
    userId: null,
    title: '需求已关联进件',
    content: `您的需求「${demand.title}」已关联进件 ${applicationNo}，请完善材料并提交审核。`,
    type: 'demand',
    link: `/subpackages/intake/pages/index/index?productType=business&applicationNo=${applicationNo}`
  })
}

function parseJson(value, fallback = {}) {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function normalizeRow(row) {
  if (!row) return null
  return {
    ...row,
    payload: parseJson(row.payload, {}),
    workflow: parseJson(row.workflow, {})
  }
}

function getByApplicationNo(applicationNo) {
  return normalizeRow(db.prepare('SELECT * FROM intake_applications WHERE application_no = ?').get(applicationNo))
}

function getById(id) {
  return normalizeRow(db.prepare('SELECT * FROM intake_applications WHERE id = ?').get(id))
}

function listDocuments(applicationId) {
  return db.prepare('SELECT * FROM intake_documents WHERE application_id = ? ORDER BY id DESC').all(applicationId)
    .map(doc => ({ ...doc, ocr_payload: parseJson(doc.ocr_payload, null) }))
}

function listWorkflowEvents(applicationId) {
  return db.prepare('SELECT * FROM intake_workflow_events WHERE application_id = ? ORDER BY id ASC').all(applicationId)
}

function recordWorkflowEvent(applicationId, applicationNo, stage, status, operator, remark) {
  db.prepare(`
    INSERT INTO intake_workflow_events (application_id, application_no, stage, status, operator, remark)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(applicationId, applicationNo, stage, status, operator || '', remark || '')
}

function syncIntake(payload = {}, userId = null) {
  const meta = payload.meta || {}
  const applicationNo = meta.applicationNo
  if (!applicationNo) {
    throw new Error('缺少进件编号 applicationNo')
  }

  const existing = getByApplicationNo(applicationNo)
  const now = new Date().toISOString()
  const row = {
    user_id: userId || existing?.user_id || null,
    product_type: meta.productType || '',
    product_name: meta.productName || '',
    product_id: meta.productId ? String(meta.productId) : null,
    status: meta.status || 'draft',
    progress: Number(meta.progress || 0),
    payload: JSON.stringify(payload),
    workflow: JSON.stringify(payload.workflow || {}),
    submitted_at: meta.submittedAt || existing?.submitted_at || null,
    updated_at: now
  }

  if (existing) {
    db.prepare(`
      UPDATE intake_applications
      SET user_id = COALESCE(?, user_id), product_type = ?, product_name = ?, product_id = ?,
          status = ?, progress = ?, payload = ?, workflow = ?,
          submitted_at = COALESCE(?, submitted_at), updated_at = ?
      WHERE application_no = ?
    `).run(
      row.user_id, row.product_type, row.product_name, row.product_id,
      row.status, row.progress, row.payload, row.workflow,
      row.submitted_at, row.updated_at, applicationNo
    )
    linkDemandToIntake(meta, applicationNo)
    return { application: getByApplicationNo(applicationNo), created: false }
  }

  const info = db.prepare(`
    INSERT INTO intake_applications (
      application_no, user_id, product_type, product_name, product_id,
      status, progress, payload, workflow, submitted_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    applicationNo, row.user_id, row.product_type, row.product_name, row.product_id,
    row.status, row.progress, row.payload, row.workflow, row.submitted_at, row.updated_at
  )

  const application = getById(info.lastInsertRowid)
  recordWorkflowEvent(application.id, applicationNo, 'sync', 'done', '系统', '进件数据首次同步')
  linkDemandToIntake(meta, applicationNo)
  return { application, created: true }
}

function submitIntake(applicationNo, userId = null) {
  const application = getByApplicationNo(applicationNo)
  if (!application) throw new Error('进件不存在')

  const payload = application.payload
  payload.meta = payload.meta || {}
  payload.meta.status = 'auditing'
  payload.meta.submittedAt = new Date().toISOString()
  payload.workflow = payload.workflow || {}
  payload.workflow.audit = {
    status: 'processing',
    operator: '亮叶审核专员',
    time: new Date().toLocaleString('zh-CN'),
    remark: '材料已提交，正在进行合规初审与机构匹配'
  }

  db.prepare(`
    UPDATE intake_applications
    SET status = ?, progress = ?, payload = ?, workflow = ?, submitted_at = ?, updated_at = datetime('now')
    WHERE application_no = ?
  `).run('auditing', payload.meta.progress || application.progress, JSON.stringify(payload), JSON.stringify(payload.workflow), payload.meta.submittedAt, applicationNo)

  recordWorkflowEvent(application.id, applicationNo, 'audit', 'processing', '亮叶审核专员', payload.workflow.audit.remark)
  const updated = getByApplicationNo(applicationNo)
  linkDemandToIntake(payload.meta, applicationNo)
  createNotification({
    userId: application.user_id || userId || null,
    title: '进件已提交审核',
    content: `进件 ${applicationNo}（${application.product_name || '融资申请'}）已进入审核队列，请留意进度通知。`,
    type: 'intake',
    link: `/subpackages/intake/pages/status/status?section=audit`
  })
  notifyIntakeStatus(updated, 'audit').catch(() => null)
  return updated
}

function updateWorkflow(applicationNo, stage, patch = {}, operator = '管理员') {
  const application = getByApplicationNo(applicationNo)
  if (!application) throw new Error('进件不存在')

  const { metaStatus, ...stagePatch } = patch
  const workflow = application.workflow || {}
  workflow[stage] = {
    ...workflow[stage],
    ...stagePatch,
    time: stagePatch.time || new Date().toLocaleString('zh-CN')
  }

  if (stage === 'audit' && patch.status === 'done') {
    workflow.disburse = { ...workflow.disburse, status: workflow.disburse?.status === 'done' ? 'done' : 'processing', operator: workflow.disburse?.operator || '机构客户经理', time: workflow.disburse?.time || new Date().toLocaleString('zh-CN'), remark: workflow.disburse?.remark || '正在准备签约材料与抵押登记（如适用）' }
  }
  if (stage === 'disburse' && patch.status === 'done') {
    workflow.archive = { ...workflow.archive, status: workflow.archive?.status === 'done' ? 'done' : 'processing', operator: workflow.archive?.operator || '档案管理员', time: workflow.archive?.time || new Date().toLocaleString('zh-CN'), remark: workflow.archive?.remark || '合同与材料归档中' }
    workflow.collection = { ...workflow.collection, status: workflow.collection?.status === 'active' || workflow.collection?.status === 'done' ? workflow.collection.status : 'active', operator: workflow.collection?.operator || '还款提醒系统', time: workflow.collection?.time || new Date().toLocaleString('zh-CN'), remark: workflow.collection?.remark || '还款计划已生成，到期前将短信提醒' }
  }
  if (stage === 'archive' && patch.status === 'done' && !patch.metaStatus) {
    patch.metaStatus = 'archived'
  }

  const payload = application.payload
  payload.workflow = workflow
  if (metaStatus) payload.meta.status = metaStatus

  db.prepare(`
    UPDATE intake_applications
    SET workflow = ?, payload = ?, status = COALESCE(?, status), progress = ?, updated_at = datetime('now')
    WHERE application_no = ?
  `).run(JSON.stringify(workflow), JSON.stringify(payload), metaStatus || null, payload.meta.progress || application.progress, applicationNo)

  recordWorkflowEvent(application.id, applicationNo, stage, stagePatch.status || 'processing', operator, stagePatch.remark || '')
  return getByApplicationNo(applicationNo)
}

function saveDocument({ applicationNo, docKey, fileName, filePath, fileUrl, ocrPayload }) {
  let application = getByApplicationNo(applicationNo)
  if (!application) {
    const empty = { meta: { applicationNo, status: 'draft', progress: 0 } }
    syncIntake(empty)
    application = getByApplicationNo(applicationNo)
  }

  const info = db.prepare(`
    INSERT INTO intake_documents (application_id, application_no, doc_key, file_name, file_path, file_url, ocr_payload)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    application.id,
    applicationNo,
    docKey,
    fileName,
    filePath,
    fileUrl || `/uploads/${path.basename(filePath)}`,
    ocrPayload ? JSON.stringify(ocrPayload) : null
  )

  return db.prepare('SELECT * FROM intake_documents WHERE id = ?').get(info.lastInsertRowid)
}

module.exports = {
  syncIntake,
  submitIntake,
  updateWorkflow,
  saveDocument,
  getByApplicationNo,
  getById,
  listDocuments,
  listWorkflowEvents,
  normalizeRow,
  parseJson
}
