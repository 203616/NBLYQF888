const { getKnowledgeList } = require('../../api/knowledge')

Page({
  data: {
    activeCategory: 'all',
    categories: [
      { id: 'all', name: '全部' },
      { id: 'finance', name: '融资知识' },
      { id: 'loan', name: '贷款指南' },
      { id: 'policy', name: '政策分析' },
      { id: 'innovation', name: '金融创新' }
    ],
    knowledgeList: [],
    filteredList: [],
    statList: []
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: '融资课堂' })
    getKnowledgeList().then(knowledgeList => {
      const totalViews = knowledgeList.reduce((s, i) => s + (i.views || 0), 0)
      this.setData({
        knowledgeList,
        statList: [
          { label: '课程', value: String(knowledgeList.length) },
          { label: '总学习', value: totalViews >= 1000 ? (totalViews / 1000).toFixed(1) + 'k' : String(totalViews) },
          { label: '含测验', value: '全部' }
        ]
      }, () => this.filterList())
    })
  },

  filterList() {
    const { knowledgeList, activeCategory } = this.data
    const filteredList = activeCategory === 'all'
      ? knowledgeList
      : knowledgeList.filter(item => item.category === activeCategory)
    this.setData({ filteredList })
  },

  switchCategory(e) {
    this.setData({ activeCategory: e.currentTarget.dataset.id }, () => this.filterList())
  },

  navigateToDetail(e) {
    wx.navigateTo({ url: `/subpackages/knowledge/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  }
})
