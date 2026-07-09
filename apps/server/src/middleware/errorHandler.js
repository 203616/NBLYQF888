const { fail } = require('../utils/response')

function notFound(req, res) {
  fail(res, `Route not found: ${req.method} ${req.originalUrl}`, 404)
}

function errorHandler(error, req, res, next) {
  console.error('[Error]', error.message || error)
  if (process.env.NODE_ENV === 'production') {
    fail(res, '服务器内部错误', 500)
  } else {
    fail(res, error.message || 'Internal server error', error.status || 500)
  }
}

module.exports = {
  notFound,
  errorHandler
}
