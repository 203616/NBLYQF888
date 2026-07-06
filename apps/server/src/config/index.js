const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') })

const rootDir = path.resolve(__dirname, '..', '..', '..', '..')

module.exports = {
  port: Number(process.env.PORT || 3000),
  jwtSecret: process.env.JWT_SECRET || 'liangye-local-secret',
  dbPath: process.env.DB_PATH
    ? path.resolve(rootDir, process.env.DB_PATH)
    : path.join(rootDir, 'apps', 'server', 'data', 'liangye.db'),
  uploadsDir: process.env.UPLOADS_DIR
    ? path.resolve(rootDir, process.env.UPLOADS_DIR)
    : path.join(rootDir, 'apps', 'server', 'uploads'),
  nodeEnv: process.env.NODE_ENV || 'development',
  adminDist: path.join(rootDir, 'apps', 'admin', 'dist'),
  ocrProvider: process.env.OCR_PROVIDER || 'aliyun',
  publicBaseUrl: process.env.PUBLIC_BASE_URL || ''
}
