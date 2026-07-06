const express = require('express')
const path = require('path')
const fs = require('fs')
const cors = require('cors')
const routes = require('./routes')
const { notFound, errorHandler } = require('./middleware/errorHandler')
const { adminDist, uploadsDir, nodeEnv } = require('./config')

const app = express()
const rootDir = path.resolve(__dirname, '..', '..', '..', '..')
const cdnStagingDir = path.join(rootDir, 'deploy', 'cdn-staging')

const adminBase = (process.env.ADMIN_BASE_PATH || '/ly-admin').replace(/\/$/, '')

app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

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

const indexHtml = path.join(adminDist, 'index.html')
if (fs.existsSync(indexHtml)) {
  app.get(adminBase, (req, res) => res.redirect(301, `${adminBase}/`))
  app.use(`${adminBase}/`, express.static(adminDist, { index: 'index.html' }))
  app.get(`${adminBase}/*`, (req, res, next) => {
    if (req.path.includes('.')) return next()
    res.sendFile(indexHtml)
  })
  if (nodeEnv === 'production') {
    console.log(`Admin panel available at ${adminBase}/`)
  }
}

app.use(notFound)
app.use(errorHandler)

module.exports = app
