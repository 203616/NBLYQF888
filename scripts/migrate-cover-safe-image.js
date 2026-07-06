#!/usr/bin/env node
/**
 * 将列表/详情/封面 image 标签批量替换为 safe-image（CDN 失败自动回退）
 * 跳过 tabBar 图标、极小 icon 与已有 safe-image
 */
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const SKIP_DIRS = new Set(['node_modules', 'apps', '.git', 'components/safe-image'])

const REPLACERS = [
  [/\<image class="cover-thumb"/g, '<safe-image className="cover-thumb"'],
  [/\<image class="grid-cover"/g, '<safe-image className="grid-cover"'],
  [/\<image class="product-flat-cover"/g, '<safe-image className="product-flat-cover"'],
  [/\<image class="product-cover"/g, '<safe-image className="product-cover"'],
  [/\<image class="case-cover"/g, '<safe-image className="case-cover"'],
  [/\<image class="hero-cover"/g, '<safe-image className="hero-cover"'],
  [/\<image class="hero-img"/g, '<safe-image className="hero-img"'],
  [/\<image class="finance-hero-img"/g, '<safe-image className="finance-hero-img"'],
  [/\<image src="\/subpackages\/product\/images\/products\/product-1\.webp" class="finance-hero-img"/g, '<safe-image src="/subpackages/product/images/products/product-1.webp" className="finance-hero-img"'],
  [/\<image src="\/subpackages\/product\/images\/products\/product-2\.webp" class="finance-hero-img"/g, '<safe-image src="/subpackages/product/images/products/product-2.webp" className="finance-hero-img"'],
  [/\<image src="\/subpackages\/product\/images\/products\/product-3\.webp" class="finance-hero-img"/g, '<safe-image src="/subpackages/product/images/products/product-3.webp" className="finance-hero-img"'],
  [/\<image wx:if="\{\{demand\.cover\}\}" class="hero-cover"/g, '<safe-image wx:if="{{demand.cover}}" className="hero-cover"'],
  [/\<image src="\{\{bannerDetail\.image \|\| bannerDetail\.img\}\}" class="banner-image"/g, '<safe-image src="{{bannerDetail.image || bannerDetail.img}}" className="banner-image"'],
  [/\<image src="\{\{item\.cover \|\| item\.image\}\}" class="product-image"/g, '<safe-image src="{{item.cover || item.image}}" className="product-image"'],
  [/\<image src="\{\{userInfo\.avatarUrl\}\}" class="avatar" bindtap="editProfile"/g, '<safe-image src="{{userInfo.avatarUrl}}" className="avatar" bind:tap="editProfile"'],
  [/\<image class="avatar" src="\{\{item\.role === 'user' \? userAvatar : botAvatar\}\}"/g, "<safe-image className=\"avatar\" src=\"{{item.role === 'user' ? userAvatar : botAvatar}}\""],
  [/\<image class="avatar" src="\{\{botAvatar\}\}"/g, '<safe-image className="avatar" src="{{botAvatar}}"'],
  [/\<image class="warranty-hero-img"/g, '<safe-image className="warranty-hero-img"'],
  [/\<image class="form-cover"/g, '<safe-image className="form-cover"'],
  [/\<image class="welcome-bg"/g, '<safe-image className="welcome-bg"'],
  [/\<image class="login-bg-img"/g, '<safe-image className="login-bg-img"'],
  [/\<image class="banner-image"/g, '<safe-image className="banner-image"'],
  [/\<image class="product-image"/g, '<safe-image className="product-image"'],
  [/\<image class="feed-avatar"/g, '<safe-image className="feed-avatar"'],
  [/\<image src="\{\{item\.cover\}\}" class="cover"/g, '<safe-image src="{{item.cover}}" className="cover"'],
  [/\<image src="\{\{item\.cover\}\}" mode="aspectFill" class="cover"/g, '<safe-image src="{{item.cover}}" className="cover" mode="aspectFill"'],
  [/\<image src="\{\{car\.cover\}\}" mode="aspectFill" class="hero-img"/g, '<safe-image src="{{car.cover}}" className="hero-img" mode="aspectFill"'],
  [/\<image src="\{\{plan\.cover\}\}" mode="aspectFill" class="warranty-hero-img"/g, '<safe-image src="{{plan.cover}}" className="warranty-hero-img" mode="aspectFill"'],
  [/\<image class="avatar" src="\{\{item\.avatar\}\}"/g, '<safe-image className="avatar" src="{{item.avatar}}"'],
  [/\<image src="\{\{userInfo\.avatar \|\| '\/images\/avatar\.webp'\}\}" class="avatar"/g, "<safe-image src=\"{{userInfo.avatar || '/images/avatar.webp'}}\" className=\"avatar\""],
  [/\<image wx:if="\{\{coverSrc\}\}" class="cover" src="\{\{coverSrc\}\}" mode="aspectFill" binderror="onCoverError" \/>/g, '<safe-image wx:if="{{cover}}" className="cover" src="{{cover}}" mode="aspectFill" />']
]

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const rel = path.relative(root, path.join(dir, name)).replace(/\\/g, '/')
    if ([...SKIP_DIRS].some(s => rel === s || rel.startsWith(s + '/'))) continue
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) walk(full, out)
    else if (name.endsWith('.wxml')) out.push(full)
  }
  return out
}

let changed = 0
for (const file of walk(root)) {
  let text = fs.readFileSync(file, 'utf8')
  if (text.includes('<safe-image') && !text.includes('<image class="cover') && !text.includes('product-cover')) {
    // may still need other patterns
  }
  let next = text
  for (const [re, rep] of REPLACERS) {
    next = next.replace(re, rep)
  }
  if (next !== text) {
    fs.writeFileSync(file, next, 'utf8')
    changed += 1
    console.log('updated:', path.relative(root, file))
  }
}
console.log(`\n共更新 ${changed} 个 wxml`)
