const fs = require('fs')
const path = require('path')
const { dbPath } = require('../config')

// 确保数据库目录存在
fs.mkdirSync(path.dirname(dbPath), { recursive: true })

let db
try {
  const { DatabaseSync } = require('node:sqlite')
  db = new DatabaseSync(dbPath)
  db.exec('PRAGMA foreign_keys = ON')
  db.exec('PRAGMA journal_mode = WAL')
} catch (err) {
  console.error('[DB] Failed to initialize database:', err.message)
  process.exit(1)
}

module.exports = db
