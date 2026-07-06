// 扩展更多模拟数据
module.exports = {
  getLoanProducts() {
    return [
      { id: 1, name: '新车五年按揭', rate: '4.99%起' },
      { id: 2, name: '二手房融资', rate: '3.85%起' }
    ]
  },
  
  getAutoServices() {
    return [
      { type: 'clue', title: '汽车线索', items: ['新车线索', '二手车线索'] },
      { type: 'warranty', title: '延保服务', items: ['基础保障', '全面保障'] }
    ]
  }
}