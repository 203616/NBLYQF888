const db = require('../db')

// =========================================
// 权限定义：应用所有权限码
// =========================================
const ALL_PERMISSIONS = [
  // 数据中心
  { code: 'dashboard:view', name: '查看数据概览', group: '数据中心' },
  { code: 'regions:view', name: '查看地区看板', group: '数据中心' },

  // 内容与运营
  { code: 'products:list', name: '查看产品列表', group: '产品管理' },
  { code: 'products:edit', name: '编辑产品', group: '产品管理' },
  { code: 'articles:list', name: '查看内容列表', group: '内容中心' },
  { code: 'articles:edit', name: '编辑内容', group: '内容中心' },
  { code: 'banners:list', name: '查看轮播图', group: '轮播图管理' },
  { code: 'banners:edit', name: '编辑轮播图', group: '轮播图管理' },
  { code: 'exposures:list', name: '查看曝光案例', group: '曝光案例' },
  { code: 'exposures:edit', name: '编辑曝光案例', group: '曝光案例' },
  { code: 'reports:list', name: '查看举报', group: '举报审核' },
  { code: 'reports:edit', name: '处理举报', group: '举报审核' },
  { code: 'sources:list', name: '查看数据来源', group: '数据来源' },
  { code: 'sources:edit', name: '编辑数据来源', group: '数据来源' },
  { code: 'serviceSessions:list', name: '查看客服会话', group: '客服会话' },
  { code: 'notifications:list', name: '查看消息', group: '消息管理' },
  { code: 'notifications:edit', name: '发送消息', group: '消息管理' },

  // 业务管理
  { code: 'demands:list', name: '查看需求', group: '需求管理' },
  { code: 'demands:edit', name: '编辑需求', group: '需求管理' },
  { code: 'clues:list', name: '查看线索', group: '汽车线索' },
  { code: 'clues:edit', name: '编辑线索', group: '汽车线索' },
  { code: 'intake:list', name: '查看进件', group: '进件管理' },
  { code: 'intake:edit', name: '编辑进件', group: '进件管理' },
  { code: 'intake:export', name: '导出进件PDF', group: '进件管理' },
  { code: 'warrantyApplications:list', name: '查看延保申请', group: '延保申请' },
  { code: 'warrantyApplications:edit', name: '编辑延保申请', group: '延保申请' },
  { code: 'warrantyClaims:list', name: '查看延保理赔', group: '延保理赔' },
  { code: 'warrantyClaims:edit', name: '处理延保理赔', group: '延保理赔' },
  { code: 'vehicleValuations:list', name: '查看估值记录', group: '估值记录' },
  { code: 'salesStaff:list', name: '查看业务员', group: '业务员管理' },
  { code: 'salesStaff:edit', name: '编辑业务员', group: '业务员管理' },
  { code: 'applications:list', name: '查看融资申请', group: '融资申请' },
  { code: 'applications:edit', name: '编辑融资申请', group: '融资申请' },
  { code: 'users:list', name: '查看用户', group: '用户管理' },
  { code: 'users:edit', name: '编辑用户', group: '用户管理' },
  { code: 'financeCirclePosts:list', name: '查看融圈动态', group: '融圈审核' },
  { code: 'financeCirclePosts:edit', name: '审核融圈动态', group: '融圈审核' },
  { code: 'financeModeration:edit', name: '配置审核规则', group: '融圈审核' },

  // 系统管理
  { code: 'settings:list', name: '查看系统设置', group: '系统设置' },
  { code: 'settings:edit', name: '编辑系统设置', group: '系统设置' },
  { code: 'auditLogs:list', name: '查看审计日志', group: '审计日志' },
  { code: 'systemStatus:view', name: '查看系统状态', group: '系统状态' },
  { code: 'integrations:view', name: '查看集成配置', group: '集成联调' },
  { code: 'deploy:manage', name: '发布管理', group: '发布部署' },
  { code: 'export:data', name: '导出数据', group: '系统管理' },
  { code: 'adminUsers:list', name: '查看管理员', group: '管理员管理' },
  { code: 'adminUsers:edit', name: '编辑管理员', group: '管理员管理' },
  { code: 'roles:manage', name: '角色权限管理', group: '角色管理' },
]

// =========================================
// 默认角色定义
// =========================================
const DEFAULT_ROLES = [
  {
    name: '超级管理员',
    description: '拥有所有权限',
    isSystem: 1,
    permissions: ALL_PERMISSIONS.map(p => p.code)
  },
  {
    name: '运营编辑',
    description: '内容与运营管理，无系统设置权限',
    isSystem: 1,
    permissions: [
      'dashboard:view', 'regions:view',
      'products:list', 'products:edit',
      'articles:list', 'articles:edit',
      'banners:list', 'banners:edit',
      'exposures:list', 'exposures:edit',
      'reports:list', 'reports:edit',
      'sources:list', 'sources:edit',
      'serviceSessions:list',
      'notifications:list', 'notifications:edit',
      'export:data'
    ]
  },
  {
    name: '业务专员',
    description: '业务数据查看与编辑',
    isSystem: 1,
    permissions: [
      'dashboard:view',
      'demands:list', 'demands:edit',
      'clues:list', 'clues:edit',
      'intake:list', 'intake:edit',
      'warrantyApplications:list', 'warrantyApplications:edit',
      'warrantyClaims:list', 'warrantyClaims:edit',
      'vehicleValuations:list',
      'salesStaff:list',
      'applications:list', 'applications:edit',
      'users:list',
      'financeCirclePosts:list', 'financeCirclePosts:edit',
      'export:data'
    ]
  },
  {
    name: '只读查看',
    description: '仅查看权限，不能编辑',
    isSystem: 1,
    permissions: [
      'dashboard:view', 'regions:view',
      'products:list',
      'articles:list',
      'banners:list',
      'exposures:list',
      'reports:list',
      'sources:list',
      'serviceSessions:list',
      'notifications:list',
      'demands:list',
      'clues:list',
      'intake:list',
      'warrantyApplications:list',
      'warrantyClaims:list',
      'vehicleValuations:list',
      'salesStaff:list',
      'applications:list',
      'users:list',
      'financeCirclePosts:list',
      'settings:list',
      'auditLogs:list',
      'systemStatus:view',
      'integrations:view',
      'adminUsers:list'
    ]
  }
]

// 初始化权限和角色（幂等）
function initRbac() {
  // 插入权限
  const insertPerm = db.prepare('INSERT OR IGNORE INTO permissions (code, name, group_name, description) VALUES (?, ?, ?, ?)')
  for (const p of ALL_PERMISSIONS) {
    insertPerm.run(p.code, p.name, p.group, '')
  }

  // 插入角色
  const insertRole = db.prepare('INSERT OR IGNORE INTO roles (name, description, is_system) VALUES (?, ?, ?)')
  const insertRolePerm = db.prepare('INSERT OR IGNORE INTO role_permissions (role_id, permission_code) VALUES (?, ?)')

  for (const role of DEFAULT_ROLES) {
    const existing = db.prepare('SELECT id FROM roles WHERE name = ?').get(role.name)
    if (!existing) {
      const result = insertRole.run(role.name, role.description, role.isSystem)
      const roleId = result.lastInsertRowid
      for (const permCode of role.permissions) {
        insertRolePerm.run(roleId, permCode)
      }
    }
  }

  // 给默认管理员分配超级管理员角色
  const admin = db.prepare("SELECT id FROM admin_users WHERE username = 'admin'").get()
  if (admin) {
    const superRole = db.prepare("SELECT id FROM roles WHERE name = '超级管理员'").get()
    if (superRole) {
      const existingAssign = db.prepare('SELECT id FROM admin_role_assignments WHERE admin_id = ? AND role_id = ?').get(admin.id, superRole.id)
      if (!existingAssign) {
        db.prepare('INSERT INTO admin_role_assignments (admin_id, role_id) VALUES (?, ?)').run(admin.id, superRole.id)
      }
    }
  }
}

// 获取用户的所有权限码
function getUserPermissions(adminId) {
  const rows = db.prepare(`
    SELECT DISTINCT rp.permission_code
    FROM admin_role_assignments ara
    JOIN role_permissions rp ON rp.role_id = ara.role_id
    WHERE ara.admin_id = ?
  `).all(adminId)
  return rows.map(r => r.permission_code)
}

// 检查是否有指定权限
function hasPermission(adminId, permissionCode) {
  const perms = getUserPermissions(adminId)
  // 超级管理员有所有权限
  return perms.includes('*') || perms.includes(permissionCode)
}

// 权限中间件
function requirePermission(permissionCode) {
  return (req, res, next) => {
    const adminId = req.user?.id
    if (!adminId) return res.status(401).json({ code: 401, message: '未认证' })
    const perms = getUserPermissions(adminId)
    if (perms.includes('*') || perms.includes(permissionCode)) {
      return next()
    }
    res.status(403).json({ code: 403, message: '无操作权限', data: { required: permissionCode } })
  }
}

module.exports = {
  ALL_PERMISSIONS,
  DEFAULT_ROLES,
  initRbac,
  getUserPermissions,
  hasPermission,
  requirePermission
}
