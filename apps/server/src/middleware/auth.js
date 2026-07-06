const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config')
const { fail } = require('../utils/response')

function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.replace(/^Bearer\s+/i, '')
  if (!token) return fail(res, 'Missing token', 401)

  try {
    req.user = jwt.verify(token, jwtSecret)
    next()
  } catch (error) {
    fail(res, 'Invalid token', 401)
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') return fail(res, 'Admin permission required', 403)
    next()
  })
}

module.exports = {
  requireAuth,
  requireAdmin
}
