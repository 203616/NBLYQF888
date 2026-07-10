const { getNewsDetail } = require('../../api/news')
const mock = require('../../../../api/mock')

Page({
  data: {
    newsDetail: null,
    relatedNews: [],
    relatedLinks: [],
    loading: true
  },

  onLoad(options) {
    this.loadNewsDetail(options.id)
  },

  loadNewsDetail(id) {
    this.setData({ loading: true })
    getNewsDetail(id).then(item => {
      const newsDetail = item || {
        title: '文章不存在',
        content: '<p>您要查看的内容不存在或已被删除</p>',
        date: '-',
        source: '-',
        views: 0,
        cover: '/subpackages/news/images/news/news-1.webp'
      }
      const relatedNews = mock.news
        .filter(news => String(news.id) !== String(id))
        .map(news => ({ id: news.id, title: news.title }))
        .slice(0, 3)
      const relatedLinks = [
        { type: '产品', title: mock.products[0].name, desc: mock.products[0].desc, path: mock.products[0].path },
        { type: '知识', title: mock.knowledge[0].title, desc: mock.knowledge[0].summary, path: `/subpackages/knowledge/pages/detail/detail?id=${mock.knowledge[0].id}` },
        { type: '避坑', title: mock.tips[1].title, desc: mock.tips[1].summary, path: `/subpackages/tips/pages/detail/detail?id=${mock.tips[1].id}` }
      ]
      this.setData({ newsDetail, relatedNews, relatedLinks, loading: false })
      if (newsDetail.title) {
        wx.setNavigationBarTitle({ title: newsDetail.title })
      }
    }).catch(() => {
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  navigateToRelated(e) {
    const id = e.currentTarget.dataset.id
    this.loadNewsDetail(id)
  },

  navigateToLink(e) {
    const path = e.currentTarget.dataset.path
    if (!path) return
    if (path.startsWith('/pages/')) {
      wx.switchTab({ url: path })
    } else {
      wx.navigateTo({ url: path })
    }
  },

  onShareAppMessage() {
    const detail = this.data.newsDetail || {}
    return {
      title: detail.title || '亮叶资讯',
      path: `/subpackages/news/pages/detail/detail?id=${detail.id || ''}`,
      desc: detail.summary || '亮叶企服资讯详情'
    }
  },

  onShareTimeline() {
    const detail = this.data.newsDetail || {}
    return {
      title: detail.title || '亮叶资讯'
    }
  }
})
