Component({
  properties: {
    data: Object // 接收卡片数据对象
  },
  methods: {
    handleTap() {
      this.triggerEvent('cardtap', { id: this.data.data.id }) // 事件通信
    }
  }
})