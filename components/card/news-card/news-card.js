Component({
  properties: {
    id: { type: Number, value: 0 },
    category: { type: String, value: '分类' },
    title: { type: String, value: '标题' },
    cover: { type: String, value: '' },
    date: { type: String, value: '' },
    views: { type: Number, value: 0 }
  },

  methods: {
    handleTap() {
      this.triggerEvent('cardtap', { id: this.properties.id })
    }
  }
})
