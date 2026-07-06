const { applyChannel } = require('../../../../api/channel')
const { getAppLocation } = require('../../../../utils/location')

Page({
  data: {
    form: {
      name: '',
      city: '',
      contact: '',
      specialty: '',
      intro: ''
    },
    submitting: false,
    steps: [
      { title: '提交资料', desc: '填写团队基本信息与擅长领域' },
      { title: '资质审核', desc: '亮叶企服将在1个工作日内联系核实' },
      { title: '开通协作', desc: '审核通过后即可参与本地撮合协作' }
    ]
  },

  onLoad() {
    const location = getAppLocation()
    const phone = wx.getStorageSync('userPhone') || ''
    this.setData({
      'form.city': location.city || '',
      'form.contact': phone
    })
  },

  handleInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  handleSubmit() {
    const { name, city, contact, specialty } = this.data.form
    if (!name || !city || !contact || !specialty) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    applyChannel(this.data.form)
      .then(res => {
        wx.showModal({
          title: '提交成功',
          content: res.message,
          showCancel: false,
          success: () => wx.navigateBack()
        })
      })
      .finally(() => this.setData({ submitting: false }))
  }
})
