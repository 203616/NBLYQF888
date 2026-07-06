const { sendSmsCode, resetPassword } = require('../../../api/auth')

let smsTimer = null;

Page({
  data: {
    phone: '',
    smsCode: '',
    password: '',
    countdown: 0,
    isSubmitting: false,
    isValidPhone: false
  },

  onUnload() {
    // 确保清除定时器防止内存泄漏
    if (smsTimer) {
      clearInterval(smsTimer);
      smsTimer = null;
    }
  },

  // 手机号输入处理
  bindPhoneInput(e) {
    const phone = e.detail.value;
    const isValid = /^1[3-9]\d{9}$/.test(phone);
    this.setData({ 
      phone,
      isValidPhone: isValid
    });
  },

  // 验证码输入处理
  bindSmsInput(e) {
    this.setData({ smsCode: e.detail.value });
  },

  // 密码输入处理
  bindPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  sendSmsCode() {
    const { phone, isValidPhone, countdown } = this.data;
    
    if (countdown > 0 || !isValidPhone) return;
    
    sendSmsCode(phone).then(() => {
      wx.showToast({ title: '验证码已发送', icon: 'success' });
      this.startCountdown();
    }).catch(() => {
      wx.showToast({ title: '发送失败，请重试', icon: 'none' });
    })
  },

  startCountdown() {
    this.setData({ countdown: 60 });
    smsTimer = setInterval(() => {
      if (this.data.countdown <= 1) {
        clearInterval(smsTimer);
        smsTimer = null;
        this.setData({ countdown: 0 });
      } else {
        this.setData({ countdown: this.data.countdown - 1 });
      }
    }, 1000);
  },

  handleSubmit() {
    const { phone, smsCode, password, isSubmitting } = this.data;
    
    // 防重复提交
    if (isSubmitting) return;
    
    // 手机号验证
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return wx.showToast({ 
        title: '请输入正确的11位手机号', 
        icon: 'none',
        duration: 2000
      });
    }
    
    // 验证码验证
    if (!/^\d{6}$/.test(smsCode)) {
      return wx.showToast({ 
        title: '请输入6位数字验证码', 
        icon: 'none',
        duration: 2000
      });
    }
    
    // 密码验证
    if (password.length < 6 || password.length > 20) {
      return wx.showToast({ 
        title: '密码需6-20位字符', 
        icon: 'none',
        duration: 2000
      });
    }
    
    this.setData({ isSubmitting: true });
    wx.showLoading({ title: '提交中...', mask: true });
    
    resetPassword(phone, smsCode, password)
      .then(() => {
        wx.showToast({
          title: '密码重置成功',
          icon: 'success',
          duration: 1500
        });
        setTimeout(() => wx.navigateBack(), 1600);
      })
      .finally(() => {
        wx.hideLoading();
        this.setData({ isSubmitting: false });
      })
  },

  onLoad() {
    this.setData({ isDeveloping: false });
  }
});