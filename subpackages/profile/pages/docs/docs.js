const { getDocuments } = require('../../../../api/profile')

const STATUS_KEY = {
  '已归档': 'done',
  '待补充': 'pending',
  '审核中': 'processing',
  '未上传': 'empty'
}

Page({
  data: {
    // 文档中心数据
    activeCategory: '',
    expandedId: '',
    filterStatus: 'all',
    docs: [],
    filteredDocs: [],
    summary: [],
    uploadTips: [
      '图片需清晰完整，避免反光和遮挡，建议原图上传。',
      '经营流水建议提供近6个月连续记录，不可缺页。',
      '合同资料请确认签章页、金额页和还款计划页完整。',
      '验证视频建议横屏拍摄，光线充足，时长不超过3分钟。',
      '身份证等证件可通过进件系统 OCR 自动识别填入。'
    ],
    // 合同视图数据
    tab: '',
    contractAgreed: false,
    signing: false,
    signRecord: null
  },

  onLoad(options) {
    const tab = options.tab || ''
    if (tab === 'contract') {
      this.setData({ tab: 'contract' })
      this.loadSignRecord()
      return
    }
    const activeCategory = options.category || ''
    this.setData({ activeCategory, expandedId: activeCategory })
    this.loadDocs()
  },

  onShareAppMessage() {
    if (this.data.tab === 'contract') {
      return {
        title: '金融信息居间服务合同',
        path: '/subpackages/profile/pages/docs/docs?tab=contract'
      }
    }
    return { title: '文档中心' }
  },

  /* ===== 文档中心方法 ===== */
  normalizeDocs(docs) {
    return (docs || []).map(doc => ({
      ...doc,
      statusKey: STATUS_KEY[doc.status] || 'pending',
      icon: doc.icon || '📁'
    }))
  },

  updateSummary(docs) {
    const total = docs.length
    const archived = docs.filter(d => d.status === '已归档').length
    const pending = docs.filter(d => d.status === '待补充' || d.status === '未上传').length
    const totalFiles = docs.reduce((s, d) => s + (d.count || 0), 0)
    this.setData({
      summary: [
        { label: '分类', value: String(total) },
        { label: '已归档', value: String(archived) },
        { label: '待补充', value: String(pending) },
        { label: '总文件', value: String(totalFiles) }
      ]
    })
  },

  applyFilter() {
    const { docs, filterStatus } = this.data
    const filtered = filterStatus === 'all' ? docs : docs.filter(d => d.status === filterStatus)
    this.setData({ filteredDocs: filtered })
  },

  loadDocs() {
    getDocuments().then(docs => {
      const normalized = this.normalizeDocs(docs)
      this.setData({ docs: normalized })
      this.updateSummary(normalized)
      this.applyFilter()
    })
  },

  switchStatus(e) {
    this.setData({ filterStatus: e.currentTarget.dataset.status }, () => this.applyFilter())
  },

  toggleExpand(e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      expandedId: this.data.expandedId === id ? '' : id,
      activeCategory: id
    })
  },

  showExample(e) {
    const item = this.data.docs.find(doc => doc.id === e.currentTarget.dataset.id)
    if (!item) return
    const required = (item.required || []).join('\n· ')
    wx.showModal({
      title: `${item.name}示例`,
      content: `${item.desc}\n\n建议材料：\n· ${required || '请按提示准备清晰完整的材料影像'}`,
      showCancel: false
    })
  },

  handleUpload(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.docs.find(doc => doc.id === id)
    if (!item) return

    wx.showActionSheet({
      itemList: ['进入进件系统上传', '拍照上传', '从相册选择', '查看材料示例'],
      success: (res) => {
        if (res.tapIndex === 0) {
          return this.goIntakeUpload()
        }
        if (res.tapIndex === 3) {
          return this.showExample({ currentTarget: { dataset: { id } } })
        }
        const sourceType = res.tapIndex === 1 ? ['camera'] : ['album']
        wx.chooseMedia({
          count: 9,
          mediaType: ['image'],
          sourceType,
          success: (mediaRes) => {
            wx.showToast({
              title: `已选择${mediaRes.tempFiles.length}张`,
              icon: 'success'
            })
          }
        })
      }
    })
  },

  goIntakeUpload() {
    wx.navigateTo({ url: '/subpackages/intake/pages/upload/upload' })
  },

  goIntakeHome() {
    wx.navigateTo({ url: '/subpackages/intake/pages/index/index?productType=workflow' })
  },

  /* ===== 合同视图方法 ===== */

  /** 加载签署记录 */
  loadSignRecord() {
    try {
      const record = wx.getStorageSync('contract_sign_record')
      if (record) {
        this.setData({ signRecord: record, contractAgreed: true })
      }
    } catch (e) {
      console.warn('[contract] load sign record failed', e)
    }
  },

  /** 切换同意复选框 */
  toggleContractAgree() {
    if (this.data.signRecord) {
      wx.showToast({ title: '您已签署此合同', icon: 'none' })
      return
    }
    this.setData({ contractAgreed: !this.data.contractAgreed })
  },

  /** 确认签署 */
  handleConfirmSign() {
    if (!this.data.contractAgreed) {
      wx.showToast({ title: '请先阅读并同意合同条款', icon: 'none' })
      return
    }
    if (this.data.signRecord) {
      wx.showToast({ title: '您已签署，无需重复签署', icon: 'none' })
      return
    }

    const app = getApp()
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo') || {}
    const userName = userInfo.realName || userInfo.nickName || '用户'
    const idCard = userInfo.idCard || '****'

    wx.showModal({
      title: '确认签署',
      content: `您确认签署《金融信息居间服务合同》吗？签署后具有法律效力。`,
      confirmText: '确认签署',
      confirmColor: '#D4A84B',
      success: (res) => {
        if (!res.confirm) return
        this.doSign(userName, idCard)
      }
    })
  },

  /** 执行签署 */
  doSign(userName, idCard) {
    this.setData({ signing: true })
    wx.showLoading({ title: '签署中...', mask: true })

    const now = new Date()
    const contractNo = 'LJ' + now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0') +
      Math.random().toString(36).substring(2, 6).toUpperCase()

    const signedAt = now.getFullYear() + '年' +
      (now.getMonth() + 1) + '月' +
      now.getDate() + '日 ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0')

    const record = {
      contractNo,
      userName,
      idCard,
      signedAt,
      version: '1.0',
      timestamp: now.getTime()
    }

    // 模拟签署延迟
    setTimeout(() => {
      try {
        // 保存签署历史
        const history = wx.getStorageSync('contract_sign_history') || []
        history.push(record)
        wx.setStorageSync('contract_sign_history', history)
        wx.setStorageSync('contract_sign_record', record)

        this.setData({
          signRecord: record,
          signing: false,
          contractAgreed: true
        })

        wx.hideLoading()
        wx.showToast({ title: '签署成功', icon: 'success', duration: 2000 })

        // 触感反馈
        if (wx.vibrateShort) {
          wx.vibrateShort({ type: 'medium' })
        }
      } catch (e) {
        wx.hideLoading()
        wx.showToast({ title: '签署失败，请重试', icon: 'none' })
        this.setData({ signing: false })
      }
    }, 1200)
  },

  /** 下载/复制合同文本 */
  handleDownloadContract() {
    const contractText = this.buildContractText()
    wx.setClipboardData({
      data: contractText,
      success: () => {
        wx.showModal({
          title: '已复制到剪贴板',
          content: '合同全文已复制，您可粘贴到文档中保存或打印。',
          showCancel: false,
          confirmText: '知道了'
        })
      },
      fail: () => {
        wx.showToast({ title: '复制失败', icon: 'none' })
      }
    })
  },

  /** 生成合同全文文本 */
  buildContractText() {
    const record = this.data.signRecord
    const signInfo = record
      ? `\n\n签署人：${record.userName}\n身份证号：${record.idCard}\n签署时间：${record.signedAt}\n合同编号：${record.contractNo}`
      : '\n\n（本合同尚未签署）'

    return `金融信息居间服务合同

本合同依据《中华人民共和国民法典》合同编第二十七章及相关金融法律法规制定。

第一条  术语定义

1.1 居间人：指为委托人提供金融信息咨询、融资方案推介及协助对接持牌金融机构服务的平台运营主体，即亮叶企服平台。
1.2 委托人：指通过本平台提交融资需求，寻求金融信息服务的自然人、法人或其他组织。
1.3 金融信息服务：指居间人向委托人提供的包括但不限于金融产品信息展示、融资方案介绍、持牌金融机构推介、申请材料整理、审批进度跟踪等居间撮合服务。
1.4 居间服务与直接贷款的区别：居间人仅提供金融信息咨询与撮合服务，并不直接向委托人发放任何形式的贷款。委托人与持牌金融机构之间的借贷关系独立于本居间服务合同。

第二条  服务内容

2.1 信息咨询：居间人通过本平台向委托人展示各类金融产品信息，并根据委托人提供的基本信息进行初步方案介绍与推荐。
2.2 撮合服务：居间人根据委托人提交的融资需求和资质情况，协助匹配合适的持牌金融机构。
2.3 材料整理：居间人协助委托人整理、完善申请融资所需的各类材料。
2.4 进度跟踪：居间人持续跟踪委托人在持牌金融机构的审批、签约及放款进度。
2.5 特别声明：居间人不直接发放贷款，不从事非法吸收公众存款、非法放贷等违法违规金融活动。

第三条  双方权利义务

（一）委托人权利与义务
3.1.1 委托人有权了解居间人提供的金融信息服务内容、收费标准及合作持牌金融机构的基本情况。
3.1.2 委托人应如实提供真实、完整、有效的身份信息、财务状况、融资用途等必要信息。
3.1.3 委托人应积极配合居间人及持牌金融机构的审核与尽调工作。
3.1.4 委托人与持牌金融机构达成贷款合同后，应按约定全面履行贷款合同项下的全部义务。

（二）居间人权利与义务
3.2.1 居间人应如实告知与融资相关的信息，不得故意隐瞒重要事实或提供虚假信息。
3.2.2 居间人对获取的委托人个人信息及商业秘密负有严格保密义务。
3.2.3 居间人应根据委托人实际情况提供专业、合理的融资方案推荐，但不对审批结果做出承诺。
3.2.4 居间人应妥善管理委托人提交的各类材料，防止信息泄露。

第四条  服务费用

4.1 委托人应在成功获得持牌金融机构贷款后，按实际放款金额的一定比例向居间人支付服务费。
4.2 委托人应在收到放款后的约定工作日内将服务费一次性支付至居间人指定账户。
4.3 居间人可向委托人开具合法合规的增值税发票。
4.4 若委托人最终未能成功获得贷款，除另有约定外，无需支付居间服务费。

第五条  免责条款

5.1 因不可抗力导致本合同无法履行的，受影响方不承担违约责任。
5.2 贷款的最终审批权归属于持牌金融机构，居间人不承担审批结果的责任。
5.3 因委托人提供的信息不真实、不准确导致损失的，由委托人自行承担。
5.4 居间人对委托人通过其他渠道产生的交易结果不承担责任。

第六条  隐私保护

6.1 居间人仅收集与融资服务相关的必要个人信息，并在服务范围内合理使用。
6.2 居间人采取加密存储、访问控制等安全措施保障个人信息安全。
6.3 未经委托人同意，居间人不得向第三方提供个人信息，法律法规另有规定的除外。
6.4 居间人将在合同终止后依法处理保存的个人信息。

第七条  合同期限与终止

7.1 本合同自签署之日起生效，有效期为一年。
7.2 双方可提前三十日书面通知对方解除合同。
7.3 委托人提供虚假信息的，居间人有权立即解除合同。
7.4 合同终止不影响已产生权利义务及保密、争议解决条款的效力。

第八条  争议解决

8.1 双方应首先通过友好协商解决争议。
8.2 协商不成的，任何一方可向居间人所在地有管辖权的人民法院提起诉讼。
8.3 争议解决期间，双方应继续履行无争议的条款。

第九条  其他

9.1 本合同自委托人在线确认同意或双方签署纸质/电子版本之日起生效。
9.2 任何修改、补充须以书面形式作出，并经双方确认。
9.3 部分条款无效不影响其他条款的效力。
9.4 本合同电子文本与纸质合同具有同等法律效力。
${signInfo}`
  }
})
