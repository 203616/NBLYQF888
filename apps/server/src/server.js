const app = require('./app')
const { port, adminDist, adminBase, nodeEnv } = require('./config')
const fs = require('fs')
const path = require('path')

// 进程级错误处理
process.on('uncaughtException', (err) => {
  console.error('[FATAL] uncaughtException:', err.message)
  console.error(err.stack)
  // 不退出进程，让服务继续运行
})

process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] unhandledRejection:', reason?.message || reason)
})

app.listen(port, '0.0.0.0', () => {
  console.log(`\n━━━ 亮叶企服后台服务已启动 ━━━`)
  console.log(`  API 地址:    http://0.0.0.0:${port}/api/v1`)
  console.log(`  运行模式:    ${nodeEnv}`)

  const indexHtml = path.join(adminDist, 'index.html')
  if (fs.existsSync(indexHtml)) {
    console.log(`  管理后台:    http://localhost:${port}${adminBase}/`)
    console.log(`  登录账号:    admin / admin123`)
  }

  const mobileDir = path.resolve(__dirname, '..', '..', '..', 'apps', 'mobile')
  if (fs.existsSync(mobileDir)) {
    console.log(`  移动端网页:  http://localhost:${port}/mobile/`)
  }

  if (nodeEnv !== 'production') {
    console.log(`  前端 Dev:    http://localhost:${Number(process.env.ADMIN_PORT || 5200)}${adminBase}/`)
  }
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
})
