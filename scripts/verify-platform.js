#!/usr/bin/env node
/**
 * 多端兼容静态检查（iOS / Android / 鸿蒙 / 微信开发者工具）
 */
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
let failed = false

function ok(msg) { console.log(`  [OK] ${msg}`) }
function fail(msg) { failed = true; console.error(`  [FAIL] ${msg}`) }

console.log('=== 多端兼容检查 ===\n')

const deviceJs = path.join(root, 'utils', 'device.js')
if (!fs.existsSync(deviceJs)) fail('缺少 utils/device.js')
else {
  const src = fs.readFileSync(deviceJs, 'utf8')
  ;['harmony', 'getDeviceProfile', 'safeAreaInsets', 'attachDeviceToApp'].forEach(k => {
    if (src.includes(k)) ok(`device.js 含 ${k}`)
    else fail(`device.js 缺少 ${k}`)
  })
}

const appJson = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'))
if (appJson.resizable) ok('app.json resizable=true')
else fail('app.json 未启用 resizable')

const proj = JSON.parse(fs.readFileSync(path.join(root, 'project.config.json'), 'utf8'))
if (proj.setting?.autoResizable) ok('project.config autoResizable=true')
else fail('project.config 未启用 autoResizable')

const lib = proj.libVersion || ''
if (lib && parseFloat(lib) >= 3.0) ok(`基础库 ${lib}`)
else fail('基础库版本偏低')

const appWxss = fs.readFileSync(path.join(root, 'app.wxss'), 'utf8')
if (appWxss.includes('safe-area-inset-bottom')) ok('app.wxss 安全区样式')
else fail('app.wxss 缺少 safe-area')

const platformDoc = path.join(root, 'deploy', 'platform-compatibility.md')
if (fs.existsSync(platformDoc)) ok('platform-compatibility.md')
else fail('缺少 platform-compatibility.md')

const roadmap = path.join(root, 'deploy', 'upgrade-roadmap.md')
if (fs.existsSync(roadmap)) ok('upgrade-roadmap.md')
else fail('缺少 upgrade-roadmap.md')

console.log(failed ? '\n=== 多端检查失败 ===' : '\nALL_PLATFORM_OK')
if (failed) process.exit(1)
