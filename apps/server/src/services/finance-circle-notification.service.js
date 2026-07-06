const { createNotification } = require('./notification.service')

const ADMIN_LINK = '/social/finance-posts'
const USER_LINK = '/pages/financeCircle/financeCircle'

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '')
}

function notifyFinancePostPending({ postId, userName, contentPreview = '' }) {
  const snippet = String(contentPreview || '').slice(0, 60)
  return createNotification({
    userId: null,
    title: '融圈动态待审核',
    content: `用户「${userName || '亮叶用户'}」提交动态 #${postId}：${snippet || '（无文字）'}`,
    type: 'moderation',
    link: ADMIN_LINK
  })
}

async function notifyFinancePostReviewResult({
  postId,
  userName,
  authorPhone,
  reviewStatus,
  reviewNote = '',
  contentPreview = ''
}) {
  const phone = normalizePhone(authorPhone)
  const approved = reviewStatus === 'approved'
  const title = approved ? '融圈动态已通过' : '融圈动态未通过审核'
  const reason = reviewNote ? `。原因：${reviewNote}` : ''
  const content = approved
    ? `您发布的动态已通过审核并展示${reason}`
    : `您发布的动态未通过审核${reason}`

  const row = createNotification({
    userId: null,
    title,
    content: `${content}（#${postId} · ${userName || '亮叶用户'}）`,
    type: 'finance_circle',
    link: USER_LINK,
    recipientPhone: phone || null
  })

  try {
    const { notifyFinanceReviewSubscribe } = require('./wechat.service')
    const wxRes = await notifyFinanceReviewSubscribe({
      authorPhone: phone,
      postId,
      reviewStatus,
      reviewNote,
      contentPreview: contentPreview || content
    })
    return { notification: row, wechat: wxRes }
  } catch (err) {
    console.warn('finance subscribe message failed', err.message)
    return { notification: row, wechat: { skipped: true, reason: err.message } }
  }
}

module.exports = {
  notifyFinancePostPending,
  notifyFinancePostReviewResult,
  ADMIN_LINK,
  USER_LINK
}
