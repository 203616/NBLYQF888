Component({
  properties: {
    title: String,
    items: Array
  },
  
  methods: {
    handleItemTap(e) {
      const index = e.currentTarget.dataset.index;
      this.triggerEvent('itemtap', { index });
    }
  }
})