const db = require('../db')

// 记录管理员操作日志
function logAudit(adminId, adminName, action, resourceType, resourceId, detail, ip) {
  try {
    db.prepare(`
      INSERT INTO audit_logs (admin_id, admin_name, action, resource_type, resource_id, detail, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(adminId || 0, adminName || 'system', action || 'unknown', resourceType || '', resourceId || '', detail || '', ip || '')
  } catch (e) {
    console.error('审计日志写入失败:', e.message)
  }
}

module.exports = { logAudit }
