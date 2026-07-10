const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')
const { jwtSecret } = require('../config')
const { ok, fail } = require('../utils/response')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()
const smsStore = new Map()

router.post('/sms-code', (req, res) => {
  const { phone } = req.body
  if (!phone) return fail(res, '手机号不能为空')
  const code = String(Math.floor(100000 + Math.random() * 900000))
  smsStore.set(phone, { code, expireAt: Date.now() + 5 * 60 * 1000 })
  const payload = process.env.NODE_ENV === 'production'
    ? { expireIn: 300 }
    : { code, expireIn: 300 }
  ok(res, payload, '短信验证码已发送')
})

function verifySmsCode(phone, smsCode) {
  const record = smsStore.get(phone)
  if (!record) return false
  if (Date.now() > record.expireAt) {
    smsStore.delete(phone)
    return false
  }
  const matched = record.code === smsCode
  if (matched) smsStore.delete(phone)
  return matched
}

function issueUserToken(user) {
  const token = jwt.sign({ id: user.id, phone: user.phone, role: 'user' }, jwtSecret, { expiresIn: '7d' })
  return {
    token,
    user: {
      id: user.id,
      phone: user.phone,
      nickName: user.nickname,
      avatarUrl: user.avatar_url || '/images/avatar.png',
      is_verified: user.is_verified
    }
  }
}

router.post('/register', (req, res) => {
  const { phone, smsCode, password } = req.body
  if (!phone || !smsCode || !password) return fail(res, '请填写完整注册信息')
  if (!verifySmsCode(phone, smsCode)) {
    return fail(res, '验证码错误或已过期', 400)
  }
  const exists = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone)
  if (exists) return fail(res, '该手机号已注册', 400)
  const hash = bcrypt.hashSync(password, 10)
  const info = db.prepare('INSERT INTO users (phone, password_hash, nickname, is_verified) VALUES (?, ?, ?, ?)').run(phone, hash, `亮叶用户${phone.slice(-4)}`, 0)
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid)
  ok(res, issueUserToken(user), '注册成功')
})

router.post('/login', (req, res) => {
  const { phone, password, code } = req.body
  if (!phone) return fail(res, '手机号不能为空')

  let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone)
  if (!user) {
    const hash = bcrypt.hashSync(password || code || '123456', 10)
    const info = db.prepare('INSERT INTO users (phone, password_hash, nickname, is_verified) VALUES (?, ?, ?, ?)').run(phone, hash, `亮叶用户${phone.slice(-4)}`, 1)
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid)
  } else if (password && !bcrypt.compareSync(password, user.password_hash || '')) {
    return fail(res, '手机号或密码错误', 401)
  }

  ok(res, issueUserToken(user))
})

router.post('/wechat-login', async (req, res, next) => {
  try {
    const { code } = req.body
    if (!code) return fail(res, '微信登录凭证无效')

    // 尝试通过微信服务端 API 换取真实 openid
    let openid = null
    let phoneFromWechat = null
    try {
      const wxService = require('../services/wechat.service')
      if (process.env.WECHAT_SECRET) {
        const session = await wxService.jscode2session(code)
        if (session && session.openid) {
          openid = session.openid
        }
      }
    } catch (wxErr) {
      console.warn('[wechat-login] jscode2session failed, using mock:', wxErr.message)
    }

    // 降级：微信未配置或 API 失败时使用模拟 openid
    if (!openid) {
      openid = `wx_${code.slice(0, 32)}`
    }

    let user = db.prepare('SELECT * FROM users WHERE openid = ?').get(openid)
    if (!user) {
      const pseudoPhone = phoneFromWechat || `199${String(Date.now()).slice(-8)}`
      const info = db.prepare('INSERT INTO users (openid, phone, nickname, is_verified) VALUES (?, ?, ?, ?)').run(openid, pseudoPhone, '微信用户', 0)
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid)
    }
    ok(res, issueUserToken(user))
  } catch (e) { next(e) }
})

router.post('/reset-password', (req, res) => {
  const { phone, smsCode, password } = req.body
  if (!phone || !password) return fail(res, '手机号和新密码不能为空')
  if (smsCode && !verifySmsCode(phone, smsCode)) {
    return fail(res, '验证码错误或已过期', 400)
  }
  const hash = bcrypt.hashSync(password, 10)
  db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE phone = ?").run(hash, phone)
  ok(res, true, '密码已重置')
})

router.post('/admin/login', (req, res) => {
  const { username, password } = req.body
  const admin = db.prepare('SELECT * FROM admin_users WHERE username = ? AND status = ?').get(username, 'active')
  if (!admin || !bcrypt.compareSync(password || '', admin.password_hash)) {
    return fail(res, '管理员账号或密码错误', 401)
  }
  db.prepare("UPDATE admin_users SET last_login_at = datetime('now') WHERE id = ?").run(admin.id)
  const perms = require('../services/rbac.service').getUserPermissions(admin.id)
  const token = jwt.sign({ id: admin.id, username: admin.username, role: 'admin', adminRole: admin.role, permissions: perms }, jwtSecret, { expiresIn: '7d' })
  // 获取角色名称
  const roles = db.prepare(`
    SELECT GROUP_CONCAT(DISTINCT r.name) AS names
    FROM admin_role_assignments ara
    JOIN roles r ON r.id = ara.role_id
    WHERE ara.admin_id = ?
  `).get(admin.id)
  ok(res, {
    token,
    admin: {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
      roleNames: roles?.names ? roles.names.split(',') : [],
      permissions: perms
    }
  })
})

router.get('/admin/me', requireAdmin, (req, res) => {
  const admin = db.prepare('SELECT id, username, name, role, last_login_at FROM admin_users WHERE id = ?').get(req.user.id)
  ok(res, admin)
})

module.exports = router
