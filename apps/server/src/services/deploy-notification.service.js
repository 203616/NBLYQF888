const { createNotification } = require('./notification.service')

const DEPLOY_LINK = '/system/deploy'

function notifyDeployResult({ action, ok, label, summary = '' }) {
  const title = ok ? `部署成功：${label}` : `部署失败：${label}`
  const content = summary || (ok ? `${label}已完成，可在发布部署页查看详情。` : `${label}执行失败，请查看日志。`)
  return createNotification({
    userId: null,
    title,
    content: content.slice(0, 500),
    type: 'deploy',
    link: DEPLOY_LINK
  })
}

module.exports = {
  notifyDeployResult,
  DEPLOY_LINK
}
