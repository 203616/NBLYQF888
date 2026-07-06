const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '..')
const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'))
const pages = [
  ...app.pages,
  ...app.subpackages.flatMap(pkg => pkg.pages.map(page => `${pkg.root}/${page}`))
]
const miss = []
for (const page of pages) {
  for (const ext of ['js', 'wxml', 'wxss', 'json']) {
    const file = path.join(root, `${page}.${ext}`)
    if (!fs.existsSync(file)) miss.push(`${page}.${ext}`)
  }
}
if (miss.length) {
  console.error('MISSING:', miss.join('\n'))
  process.exit(1)
}
console.log('ALL_PAGES_OK', pages.length)
