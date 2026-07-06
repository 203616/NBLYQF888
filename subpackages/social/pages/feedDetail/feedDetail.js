const { getFeedDetail, likePost, addComment } = require('../../../../api/financeCircle')

Page({
  data: {
    post: null,
    commentInput: '',
    userName: '亮叶用户',
    loading: true
  },

  onLoad(options) {
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({ userName: userInfo?.nickName || '亮叶用户' })
    getFeedDetail(options.id).then(post => {
      this.setData({ post, loading: false })
      wx.setNavigationBarTitle({ title: `${post.user} 的动态` })
    }).catch(() => {
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  handleLike() {
    const { post } = this.data
    if (!post || post.liked) return
    likePost(post.id).then(res => {
      this.setData({ post: { ...post, likes: res.likes, liked: true } })
    })
  },

  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value })
  },

  submitComment() {
    const content = this.data.commentInput.trim()
    if (!content || !this.data.post) return
    addComment(this.data.post.id, content, this.data.userName).then(comment => {
      const post = this.data.post
      const commentList = [...(post.commentList || post.comments || []), comment]
      this.setData({
        post: { ...post, commentList, comments: commentList.length },
        commentInput: ''
      })
      wx.showToast({ title: '评论成功', icon: 'success' })
    })
  },

  previewImage(e) {
    const url = e.detail?.url || e.currentTarget?.dataset?.url
    const urls = (e.detail?.previewUrls?.length ? e.detail.previewUrls : [url]).filter(Boolean)
    if (!url) return
    wx.previewImage({ urls, current: url })
  },

  goIntake() {
    const post = this.data.post
    const productType = post?.intakeProduct || 'business'
    const productName = post?.intakeProductName || '易融圈关联进件'
    const { goIntake } = require('../../../../utils/intakeNav')
    goIntake({ productType, productName })
  },

  goServiceChat() {
    wx.navigateTo({ url: '/subpackages/service/pages/chat/chat' })
  }
})
