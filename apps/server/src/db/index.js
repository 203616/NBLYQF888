const fs = require('fs')
const path = require('path')
const { DatabaseSync } = require('node:sqlite')
const { dbPath } = require('../config')

fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const db = new DatabaseSync(dbPath)
db.exec('PRAGMA foreign_keys = ON')

module.exports = db
