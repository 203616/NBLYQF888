function ok(res, data = null, message = 'success') {
  res.json({ code: 0, message, data })
}

function fail(res, message = 'request failed', status = 400, code = status) {
  res.status(status).json({ code, message, data: null })
}

module.exports = {
  ok,
  fail
}
