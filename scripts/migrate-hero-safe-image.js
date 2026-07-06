#!/usr/bin/env node
/** 将 premium-hero-bg 的 image 标签批量替换为 safe-image（全局组件） */
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === 'apps' || name === '.git') continue
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) walk(full, out)
    else if (name.endsWith('.wxml')) out.push(full)
  }
  return out
}

let changed = 0
for (const file of walk(root)) {
  let text = fs.readFileSync(file, 'utf8')
  if (!text.includes('premium-hero-bg')) continue
  const next = text
    .replace(/<image class="premium-hero-bg status-cover"/g, '<safe-image className="premium-hero-bg status-cover"')
    .replace(/<image class="premium-hero-bg"/g, '<safe-image className="premium-hero-bg"')
  if (next !== text) {
    fs.writeFileSync(file, next, 'utf8')
    changed += 1
    console.log('updated:', path.relative(root, file))
  }
}
console.log(`\n共更新 ${changed} 个 wxml`)
