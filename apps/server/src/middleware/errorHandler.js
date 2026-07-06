const { fail } = require('../utils/response')

function notFound(req, res) {
  fail(res, `Route not found: ${req.method} ${req.originalUrl}`, 404)
}

function errorHandler(error, req, res, next) {
  console.error(error)
  fail(res, error.message || 'Internal server error', error.status || 500)
}

module.exports = {
  notFound,
  errorHandler
}
