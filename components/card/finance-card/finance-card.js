Component({
  properties: {
    // 产品数据对象
    product: {
      type: Object,
      value: {
        id: '',
        title: '金融产品',
        desc: '产品描述',
        icon: '📋',
        tags: ['热门', '限时']
      }
    },
    // 是否显示操作按钮
    showAction: {
      type: Boolean,
      value: true
    }
  },
  
  data: {
    // 组件内部状态
    isFav: false,
    animationData: {}
  },

  methods: {
    // 产品卡片点击事件
    handleCardTap() {
      this.triggerEvent('select', {
        id: this.properties.product.id
      });
    },
    
    // 收藏操作
    toggleFav() {
      const isFav = !this.data.isFav;
      this.setData({ isFav });
      
      // 触发收藏事件
      this.triggerEvent('favchange', {
        id: this.properties.product.id,
        favStatus: isFav
      });
      
      // 收藏动画效果
      this.runFavAnimation();
    },
    
    // 收藏动画效果
    runFavAnimation() {
      const animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease-in-out'
      });
      
      animation.scale(1.2, 1.2).step({ duration: 150 });
      animation.scale(1.0, 1.0).step({ duration: 150 });
      
      this.setData({
        animationData: animation.export()
      });
      
      setTimeout(() => {
        this.setData({ animationData: {} });
      }, 300);
    }
  }
});