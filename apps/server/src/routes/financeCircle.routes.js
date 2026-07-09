const express = require('express')
const db = require('../db')
const { ok, fail } = require('../utils/response')
const { saveUploadedImage, buildPublicUrl } = require('../services/upload.service')
const { publicBaseUrl } = require('../config')
const { evaluateFinancePostReviewAsync } = require('../services/finance-circle-moderation.service')
const {
  notifyFinancePostPending,
  notifyFinancePostReviewResult
} = require('../services/finance-circle-notification.service')

const router = express.Router()

function parseImages(val) {
  try { return val ? JSON.parse(val) : [] } catch { return [] }
}

function normalizeMediaUrl(url) {
  if (!url || typeof url !== 'string') return url
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/uploads/')) return buildPublicUrl(url.replace(/^\/uploads\//, ''))
  if (publicBaseUrl && url.startsWith('/')) return `${publicBaseUrl.replace(/\/$/, '')}${url}`
  return url
}

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  return digits.length >= 11 ? digits : ''
}

router.get('/feed', (req, res) => {
  const posts = db.prepare(`
    SELECT * FROM finance_circle_posts
    WHERE COALESCE(review_status, 'approved') = 'approved'
    ORDER BY id DESC LIMIT 50
  `).all()
  ok(res, posts.map(mapPost))
})

router.post('/upload-image', async (req, res) => {
  try {
    const { contentBase64, fileName } = req.body || {}
    if (!contentBase64) return fail(res, '缺少 contentBase64', 400)
    const saved = await saveUploadedImage({
      subdir: 'finance-circle',
      fileName: fileName || 'feed.jpg',
      contentBase64,
      maxSize: 5 * 1024 * 1024
    })
    ok(res, {
      url: saved.url,
      localUrl: saved.localUrl,
      cdnUrl: saved.cdnUrl,
      fileName: saved.fileName
    }, '上传成功')
  } catch (err) {
    fail(res, err.message || '上传失败', 500)
  }
})

router.post('/posts', async (req, res, next) => {
  try {
    const { content, images, userName, avatar, userPhone } = req.body || {}
    if (!content || !String(content).trim()) return fail(res, '内容不能为空')

    const review = await evaluateFinancePostReviewAsync({
      content,
      images
    })
    const authorPhone = normalizePhone(userPhone)
    const reviewedAt = review.status !== 'pending' ? new Date().toISOString() : null

    const result = db.prepare(`
      INSERT INTO finance_circle_posts (
        user_name, avatar, content, images, likes, post_type,
        review_status, review_note, reviewed_at, author_phone
      )
      VALUES (?, ?, ?, ?, 0, 'feed', ?, ?, ?, ?)
    `).run(
      userName || '亮叶用户',
      avatar || '/images/avatar.png',
      content,
      JSON.stringify(images || []),
      review.status,
      review.note,
      reviewedAt,
      authorPhone || null
    )

    const postId = result.lastInsertRowid
    if (review.status === 'pending') {
      try {
        notifyFinancePostPending({ postId, userName, contentPreview: content })
      } catch (err) {
        console.warn('finance pending notification failed', err.message)
      }
    }

    const messages = {
      approved: review.auto ? '已自动通过并展示' : '发布成功',
      pending: '已提交，审核通过后展示',
      rejected: '内容未通过审核，请修改后重试'
    }

    ok(res, {
      id: postId,
      reviewStatus: review.status,
      autoReview: review.auto,
      reviewRule: review.rule || null
    }, messages[review.status] || messages.pending)
  } catch (e) {
    next(e)
  }
})

router.post('/posts/:id/like', (req, res) => {
  const row = db.prepare('SELECT likes FROM finance_circle_posts WHERE id = ?').get(req.params.id)
  if (!row) return fail(res, '动态不存在', 404)
  const likes = (row.likes || 0) + 1
  db.prepare('UPDATE finance_circle_posts SET likes = ? WHERE id = ?').run(likes, req.params.id)
  ok(res, { likes })
})

function mapPost(post) {
  const commentList = db.prepare('SELECT * FROM finance_circle_comments WHERE post_id = ? ORDER BY id ASC LIMIT 50').all(post.id)
    .map(c => ({
      id: c.id,
      user: c.user_name,
      content: c.content,
      time: c.created_at
    }))
  return {
    id: post.id,
    user: post.user_name,
    avatar: normalizeMediaUrl(post.avatar || '/images/avatar.png'),
    time: post.created_at,
    content: post.content,
    images: parseImages(post.images).map(normalizeMediaUrl),
    likes: post.likes || 0,
    type: post.post_type || 'feed',
    intakeProduct: post.intake_product || '',
    intakeProductName: post.intake_product_name || '',
    commentList,
    comments: commentList.length
  }
}

router.get('/posts/:id', (req, res) => {
  const post = db.prepare('SELECT * FROM finance_circle_posts WHERE id = ?').get(req.params.id)
  if (!post) return fail(res, '动态不存在', 404)
  if (post.review_status && post.review_status !== 'approved') {
    return fail(res, '内容审核中或不可用', 404)
  }
  ok(res, mapPost(post))
})

router.post('/posts/:id/comments', (req, res) => {
  const { content, userName } = req.body || {}
  if (!content) return fail(res, '评论不能为空')
  const result = db.prepare(`
    INSERT INTO finance_circle_comments (post_id, user_name, content) VALUES (?, ?, ?)
  `).run(req.params.id, userName || '亮叶用户', content)
  ok(res, {
    id: result.lastInsertRowid,
    user: userName || '亮叶用户',
    content,
    time: new Date().toISOString()
  })
})

module.exports = router
