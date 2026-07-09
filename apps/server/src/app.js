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
  if (!accept.includes('gzip') || req.path.startsWith('/api/v1/')) return next()
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
app.get('/images/:name', (req, res) => {
  const name = req.params.name.replace(/\.(webp|png|jpg|jpeg)$/i, '')
  const size = req.query.size || 200
  const bg = req.query.bg || '#e8f0e8'
  const fg = req.query.fg || '#0F3D2E'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${bg}"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${fg}" font-size="${Math.round(size/8)}" font-family="sans-serif">${name}</text>
  </svg>`
  const webp = /\.webp$/i.test(req.params.name)
  if (webp) {
    res.set('Content-Type', 'image/webp')
    // 转SVG为PNG再转WebP比较复杂，直接返回SVG并设置Content-Type
    // 微信小程序支持SVG
  }
  res.set('Content-Type', 'image/svg+xml')
  res.send(svg)
})

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

app.use(notFound)
app.use(errorHandler)

module.exports = app
