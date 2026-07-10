Page({
  onShareAppMessage() {
    return {
      title: '亮叶金融计算器',
      path: '/subpackages/tools/pages/calculator/calculator',
      desc: '车贷、房贷、信用贷多种还款方式测算工具，支持等额本息、等额本金。'
    }
  },

  onShareTimeline() {
    return {
      title: '亮叶金融计算器'
    }
  }
})
