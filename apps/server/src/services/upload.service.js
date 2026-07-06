const fs = require('fs')
const path = require('path')
const { uploadsDir, publicBaseUrl } = require('../config')

function ossConfigured() {
  return !!(
    process.env.OSS_REGION &&
    process.env.OSS_BUCKET &&
    process.env.OSS_ACCESS_KEY_ID &&
    process.env.OSS_ACCESS_KEY_SECRET
  )
}

function decodeBase64Image(contentBase64) {
  const raw = String(contentBase64 || '').replace(/^data:image\/\w+;base64,/, '')
  return Buffer.from(raw, 'base64')
}

function detectExt(buffer, fileName = '') {
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return '.jpg'
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return '.png'
  if (buffer.slice(0, 4).toString('ascii') === 'RIFF') return '.webp'
  const ext = path.extname(fileName).toLowerCase()
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) return ext
  return '.jpg'
}

function buildPublicUrl(relativePath) {
  const rel = relativePath.replace(/\\/g, '/').replace(/^\//, '')
  if (publicBaseUrl) return `${publicBaseUrl.replace(/\/$/, '')}/uploads/${rel}`
  return `/uploads/${rel}`
}

async function mirrorToOss(localPath, objectKey) {
  if (!ossConfigured()) return null
  try {
    const OSS = require('ali-oss')
    const client = new OSS({
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: process.env.OSS_BUCKET
    })
    const ext = path.extname(objectKey).toLowerCase()
    const typeMap = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif' }
    await client.put(objectKey, localPath, {
      headers: {
        'Content-Type': typeMap[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000'
      }
    })
    const cdnBase = (process.env.CDN_BASE_URL || process.env.OSS_CDN_BASE || '').replace(/\/$/, '')
    if (cdnBase) return `${cdnBase}/${objectKey.replace(/^\//, '')}`
    return null
  } catch (err) {
    console.warn('OSS mirror skipped:', err.message)
    return null
  }
}

async function saveUploadedImage({ subdir, fileName, contentBase64, maxSize = 5 * 1024 * 1024 }) {
  const buffer = decodeBase64Image(contentBase64)
  if (!buffer.length) throw new Error('图片数据无效')
  if (buffer.length > maxSize) throw new Error(`单文件不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`)

  const dir = path.join(uploadsDir, subdir)
  fs.mkdirSync(dir, { recursive: true })
  const ext = detectExt(buffer, fileName)
  const safeName = `${Date.now()}-${(fileName || 'image').replace(/[^\w.\-]/g, '_')}`.replace(/\.[^.]+$/, '') + ext
  const filePath = path.join(dir, safeName)
  fs.writeFileSync(filePath, buffer)

  const relative = path.relative(uploadsDir, filePath).replace(/\\/g, '/')
  const localUrl = buildPublicUrl(relative)
  const prefix = (process.env.OSS_UPLOAD_PREFIX || 'uploads').replace(/\/$/, '')
  const cdnUrl = await mirrorToOss(filePath, `${prefix}/${relative}`)

  return {
    fileName: safeName,
    filePath: relative,
    url: cdnUrl || localUrl,
    localUrl,
    cdnUrl: cdnUrl || null
  }
}

module.exports = {
  decodeBase64Image,
  saveUploadedImage,
  buildPublicUrl,
  mirrorToOss,
  ossConfigured
}
