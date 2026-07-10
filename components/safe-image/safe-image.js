const { getImageUrl, getFallbackPath } = require('../../utils/image')

Component({
  properties: {
    src: { type: String, value: '' },
    className: { type: String, value: '' },
    mode: { type: String, value: 'aspectFill' },
    fallback: { type: String, value: '' },
    lazyLoad: { type: Boolean, value: false },
    showMenuByLongpress: { type: Boolean, value: false },
    dataIndex: { type: Number, value: -1 },
    previewUrl: { type: String, value: '' },
    previewUrls: { type: null, value: [] }
  },

  data: {
    currentSrc: '',
    fallbackSrc: '',
    showPlaceholder: false
  },

  observers: {
    'src': function (src) {
      if (src == null || src === '') {
        this.setData({ currentSrc: '', showPlaceholder: true })
        return
      }
      this.applySrc(src)
    }
  },

  lifetimes: {
    attached() {
      const src = this.properties.src
      this.applySrc(src == null ? '' : src)
    }
  },

  methods: {
    applySrc(src) {
      const raw = src == null ? '' : String(src)
      const primary = getImageUrl(raw) || ''
      const fb = this.properties.fallback || (primary ? getFallbackPath(primary) : '')
      this.setData({ currentSrc: primary, fallbackSrc: fb, showPlaceholder: false })
    },

    onError() {
      // 对本地路径直接显示占位符，避免fallback重复触发渲染层错误
      if (!this.data.currentSrc.startsWith('http')) {
        this.setData({ showPlaceholder: true })
        return
      }
      const { currentSrc, fallbackSrc } = this.data
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        this.setData({ currentSrc: fallbackSrc })
        return
      }
      this.setData({ showPlaceholder: true })
    },

    onTap(e) {
      if (this.data.showPlaceholder) return
      const url = this.properties.previewUrl || this.properties.src || ''
      const previewUrls = this.properties.previewUrls
      const detail = {
        ...(e.detail || {}),
        index: this.properties.dataIndex,
        url,
        previewUrls: Array.isArray(previewUrls) && previewUrls.length ? previewUrls : (url ? [url] : [])
      }
      this.triggerEvent('tap', detail)
    }
  }
})
