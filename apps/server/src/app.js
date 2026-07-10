const express = require('express')
const path = require('path')
const fs = require('fs')
const zlib = require('zlib')
const cors = require('cors')
const routes = require('./routes')
const { notFound, errorHandler } = require('./middleware/errorHandler')
const { adminDist, uploadsDir, nodeEnv } = require('./config')

const app = express()
const rootDir = path.resolve(__dirname, '..', '..', '..')
const cdnStagingDir = path.join(rootDir, 'deploy', 'cdn-staging')

const adminBase = (process.env.ADMIN_BASE_PATH || '/ly-admin').replace(/\/$/, '')

// 启用 CORS
app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// Gzip 压缩（无外部依赖，纯 Node.js 实现）
app.use((req, res, next) => {
  const accept = req.headers['accept-encoding'] || ''
  if (!accept.includes('gzip') || req.path.startsWith('/api/v1/') || /\.(webp|png|jpe?g|svg)$/i.test(req.path)) return next()
  const originalSend = res.send
  res.send = function (body) {
    if (typeof body === 'string' || Buffer.isBuffer(body)) {
      const compressed = zlib.gzipSync(body, { level: 6 })
      res.set('Content-Encoding', 'gzip')
      res.set('Content-Length', Buffer.byteLength(compressed))
      return originalSend.call(this, compressed)
    }
    return originalSend.call(this, body)
  }
  next()
})

// 占位图片服务：为缺失的图片生成内联SVG占位图
app.all('/images/:name', (req, res) => {
  try {
    const name = req.params.name.replace(/\.(webp|png|jpg|jpeg)$/i, '')
    const size = parseInt(req.query.size) || 200
    const bg = req.query.bg || '#e8f0e8'
    const fg = req.query.fg || '#0F3D2E'
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="${bg}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${fg}" font-size="${Math.round(size/8)}" font-family="sans-serif">${name}</text>
    </svg>`
    res.set('Content-Type', 'image/svg+xml')
    res.set('Cache-Control', 'public, max-age=86400')
    res.send(svg)
  } catch (err) {
    console.error('[Image Placeholder] error:', err.message)
    res.status(200).set('Content-Type', 'image/svg+xml').send(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#e8f0e8"/><text x="100" y="100" text-anchor="middle" fill="#0F3D2E" font-size="16" font-family="sans-serif">image</text></svg>`
    )
  }
})

// 确保上传目录存在
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

if (fs.existsSync(uploadsDir)) {
  app.use('/uploads', express.static(uploadsDir))
}

// 本地 CDN 联调：pnpm prepare:cdn 后可通过 /mp-assets/... 访问静态镜像
if (fs.existsSync(cdnStagingDir)) {
  app.use('/mp-assets', express.static(cdnStagingDir))
  if (nodeEnv !== 'production') {
    console.log('CDN staging mirror: /mp-assets/ (from deploy/cdn-staging/)')
  }
}

app.use('/api/v1', routes)

// 移动端 H5 静态页面（必须在 API 和 Admin SPA 之前）
const mobileDir = path.join(rootDir, 'apps', 'mobile')
if (fs.existsSync(mobileDir)) {
  // 先 serve 静态文件 /mobile/xxx
  app.use('/mobile', express.static(mobileDir, { index: 'index.html' }))
  // 再 fallback：目录请求返回 index.html
  app.get('/mobile', (req, res) => res.redirect(301, '/mobile/'))
  app.get('/mobile/*', (req, res) => {
    const filePath = path.join(mobileDir, req.params[0] || 'index.html')
    if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) return res.sendFile(filePath)
    res.sendFile(path.join(mobileDir, 'index.html'))
  })
}

const indexHtml = path.join(adminDist, 'index.html')
if (fs.existsSync(indexHtml)) {
  app.use(`${adminBase}/`, express.static(adminDist))
  app.get(`${adminBase}/*`, (req, res) => res.sendFile(indexHtml))
  app.get(adminBase, (req, res) => res.redirect(301, `${adminBase}/`))
  if (nodeEnv === 'production') {
    console.log(`Admin panel available at ${adminBase}/`)
  }
}

// 图片文件兜底：未找到的图片资源返回SVG占位图（避免 404/500）
const IMAGE_EXT_RE = /\.(webp|png|jpe?g)$/i
app.use((req, res, next) => {
  if (!IMAGE_EXT_RE.test(req.path)) return next()
  try {
    const name = path.basename(req.path).replace(IMAGE_EXT_RE, '')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <rect width="200" height="200" fill="#e8f0e8"/>
      <text x="100" y="100" text-anchor="middle" fill="#0F3D2E" font-size="16" font-family="sans-serif">${name}</text>
    </svg>`
    res.set('Content-Type', 'image/svg+xml')
    res.set('Cache-Control', 'public, max-age=86400')
    res.send(svg)
  } catch (err) {
    next()
  }
})

app.use(notFound)
app.use(errorHandler)

module.exports = app
