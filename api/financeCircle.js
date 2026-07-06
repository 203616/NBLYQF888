const { get, post } = require('../utils/request')
const { getConfig } = require('../utils/config')
const { uploadImageBase64 } = require('../utils/upload')
const mock = require('./mock')

const STORAGE_KEY = 'finance_circle_local'

function loadLocalFeed() {
  const stored = wx.getStorageSync(STORAGE_KEY)
  if (stored && stored.length) return stored
  const extras = mock.financeCircleExtras || {}
  const seed = (extras.feedPosts || []).map(p => ({
    ...p,
    liked: false,
    commentList: [
      { id: 1, user: '李经理', content: '感谢分享，已收藏。', time: '刚刚' },
      { id: 2, user: '王老板', content: '请问材料清单在哪里看？', time: '5分钟前' }
    ].slice(0, p.comments || 0)
  }))
  wx.setStorageSync(STORAGE_KEY, seed)
  return seed
}

function saveLocalFeed(feed) {
  wx.setStorageSync(STORAGE_KEY, feed)
}

function normalizeFeedPost(post) {
  const commentList = post.commentList || (Array.isArray(post.comments) ? post.comments : [])
  return {
    ...post,
    commentList,
    comments: commentList.length
  }
}

function getFeedPosts() {
  if (getConfig().useMockFallback) {
    return Promise.resolve(
      loadLocalFeed()
        .filter(p => p.reviewStatus !== 'pending')
        .map(normalizeFeedPost)
    )
  }
  return get('/finance-circle/feed')
    .then(posts => (posts || []).map(normalizeFeedPost))
    .catch(() => Promise.resolve(loadLocalFeed().map(normalizeFeedPost)))
}

function getFeedDetail(postId) {
  if (getConfig().useMockFallback) {
    const feed = loadLocalFeed()
    const item = feed.find(p => String(p.id) === String(postId))
    if (!item) return Promise.reject(new Error('动态不存在'))
    return Promise.resolve(normalizeFeedPost({
      ...item,
      intakeProduct: item.intakeProduct || (item.type === 'case' ? 'business' : ''),
      intakeProductName: item.intakeProductName || (item.type === 'case' ? '经营贷进件' : '')
    }))
  }
  return get(`/finance-circle/posts/${postId}`).then(normalizeFeedPost)
}

function likePost(postId) {
  if (getConfig().useMockFallback) {
    const feed = loadLocalFeed()
    const item = feed.find(p => String(p.id) === String(postId))
    if (item) {
      item.likes = (item.likes || 0) + 1
      item.liked = true
      saveLocalFeed(feed)
    }
    return Promise.resolve({ likes: item?.likes || 0 })
  }
  return post(`/finance-circle/posts/${postId}/like`)
}

function addComment(postId, content, userName) {
  if (getConfig().useMockFallback) {
    const feed = loadLocalFeed()
    const item = feed.find(p => String(p.id) === String(postId))
    if (item) {
      item.commentList = item.commentList || []
      item.commentList.push({
        id: Date.now(),
        user: userName || '亮叶用户',
        content,
        time: '刚刚'
      })
      item.comments = item.commentList.length
      saveLocalFeed(feed)
    }
    return Promise.resolve(item?.commentList?.slice(-1)[0])
  }
  return post(`/finance-circle/posts/${postId}/comments`, { content, userName })
}

function uploadFeedImage(filePath) {
  const fileName = String(filePath || '').split('/').pop() || 'feed.jpg'
  if (getConfig().useMockFallback) {
    return Promise.resolve(filePath)
  }
  return uploadImageBase64('/finance-circle/upload-image', filePath, fileName)
    .then(res => res.url || res.localUrl || filePath)
    .catch(() => filePath)
}

function publishPost(data) {
  if (getConfig().useMockFallback) {
    const text = String(data.content || '').trim()
    const images = data.images || []
    const blocked = ['赌博', '套现', '高利贷', '保证下款'].some(w => text.includes(w))
    if (blocked) {
      return Promise.resolve({ id: Date.now(), reviewStatus: 'rejected', message: '内容未通过审核' })
    }
    if (images.length) {
      return Promise.resolve({ id: Date.now(), reviewStatus: 'pending', message: '已提交，审核通过后展示' })
    }
    if (text.length <= 200) {
      const feed = loadLocalFeed()
      feed.unshift({
        id: Date.now(),
        user: data.userName || '亮叶用户',
        avatar: data.avatar || '/images/avatar.webp',
        time: '刚刚',
        content: text,
        images,
        likes: 0,
        comments: 0,
        liked: false,
        commentList: [],
        type: 'feed',
        reviewStatus: 'approved'
      })
      saveLocalFeed(feed)
      return Promise.resolve({ id: Date.now(), reviewStatus: 'approved', autoReview: true })
    }
    return Promise.resolve({ id: Date.now(), reviewStatus: 'pending' })
  }
  return post('/finance-circle/posts', data)
}

module.exports = {
  getFeedPosts,
  getFeedDetail,
  likePost,
  addComment,
  publishPost,
  uploadFeedImage
}
