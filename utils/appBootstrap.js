const { preloadSubpackages } = require('./subpackagePreload')

/** 完成欢迎/登录/授权后同步后台数据，避免启动时 API 未就绪报错 */
function syncAfterOnboarding() {
  const app = getApp()
  if (!app || app.globalData._bootstrapDone) return Promise.resolve()
  app.globalData._bootstrapDone = true

  const tasks = []

  try {
    preloadSubpackages(['product', 'intake', 'autoFinance'])
  } catch (e) {}

  try {
    const { refreshSubscribeTemplates } = require('./subscribe')
    tasks.push(refreshSubscribeTemplates().catch(() => null))
  } catch (e) {}

  try {
    const { getUnreadCount } = require('../api/notification')
    tasks.push(
      getUnreadCount()
        .then(count => { app.globalData.unreadCount = count })
        .catch(() => null)
    )
  } catch (e) {}

  return Promise.all(tasks)
}

function resetBootstrap() {
  const app = getApp()
  if (app) app.globalData._bootstrapDone = false
}

module.exports = { syncAfterOnboarding, resetBootstrap }