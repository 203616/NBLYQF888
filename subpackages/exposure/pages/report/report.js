const { submitReport } = require('../../api/exposure')

Page({
  data: {
    reportTypes: [
      "非法集资",
      "高利贷",
      "套路贷",
      "虚假宣传",
      "合同欺诈",
      "其他"
    ],
    formData: {
      type: "",
      title: "",
      content: "",
      contact: ""
    },
    reportType: '',
    evidence: [],
    submitting: false,
    canUploadMore: true
  },
  
  onLoad() {
    wx.setNavigationBarTitle({ title: "举报曝光" });
  },
  
  changeReportType(e) {
    const index = Number(e.detail.value)
    this.setData({
      reportType: index,
      'formData.type': this.data.reportTypes[index]
    })
  },
  
  onTitleInput(e) {
    this.setData({ 'formData.title': e.detail.value });
  },
  
  onContentInput(e) {
    this.setData({ 'formData.content': e.detail.value });
  },
  
  onContactInput(e) {
    this.setData({ 'formData.contact': e.detail.value });
  },
  
  chooseImage() {
    wx.chooseMedia({
      count: 6 - this.data.evidence.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const files = res.tempFiles.map(item => item.tempFilePath)
        const evidence = [...this.data.evidence, ...files].slice(0, 6)
        this.setData({ evidence, canUploadMore: evidence.length < 6 })
      }
    })
  },

  removeImage(e) {
    const index = Number(e.currentTarget.dataset.index)
    const evidence = this.data.evidence.filter((_, itemIndex) => itemIndex !== index)
    this.setData({ evidence, canUploadMore: evidence.length < 6 })
  },

  submitReport(e) {
    const values = e.detail && e.detail.value ? e.detail.value : {}
    const formData = {
      ...this.data.formData,
      ...values,
      evidence: this.data.evidence
    }
    const { type, title, content } = formData;
    if (!type || !title || !content) {
      wx.showToast({ title: '请填写必填项', icon: 'none' });
      return;
    }
    if (this.data.submitting) return

    this.setData({ submitting: true, formData })
    submitReport(formData).then(() => {
      wx.showToast({
        title: '举报成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      });
    }).finally(() => {
      this.setData({ submitting: false });
    });
  }
})