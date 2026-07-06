Page({
  data: {
    type: 'privacy',
    title: '隐私政策',
    sections: []
  },

  onLoad(options) {
    const type = options.type || 'privacy'
    const content = type === 'service' ? this.getServiceAgreement() : this.getPrivacyPolicy()
    wx.setNavigationBarTitle({ title: content.title })
    this.setData({ type, title: content.title, sections: content.sections })
  },

  getPrivacyPolicy() {
    return {
      title: '隐私政策',
      sections: [
        { heading: '一、信息收集范围', body: '我们可能收集：手机号码（用于账号验证与业务联系）、位置信息（用于展示本地服务）、设备信息（用于安全风控）、您主动提交的进件材料（用于信息撮合）。' },
        { heading: '二、信息使用目的', body: '收集的信息仅用于金融信息咨询与居间撮合服务，包括需求匹配、进件进度通知、客服联系及合规审计。不会用于与业务无关的营销。' },
        { heading: '三、信息共享', body: '经您明确授权后，我们可能将必要材料共享给您选择的持牌金融机构。未经同意，不向第三方出售个人信息。' },
        { heading: '四、信息存储与安全', body: '数据存储于境内服务器，采取加密与访问控制措施。您可申请查阅、更正或删除个人信息。' },
        { heading: '五、您的权利', body: '您有权撤回授权、注销账号、拒绝非必要权限。撤回后部分功能可能无法使用。' },
        { heading: '六、联系我们', body: '如有隐私相关问题，请联系亮叶企服客服：400-888-7777。' }
      ]
    }
  },

  getServiceAgreement() {
    return {
      title: '用户服务协议',
      sections: [
        { heading: '一、服务性质', body: '亮叶企服是金融信息咨询与居间撮合平台，不具备金融牌照，不发放贷款，不承诺任何机构审批结果、额度或利率。' },
        { heading: '二、用户义务', body: '您应提供真实、完整的资料，不得伪造材料或用于违法违规用途。不得利用平台从事非法集资、套路贷等活动。' },
        { heading: '三、费用说明', body: '平台不收取前置保证金。任何服务费用以您与持牌机构或服务商签署的正式合同为准。' },
        { heading: '四、免责声明', body: '平台展示的产品信息来源于持牌机构公开资料，仅供参考。最终条件以机构审核及正式合同为准。' },
        { heading: '五、协议变更', body: '我们可能更新本协议，更新后继续使用即视为同意。重大变更将通过站内通知告知。' }
      ]
    }
  }
})
