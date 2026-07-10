// ===== Mock 数据 =====
// 宁波合作机构
const MOCK_INSTITUTIONS = [
  { id: 1, name: '宁波银行', type: '银行', rating: 4.8, icon: '🏛️', tags: ['信贷', '抵押贷', '信用贷', '小微贷'], desc: '宁波银行成立于1997年，是国内首批A股上市的城市商业银行。深耕宁波本地市场，为企业及个人提供综合金融服务。', products: '经营贷、抵押贷、信用贷、票据贴现', contact: '400-888-0000' },
  { id: 2, name: '鄞州银行', type: '农商行', rating: 4.6, icon: '🏦', tags: ['农户贷', '经营贷', '质押贷'], desc: '鄞州银行是宁波地区重要的农村商业银行，服务覆盖城乡，以灵活审批、快速放款著称。', products: '农户贷、商户贷、税银通、质押贷', contact: '400-888-0001' },
  { id: 3, name: '平安普惠宁波分公司', type: '助融机构', rating: 4.5, icon: '💼', tags: ['信用贷', '抵押贷', '车抵贷'], desc: '平安普惠是中国平安旗下融资服务机构，在宁波设有多家门店，提供无抵押信用贷款及抵押贷款服务。', products: '宅e贷、车主贷、薪金贷、优房贷', contact: '400-888-0002' },
  { id: 4, name: '甬城融服', type: '助融平台', rating: 4.4, icon: '🤝', tags: ['政银担', '应急贷', '创业贷'], desc: '甬城融服是宁波市金融办指导下的综合融资服务平台，联合多家银行及担保机构为中小微企业提供融资服务。', products: '政银担、应急转贷、创业担保贷、科信贷', contact: '400-888-0003' },
  { id: 5, name: '民生银行宁波分行', type: '银行', rating: 4.3, icon: '🏛️', tags: ['信用贷', '抵押贷', '供应链金融'], desc: '民生银行宁波分行自2002年成立以来，致力于为宁波地区企业提供创新金融产品和优质服务。', products: '微贷、快贷、供应链金融、票据业务', contact: '400-888-0004' },
  { id: 6, name: '宁波通商银行', type: '银行', rating: 4.2, icon: '🏛️', tags: ['科技贷', '贸易贷', '政采贷'], desc: '宁波通商银行专注于商贸金融和科技金融，为宁波地区进出口企业和科技型中小企业提供特色融资服务。', products: '商贸贷、科技贷、政采贷、退税贷', contact: '400-888-0005' }
]

// 撮合指南
const MOCK_GUIDES = [
  { id: 'g1', question: '如何发布需求？', answer: '点击页面下方「发布需求」表单，选择需求类型（找资金/供资金），填写金额、期限、联系方式等基本信息后提交即可。提交后系统会为您智能匹配适合的机构或方案。' },
  { id: 'g2', question: '如何匹配方案？', answer: '发布需求后，系统会根据您的金额、用途、城市等信息，自动匹配合作机构的产品方案。您可以在「需求大厅」中查看匹配进度，也可以联系我们的融资顾问获取定制方案。' },
  { id: 'g3', question: '需要哪些材料？', answer: '一般需要：①身份证件 ②营业执照（企业） ③近6个月银行流水 ④资产证明（房产证、车辆登记证等） ⑤征信报告。具体材料根据产品类型有所差异，顾问会一对一指导。' },
  { id: 'g4', question: '融资周期多长？', answer: '信用类贷款一般 1-3 个工作日放款；抵押类贷款 5-15 个工作日；企业类贷款 3-10 个工作日。具体取决于材料准备和审批进度，我们的顾问会全程跟进。' },
  { id: 'g5', question: '如何收费？', answer: '亮叶企服提供的撮合服务不向需求方收取前期费用。成功放款后，按约定收取一定比例的居间服务费（具体以协议为准）。所有费用在签约前明确告知，绝无隐藏收费。' },
  { id: 'g6', question: '融圈动态是什么？', answer: '融圈动态是亮叶企服用户和融资顾问分享融资经验、机构信息、市场动态的社区板块。您可以浏览他人的分享，也可以发布自己的融资心得和经验。' }
]

// 机构供给
const MOCK_SUPPLY = [
  { id: 's1', institution: '宁波银行', product: '宁易贷', tag: '经营贷', amountRange: '10-300万', rate: '3.8%起', period: '1-3年', desc: '面向小微企业主和个人经营者的信用贷款产品，无需抵押，审批快速，随借随还。', requirements: '①营业执照满1年 ②年流水50万以上 ③征信良好 ④年龄22-55周岁' },
  { id: 's2', institution: '平安普惠', product: '宅e贷', tag: '抵押贷', amountRange: '20-1000万', rate: '4.2%起', period: '1-10年', desc: '以房产为抵押的综合消费贷款，额度高、期限长、还款方式灵活，支持等额本息和先息后本。', requirements: '①宁波有全款或按揭房产 ②房产评估值50万以上 ③征信良好 ④年龄25-60周岁' },
  { id: 's3', institution: '鄞州银行', product: '税银通', tag: '信用贷', amountRange: '5-200万', rate: '4.0%起', period: '1-2年', desc: '基于企业纳税记录的纯信用贷款，与税务系统直连，一键授权即可预审额度，最快当天放款。', requirements: '①企业纳税满2年 ②纳税评级B级以上 ③年纳税额1万以上 ④企业及法人征信良好' },
  { id: 's4', institution: '甬城融服', product: '政银担', tag: '担保贷', amountRange: '10-500万', rate: '3.5%起', period: '1-3年', desc: '政府、银行、担保公司三方合作产品，政府提供风险补偿，降低企业融资门槛和成本。', requirements: '①在宁波注册的中小微企业 ②符合产业政策 ③无重大不良信用记录 ④提供基本经营资料' },
  { id: 's5', institution: '民生银行', product: '快捷贷', tag: '信用贷', amountRange: '5-100万', rate: '4.5%起', period: '6个月-2年', desc: '全线上操作的信用贷款产品，无需纸质材料，手机银行即可申请，系统自动审批。', requirements: '①民生银行账户流水良好 ②住房公积金/社保正常缴纳 ③征信良好 ④年龄23-55周岁' },
  { id: 's6', institution: '通商银行', product: '科技贷', tag: '信用贷', amountRange: '20-500万', rate: '3.9%起', period: '1-3年', desc: '面向科技型中小企业的专属贷款产品，支持知识产权质押、股权质押等灵活担保方式。', requirements: '①科技型中小企业认定 ②经营满2年 ③有自主知识产权或核心技术 ④法人及实际控制人征信良好' }
]

// 融圈动态
const MOCK_FEED_POSTS = [
  { id: 'f1', avatar: '', user: '李明Ningbo', time: '2小时前', content: '刚通过亮叶企服在宁波银行办了一笔经营贷，50万额度，3.8%的利率，从申请到放款只用了3天！客服全程陪同，体验非常好。', images: [], likes: 12, liked: false, commentCount: 3, commentList: [{ id: 'c1', user: '张先生', content: '请问需要什么条件？' }, { id: 'c2', user: '小王在宁波', content: '我也在考虑办理，求攻略！' }, { id: 'c3', user: '李明Ningbo', content: '回复张先生：主要看营业执照和流水，没有抵押' }] },
  { id: 'f2', avatar: '', user: '企业助融-王经理', time: '昨天', content: '分享一个好消息：甬城融服新推出政银担产品，政府贴息后实际利率低至3.0%！宁波地区中小微企业都可以申请，额度最高500万。有需要的老板欢迎咨询。', images: [], likes: 8, liked: false, commentCount: 1, commentList: [{ id: 'c4', user: '刘总', content: '请问外贸企业可以申请吗？' }] },
  { id: 'f3', avatar: '', user: '小陈的融资笔记', time: '2天前', content: '融资小白必看：在宁波办理经营贷的5个步骤！1.准备材料（身份证+营业执照+流水）2.提交需求3.机构匹配4.面签审核5.放款。不要找中介乱收费，认准亮叶这种正规平台。', images: [], likes: 25, liked: false, commentCount: 5, commentList: [{ id: 'c5', user: '赵会计', content: '补充一点：征信报告也很重要' }, { id: 'c6', user: '小陈的融资笔记', content: '回复赵会计：是的，打人民银行征信报告' }] },
  { id: 'f4', avatar: '', user: '创业小林', time: '3天前', content: '给大家看看我刚提的新车！感谢亮叶的车抵贷服务，20万额度当天到账，手续简单，在家门口就办好了。', images: [], likes: 18, liked: false, commentCount: 2, commentList: [{ id: 'c7', user: '老张', content: '恭喜恭喜！' }, { id: 'c8', user: '创业小林', content: '回复老张：谢谢！' }] },
  { id: 'f5', avatar: '', user: '金融小助手', time: '5天前', content: '📊 本周宁波融资市场简报：①各大银行信用贷利率普遍下调至3.6-4.2%②房产抵押贷额度充足③科创企业贷款政策加码④年底前部分产品免收评估费。需要融资的朋友抓紧年底窗口期！', images: [], likes: 30, liked: false, commentCount: 4, commentList: [{ id: 'c9', user: '老李', content: '利率确实降了不少' }, { id: 'c10', user: '金融小助手', content: '回复老李：是的，年底银行冲量' }] }
]

// 需求大厅
const MOCK_DEMANDS = [
  { id: 'd1', type: 'funding', title: '经营周转需求50万', amount: '50万', period: '1年', city: '宁波', publisher: '张先生', publisherAvatar: '👨‍💼', time: '10分钟前', status: '匹配中', statusClass: 'matched', progress: 30, tags: ['经营周转', '信用贷'], contact: '138****6789', remark: '个体户，主营餐饮，年流水200万，无抵押，希望3天以内到账' },
  { id: 'd2', type: 'loan', title: '提供企业融资方案', amount: '100-500万', period: '1-3年', city: '宁波', publisher: '宁波银行-陈经理', publisherAvatar: '🏛️', time: '30分钟前', status: '可咨询', statusClass: 'pending', progress: 0, tags: ['抵押贷', '经营贷'], contact: '139****1234', remark: '宁波银行企业信贷部，提供经营贷、抵押贷、税银通等多款产品' },
  { id: 'd3', type: 'funding', title: '装修资金需求30万', amount: '30万', period: '2年', city: '杭州', publisher: '刘女士', publisherAvatar: '👩‍💼', time: '1小时前', status: '待审核', statusClass: 'review', progress: 15, tags: ['装修', '信用贷'], contact: '137****5678', remark: '新房装修，已付首付，月收入1.5万，有公积金' },
  { id: 'd4', type: 'funding', title: '设备采购资金80万', amount: '80万', period: '3年', city: '宁波', publisher: '王厂长', publisherAvatar: '👨‍🔧', time: '2小时前', status: '匹配中', statusClass: 'matched', progress: 45, tags: ['设备购置', '抵押贷'], contact: '136****9012', remark: '机械加工厂，年营业额500万，有厂房可抵押，需要新购数控设备' },
  { id: 'd5', type: 'loan', title: '平安普惠-车主贷方案', amount: '5-50万', period: '1-3年', city: '宁波', publisher: '平安普惠-小刘', publisherAvatar: '🚗', time: '3小时前', status: '可咨询', statusClass: 'pending', progress: 0, tags: ['车抵贷', '信用贷'], contact: '135****3456', remark: '名下有车即可申请，不押车不装GPS，最快当天放款' },
  { id: 'd6', type: 'funding', title: '进货周转需求20万', amount: '20万', period: '6个月', city: '宁波', publisher: '赵老板', publisherAvatar: '👨‍💼', time: '5小时前', status: '初审中', statusClass: 'review', progress: 10, tags: ['库存周转', '信用贷'], contact: '134****7890', remark: '超市进货周转，旺季备货，急需20万，月底前能到账最好' }
]

Page({
  data: {
    // 敏感信息显示开关
    sensitiveDisplay: true,
    // 基础信息
    location: { city: '宁波' },
    userName: '亮叶用户',

    // 数据统计
    stats: [
      { label: '今日需求', value: '18' },
      { label: '匹配中', value: '6' },
      { label: '撮合成功', value: '45' },
      { label: '合作机构', value: '20+' }
    ],

    // 模块1：撮合流程
    flowSteps: [
      { title: '发布需求', desc: '填写金额、用途和联系方式' },
      { title: '匹配方案', desc: '按产品和偏好智能筛选' },
      { title: '审核资料', desc: '专员指导、准备材料' },
      { title: '签约放款', desc: '面签合同、资金到账' }
    ],

    // 模块2：合作机构
    institutions: MOCK_INSTITUTIONS,
    institutionDetail: null,

    // 模块3：撮合指南
    guides: MOCK_GUIDES,
    openedGuides: [],

    // 模块4：机构供给
    institutionSupply: MOCK_SUPPLY,
    supplyDetail: null,

    // 模块5：热门用途
    hotPurposes: ['经营周转', '购车', '装修', '教育', '设备购置', '库存周转', '纳税周转', '备货采购', '创业启动', '应急周转'],
    selectedPurpose: '',

    // 模块6：融圈动态
    feedPosts: MOCK_FEED_POSTS,
    showPublish: false,
    publishContent: '',
    publishImages: [],
    commentPostId: null,
    commentInput: '',

    // 模块7：需求大厅
    demands: MOCK_DEMANDS,
    filteredDemands: MOCK_DEMANDS,
    filterType: 'all',
    filterCity: 'all',
    demandCities: ['宁波', '杭州', '全国'],
    demandDetail: null,

    // 折叠状态
    sections: {
      flow: true,
      institutions: true,
      guides: false,
      supply: true,
      purposes: true,
      feed: true,
      demands: true,
      clueForm: false,
      clueList: false
    },

    // 发布需求表单
    demandTypes: [
      { label: '资金需求（找资金）', value: 'funding' },
      { label: '资金提供（供资金）', value: 'loan' }
    ],
    purposes: ['经营周转', '购车消费', '设备购置', '装修升级', '库存周转', '纳税合规周转', '备货采购', '其他合规用途'],
    periods: ['6个月', '1年', '2年', '3年', '5年'],
    newDemand: {
      type: 'funding',
      amount: '',
      period: '1年',
      purpose: '经营周转',
      contact: '',
      city: '宁波',
      remark: ''
    },
    selectedTypeIndex: 0,
    selectedPurposeIndex: 0,
    selectedPeriodIndex: 1,
    submitting: false,

    // 收藏
    favoriteDemands: [],

    // 线索发布
    clueForm: { name: '', phone: '', demandType: '贷款咨询', remark: '' },
    clueTypes: ['贷款咨询', '车辆融资', '企业融资'],
    clueList: []
  },

  /* ===== 生命周期 ===== */
  onLoad() {
    const app = getApp()
    const userInfo = wx.getStorageSync('userInfo') || {}
    const phone = wx.getStorageSync('userPhone') || ''

    this.setData({
      userName: userInfo.nickName || '亮叶用户',
      'newDemand.contact': phone,
      'newDemand.city': getApp().globalData?.location?.city || this.data.location.city,
      favoriteDemands: wx.getStorageSync('favoriteDemands') || [],
      sensitiveDisplay: wx.getStorageSync('sensitiveDisplay') !== false
    })

    this.loadClues()
    this.applyDemandFilter()
  },

  /* ===== 模块折叠/展开 ===== */
  toggleSection(e) {
    const section = e.currentTarget.dataset.section
    this.setData({ [`sections.${section}`]: !this.data.sections[section] })
  },

  /* ===== 模块1：撮合流程 - 纯展示，无需额外交互 ===== */

  /* ===== 模块2：合作机构 ===== */
  showInstitutionDetail(e) {
    const id = Number(e.currentTarget.dataset.id)
    const item = this.data.institutions.find(i => i.id === id)
    if (item) {
      this.setData({ institutionDetail: item })
    }
  },

  closeInstitutionDetail() {
    this.setData({ institutionDetail: null })
  },

  consultInstitution(e) {
    const id = Number(e.currentTarget.dataset.id)
    const item = this.data.institutions.find(i => i.id === id)
    if (item) {
      wx.showModal({
        title: '咨询 ' + (item.name || ''),
        content: '将跳转至客服页面，由专属顾问为您服务\n机构联系方式：' + (item.contact || '暂无'),
        confirmText: '立即咨询',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/subpackages/service/pages/chat/chat' })
          }
        }
      })
    }
  },

  /* ===== 模块3：撮合指南 ===== */
  toggleGuideItem(e) {
    const id = e.currentTarget.dataset.id
    const opened = this.data.openedGuides
    const index = opened.indexOf(id)
    if (index !== -1) {
      opened.splice(index, 1)
    } else {
      opened.push(id)
    }
    this.setData({ openedGuides: opened })
  },

  /* ===== 模块4：机构供给 ===== */
  showSupplyDetail(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.institutionSupply.find(i => i.id === id)
    if (item) {
      this.setData({ supplyDetail: item })
    }
  },

  closeSupplyDetail() {
    this.setData({ supplyDetail: null })
  },

  /* ===== 模块5：热门用途 ===== */
  selectPurpose(e) {
    const purpose = e.currentTarget.dataset.purpose
    const current = this.data.selectedPurpose
    if (current === purpose) {
      this.setData({ selectedPurpose: '', filterType: 'all' })
    } else {
      this.setData({ selectedPurpose: purpose, filterType: 'all' })
      wx.showToast({ title: '已筛选：' + purpose, icon: 'none' })
    }
    this.applyDemandFilter()
  },

  /* ===== 模块6：融圈动态 ===== */
  togglePublish() {
    this.setData({ showPublish: !this.data.showPublish })
  },

  onPublishInput(e) {
    this.setData({ publishContent: e.detail.value })
  },

  choosePublishImage() {
    const remain = 3 - this.data.publishImages.length
    if (remain <= 0) return wx.showToast({ title: '最多 3 张图片', icon: 'none' })
    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      success: (res) => {
        const urls = res.tempFiles.map(f => f.tempFilePath)
        this.setData({ publishImages: [...this.data.publishImages, ...urls].slice(0, 3) })
        wx.showToast({ title: '图片已选择', icon: 'success' })
      }
    })
  },

  submitPublish() {
    const content = this.data.publishContent.trim()
    if (!content) return wx.showToast({ title: '请输入动态内容', icon: 'none' })

    const newPost = {
      id: 'f' + Date.now(),
      avatar: '',
      user: this.data.userName,
      time: '刚刚',
      content: content,
      images: this.data.publishImages,
      likes: 0,
      liked: false,
      commentCount: 0,
      commentList: []
    }

    const feedPosts = [newPost, ...this.data.feedPosts]
    this.setData({
      feedPosts,
      publishContent: '',
      publishImages: [],
      showPublish: false
    })
    wx.showToast({ title: '发布成功', icon: 'success' })
  },

  handleLike(e) {
    const id = e.currentTarget.dataset.id
    const feedPosts = this.data.feedPosts.map(p => {
      if (String(p.id) === String(id)) {
        return { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
      }
      return p
    })
    this.setData({ feedPosts })
  },

  handleShare(e) {
    const id = e.currentTarget.dataset.id
    const post = this.data.feedPosts.find(p => String(p.id) === String(id))
    if (post) {
      wx.showActionSheet({
        itemList: ['复制内容', '分享给好友'],
        success: (res) => {
          if (res.tapIndex === 0) {
            wx.setClipboardData({ data: post.content || '' })
          }
        }
      })
    }
  },

  openComment(e) {
    this.setData({ commentPostId: e.currentTarget.dataset.id, commentInput: '' })
  },

  closeComment() {
    this.setData({ commentPostId: null, commentInput: '' })
  },

  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value })
  },

  submitComment() {
    const content = this.data.commentInput.trim()
    const postId = this.data.commentPostId
    if (!content || !postId) return

    const feedPosts = this.data.feedPosts.map(p => {
      if (String(p.id) === String(postId)) {
        const newComment = {
          id: 'c' + Date.now(),
          user: this.data.userName,
          content: content
        }
        const commentList = [...(p.commentList || []), newComment]
        return { ...p, commentList: commentList, commentCount: commentList.length }
      }
      return p
    })

    this.setData({
      feedPosts,
      commentPostId: null,
      commentInput: ''
    })
    wx.showToast({ title: '评论成功', icon: 'success' })
  },

  previewFeedImage(e) {
    const url = e.detail?.url || e.currentTarget?.dataset?.url
    const urls = e.currentTarget?.dataset?.urls || []
    const allUrls = urls.length ? urls : (url ? [url] : [])
    if (allUrls.length) {
      wx.previewImage({ urls: allUrls, current: url || allUrls[0] })
    }
  },

  navigateToFeedDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/subpackages/social/pages/feedDetail/feedDetail?id=' + (id || '') })
  },

  /* ===== 模块7：需求大厅 ===== */
  switchFilter(e) {
    const filterType = e.currentTarget.dataset.type
    this.setData({ filterType }, () => this.applyDemandFilter())
  },

  switchCity(e) {
    const filterCity = e.currentTarget.dataset.city
    this.setData({ filterCity }, () => this.applyDemandFilter())
  },

  applyDemandFilter() {
    let filtered = this.data.demands
    const { filterType, filterCity, selectedPurpose } = this.data

    if (filterType === 'funding') {
      filtered = filtered.filter(d => d.type === 'funding')
    } else if (filterType === 'loan') {
      filtered = filtered.filter(d => d.type === 'loan')
    } else if (filterType === 'mine') {
      const phone = wx.getStorageSync('userPhone') || ''
      filtered = phone ? filtered.filter(d => (d.contact || '').includes(phone.slice(-4))) : []
    }

    if (filterCity && filterCity !== 'all') {
      filtered = filtered.filter(d => (d.city || '').indexOf(filterCity) !== -1)
    }

    if (selectedPurpose) {
      filtered = filtered.filter(d => (d.tags || []).some(t => t.indexOf(selectedPurpose) !== -1))
    }

    this.setData({ filteredDemands: filtered })
  },

  showDemandDetail(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.demands.find(d => String(d.id) === String(id))
    if (item) {
      this.setData({ demandDetail: item })
    }
  },

  closeDemandDetail() {
    this.setData({ demandDetail: null })
  },

  contactDemand(e) {
    const id = e.currentTarget.dataset.id || e.currentTarget.dataset.contact
    const item = this.data.demands.find(d => String(d.id) === String(id))
    if (item && item.contact) {
      wx.setClipboardData({
        data: item.contact,
        success: () => wx.showToast({ title: '联系方式已复制', icon: 'success' })
      })
    } else if (item) {
      wx.showModal({
        title: '联系发布人',
        content: '可通过客服获取联系方式',
        confirmText: '联系客服',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/subpackages/service/pages/chat/chat' })
          }
        }
      })
    }
  },

  toggleFavoriteDemand(e) {
    const id = e.currentTarget.dataset.id
    let favorites = this.data.favoriteDemands || []
    const idx = favorites.indexOf(id)
    if (idx !== -1) {
      favorites.splice(idx, 1)
      wx.showToast({ title: '已取消收藏', icon: 'none' })
    } else {
      favorites.push(id)
      wx.showToast({ title: '已收藏', icon: 'success' })
    }
    wx.setStorageSync('favoriteDemands', favorites)
    this.setData({ favoriteDemands: favorites })
  },

  copyContact(e) {
    const contact = e.currentTarget.dataset.contact
    if (contact) {
      wx.setClipboardData({
        data: contact,
        success: () => wx.showToast({ title: '已复制', icon: 'success' })
      })
    }
  },

  /* ===== 发布需求 ===== */
  handleSubmit() {
    if (this.data.submitting) return
    const { type, amount, period, contact, purpose, remark } = this.data.newDemand
    if (!amount || !contact) {
      return wx.showToast({ title: '请填写金额和联系方式', icon: 'none' })
    }
    this.setData({ submitting: true })

    const newDemand = {
      id: 'd' + Date.now(),
      type: type || 'funding',
      title: (type === 'funding' ? '寻求' : '提供') + amount + '融资',
      amount: amount,
      period: period || '1年',
      city: this.data.newDemand.city || this.data.location.city || '宁波',
      publisher: this.data.userName,
      publisherAvatar: '👤',
      time: '刚刚',
      status: '初审中',
      statusClass: 'review',
      progress: 10,
      tags: [purpose || '经营周转'],
      contact: contact,
      remark: remark || ''
    }

    const demands = [newDemand, ...this.data.demands]
    const stats = this.data.stats.map(s => {
      if (s.label === '今日需求') return { ...s, value: String(Number(s.value) + 1) }
      if (s.label === '匹配中') return { ...s, value: String(Number(s.value) + 1) }
      return s
    })

    this.setData({
      demands,
      stats,
      newDemand: {
        type: 'funding', amount: '', period: '1年', purpose: '经营周转',
        contact: wx.getStorageSync('userPhone') || '', city: this.data.location.city || '宁波', remark: ''
      },
      selectedTypeIndex: 0,
      selectedPurposeIndex: 0,
      selectedPeriodIndex: 1,
      submitting: false
    }, () => this.applyDemandFilter())

    wx.showModal({
      title: '需求发布成功',
      content: '是否立即提交经营贷进件？系统将自动带入金额、用途与联系方式。',
      confirmText: '去进件',
      cancelText: '稍后',
      success: (res) => {
        if (res.confirm) {
          this.goIntake()
        }
      }
    })
  },

  handleInputChange(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ ['newDemand.' + field]: e.detail.value })
  },

  handleTypeChange(e) {
    const index = Number(e.detail.value)
    this.setData({
      selectedTypeIndex: index,
      'newDemand.type': this.data.demandTypes[index].value
    })
  },

  handlePurposeChange(e) {
    const index = Number(e.detail.value)
    this.setData({
      selectedPurposeIndex: index,
      'newDemand.purpose': this.data.purposes[index]
    })
  },

  handlePeriodChange(e) {
    const index = Number(e.detail.value)
    this.setData({
      selectedPeriodIndex: index,
      'newDemand.period': this.data.periods[index]
    })
  },

  /* ===== 位置选择 ===== */
  handleChooseCity() {
    const cities = ['宁波', '杭州', '温州', '绍兴', '台州', '舟山', '全国']
    wx.showActionSheet({
      itemList: cities,
      success: (res) => {
        if (res.tapIndex !== undefined) {
          const city = cities[res.tapIndex]
          this.setData({
            location: { city },
            'newDemand.city': city
          })
        }
      }
    })
  },

  /* ===== 快捷入口导航 ===== */
  navigateToChannel() {
    wx.navigateTo({ url: '/subpackages/channel/pages/list/list' })
  },

  navigateToServiceChat() {
    wx.navigateTo({ url: '/subpackages/service/pages/chat/chat' })
  },

  goIntake() {
    wx.navigateTo({ url: '/subpackages/intake/pages/index/index' })
  },

  /* ===== 工具函数 ===== */
  noop() {},

  /** 手机号脱敏 */
  maskPhone(phone) {
    if (!phone) return ''
    if (phone.length < 7) return phone
    return phone.slice(0, 3) + '****' + phone.slice(-4)
  },

  /** 金额脱敏 */
  maskAmount(amount) {
    if (!amount) return amount
    return '****'
  },

  /** 切换敏感信息显示 */
  toggleSensitiveDisplay() {
    const val = !this.data.sensitiveDisplay
    wx.setStorageSync('sensitiveDisplay', val)
    this.setData({ sensitiveDisplay: val })
    wx.showToast({
      title: val ? '敏感信息已显示' : '敏感信息已隐藏',
      icon: 'none'
    })
  },

  /* ===== 线索发布 ===== */
  loadClues() {
    const list = wx.getStorageSync('financeClues') || []
    this.setData({ clueList: list })
  },

  saveClues(list) {
    wx.setStorageSync('financeClues', list)
    this.setData({ clueList: list })
  },

  toggleClueForm() {
    this.setData({
      'sections.clueForm': !this.data.sections.clueForm,
      'sections.clueList': false,
      clueForm: { name: '', phone: '', demandType: '贷款咨询', remark: '' }
    })
  },

  toggleClueList() {
    this.setData({ 'sections.clueList': !this.data.sections.clueList, 'sections.clueForm': false })
    this.loadClues()
  },

  onClueInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ ['clueForm.' + field]: e.detail.value })
  },

  onClueTypeChange(e) {
    const index = Number(e.detail.value)
    this.setData({ 'clueForm.demandType': this.data.clueTypes[index] })
  },

  submitClue() {
    const { name, phone, demandType, remark } = this.data.clueForm
    if (!name.trim()) return wx.showToast({ title: '请输入姓名', icon: 'none' })
    if (!phone.trim() || !/^1\d{10}$/.test(phone.trim())) {
      return wx.showToast({ title: '请输入有效手机号', icon: 'none' })
    }

    const clue = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      phone: phone.trim(),
      demandType: demandType,
      remark: remark.trim(),
      status: '待跟进',
      statusClass: 'pending',
      createTime: new Date().toLocaleString('zh-CN', { hour12: false })
    }

    const list = [clue, ...(wx.getStorageSync('financeClues') || [])]
    this.saveClues(list)

    wx.showToast({ title: '线索提交成功', icon: 'success' })
    this.setData({
      'sections.clueForm': false,
      clueForm: { name: '', phone: '', demandType: '贷款咨询', remark: '' }
    })
  }
})
