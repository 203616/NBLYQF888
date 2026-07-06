const fs = require('fs')
const https = require('https')
const path = require('path')
const { uploadsDir, publicBaseUrl } = require('../config')
const { signAliyunRpc } = require('../utils/aliyun-sign')

function greenConfigured() {
  return !!(
    process.env.ALIYUN_ACCESS_KEY_ID &&
    process.env.ALIYUN_ACCESS_KEY_SECRET &&
    process.env.ALIYUN_GREEN_ENABLED !== 'false'
  )
}

function greenEndpoint() {
  return process.env.ALIYUN_GREEN_ENDPOINT || 'green.cn-shanghai.aliyuncs.com'
}

function postGreen(params) {
  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET
  const payload = {
    Format: 'JSON',
    Version: '2018-05-09',
    AccessKeyId: accessKeyId,
    SignatureMethod: 'HMAC-SHA1',
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    SignatureVersion: '1.0',
    SignatureNonce: `${Date.now()}${Math.random().toString(36).slice(2)}`,
    RegionId: process.env.ALIYUN_GREEN_REGION || 'cn-shanghai',
    ...params
  }
  payload.Signature = signAliyunRpc(payload, accessKeySecret)
  const body = Object.keys(payload)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(payload[k])}`)
    .join('&')

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: greenEndpoint(),
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let raw = ''
      res.on('data', chunk => { raw += chunk })
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw))
        } catch (err) {
          reject(err)
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function worstSuggestion(results = []) {
  let worst = 'pass'
  for (const item of results) {
    const suggestion = String(item.suggestion || item.Suggestion || 'pass').toLowerCase()
    if (suggestion === 'block') return 'block'
    if (suggestion === 'review') worst = 'review'
  }
  return worst
}

async function scanText(content) {
  const text = String(content || '').trim()
  if (!text) return { pass: true, provider: 'skip', suggestion: 'pass' }
  if (!greenConfigured()) {
    return { pass: true, provider: 'mock', suggestion: 'pass', message: '未配置阿里云内容安全，跳过文本检测' }
  }

  const json = await postGreen({
    Action: 'ScanText',
    tasks: JSON.stringify([{ content: text.slice(0, 10000) }])
  })

  if (json.Code && Number(json.Code) !== 200) {
    throw new Error(json.Msg || json.Message || '阿里云文本检测失败')
  }

  const data = json.data || []
  const results = (data[0] && data[0].results) || []
  const suggestion = worstSuggestion(results)
  const labels = results.map(r => r.label || r.scene).filter(Boolean)

  return {
    pass: suggestion === 'pass',
    provider: 'aliyun',
    suggestion,
    labels,
    raw: json
  }
}

function resolveLocalImagePath(url) {
  if (!url || typeof url !== 'string') return null
  let rel = url
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (publicBaseUrl && url.startsWith(publicBaseUrl)) {
      rel = url.slice(publicBaseUrl.length)
    } else {
      return null
    }
  }
  if (!rel.startsWith('/uploads/')) return null
  const local = path.join(uploadsDir, rel.replace(/^\/uploads\//, ''))
  return fs.existsSync(local) ? local : null
}

async function scanImage(imageUrl) {
  if (!imageUrl) return { pass: true, provider: 'skip', suggestion: 'pass' }
  if (!greenConfigured()) {
    return { pass: true, provider: 'mock', suggestion: 'pass', message: '未配置阿里云内容安全，跳过图片检测' }
  }

  const localPath = resolveLocalImagePath(imageUrl)
  let tasks
  if (localPath) {
    const data = fs.readFileSync(localPath).toString('base64')
    tasks = [{ data, dataId: path.basename(localPath) }]
  } else if (imageUrl.startsWith('http')) {
    tasks = [{ url: imageUrl }]
  } else {
    return { pass: true, provider: 'skip', suggestion: 'pass', message: '无法解析图片地址' }
  }

  const json = await postGreen({
    Action: 'ImageSyncScan',
    scenes: JSON.stringify(['porn', 'terrorism', 'ad', 'qrcode']),
    tasks: JSON.stringify(tasks)
  })

  if (json.Code && Number(json.Code) !== 200) {
    throw new Error(json.Msg || json.Message || '阿里云图片检测失败')
  }

  const data = json.data || []
  const results = (data[0] && data[0].results) || []
  const suggestion = worstSuggestion(results)
  const labels = results.map(r => r.label || r.scene).filter(Boolean)

  return {
    pass: suggestion === 'pass',
    provider: 'aliyun',
    suggestion,
    labels,
    raw: json
  }
}

async function scanFinanceContent({ content, images = [] }) {
  const textResult = await scanText(content)
  if (!textResult.pass) {
    return {
      pass: false,
      source: 'text',
      suggestion: textResult.suggestion,
      labels: textResult.labels,
      provider: textResult.provider
    }
  }

  for (const imageUrl of images) {
    const imageResult = await scanImage(imageUrl)
    if (!imageResult.pass) {
      return {
        pass: false,
        source: 'image',
        suggestion: imageResult.suggestion,
        labels: imageResult.labels,
        provider: imageResult.provider,
        imageUrl
      }
    }
  }

  return { pass: true, provider: textResult.provider, suggestion: 'pass' }
}

function getContentSecurityStatus() {
  const configured = greenConfigured()
  return {
    configured,
    mode: configured ? 'aliyun' : 'mock',
    endpoint: greenEndpoint(),
    region: process.env.ALIYUN_GREEN_REGION || 'cn-shanghai',
    hint: configured ? '阿里云内容安全已启用（文本 ScanText / 图片 ImageSyncScan）' : '配置 ALIYUN_ACCESS_KEY_* 并在 moderation 规则中启用 useAliyunContentSecurity'
  }
}

module.exports = {
  greenConfigured,
  scanText,
  scanImage,
  scanFinanceContent,
  getContentSecurityStatus
}
