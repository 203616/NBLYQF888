const crypto = require('crypto')

function percentEncode(str) {
  return encodeURIComponent(str).replace(/\+/g, '%20').replace(/\*/g, '%2A').replace(/%7E/g, '~')
}

function signAliyunRpc(params, secret) {
  const sorted = Object.keys(params)
    .sort()
    .map(k => `${percentEncode(k)}=${percentEncode(params[k])}`)
    .join('&')
  const stringToSign = `POST&${percentEncode('/')}&${percentEncode(sorted)}`
  const hmac = crypto.createHmac('sha1', `${secret}&`)
  hmac.update(stringToSign)
  return hmac.digest('base64')
}

module.exports = { percentEncode, signAliyunRpc }
