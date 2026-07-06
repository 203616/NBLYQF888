const { getNewsList } = require('../../../../api/content')

Page({
  data: {
    keyword: '',
    newsList: [],
    filteredList: []
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: '行业新闻' })
    getNewsList().then(newsList => {
      this.setData({ newsList, filteredList: newsList })
    })
  },

  onSearchInput(e) {
    const keyword = e.detail.value.trim()
    const filteredList = keyword
      ? this.data.newsList.filter(item => item.title.includes(keyword) || item.summary.includes(keyword))
      : this.data.newsList
    this.setData({ keyword, filteredList })
  },

  onSearch(e) {
    this.onSearchInput(e)
  },

  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/subpackages/news/pages/detail/detail?id=${id}`
    })
  }
})
