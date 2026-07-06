Component({
  properties: {
    title: String,  // 区块标题
    items: Array,    // 内容项数组
    showMore: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    handleMore() {
      this.triggerEvent('more')
    }
  }
})