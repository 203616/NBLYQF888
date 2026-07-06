const fs = require('fs')
const path = require('path')
const db = require('./index')

const schemaPath = path.join(__dirname, 'schema.sql')
const schema = fs.readFileSync(schemaPath, 'utf8')

if (process.argv.includes('--force')) {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all()
  db.exec('PRAGMA foreign_keys = OFF')
  tables.forEach(table => db.prepare(`DROP TABLE IF EXISTS ${table.name}`).run())
  db.exec('PRAGMA foreign_keys = ON')
}

db.exec(schema)

const columnPatches = [
  ['demands', 'city', 'TEXT'],
  ['demands', 'purpose', 'TEXT'],
  ['demands', 'remark', 'TEXT'],
  ['demands', 'tags', 'TEXT'],
  ['demands', 'linked_application_no', 'TEXT'],
  ['finance_circle_posts', 'intake_product', 'TEXT'],
  ['finance_circle_posts', 'intake_product_name', 'TEXT'],
  ['finance_circle_posts', 'review_status', "TEXT DEFAULT 'approved'"],
  ['finance_circle_posts', 'review_note', 'TEXT'],
  ['finance_circle_posts', 'reviewed_at', 'TEXT'],
  ['finance_circle_posts', 'author_phone', 'TEXT'],
  ['notifications', 'recipient_phone', 'TEXT']
]
columnPatches.forEach(([table, column, ddl]) => {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all()
  if (!cols.find(c => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`)
    console.log(`Added column ${table}.${column}`)
  }
})

console.log('Database migration completed')
