const bcrypt = require('bcryptjs')
const db = require('./index')
const mock = require('../../../../api/mock')

function clearTable(name) {
  db.prepare(`DELETE FROM ${name}`).run()
}

function seed() {
  db.exec('PRAGMA foreign_keys = OFF');
  [
    'product_tags',
    'finance_applications',
    'exposure_reports',
    'clues',
    'demands',
    'exposures',
    'articles',
    'products',
    'success_cases',
    'service_scenes',
    'site_stats',
    'banners',
    'users',
    'admin_users',
    'system_settings',
    'data_sources',
    'public_data_cache',
    'analytics_snapshots',
    'notifications',
    'service_messages',
    'service_sessions',
    'intake_workflow_events',
    'intake_documents',
    'intake_applications'
  ].forEach(clearTable)

  const adminHash = bcrypt.hashSync('admin123', 10)
  db.prepare('INSERT INTO admin_users (username, password_hash, name, role) VALUES (?, ?, ?, ?)').run('admin', adminHash, '超级管理员', 'super_admin')
  db.prepare('INSERT INTO users (phone, password_hash, nickname, is_verified) VALUES (?, ?, ?, ?)').run('13800000000', bcrypt.hashSync('123456', 10), '亮叶演示用户', 1)

  const insertBanner = db.prepare('INSERT INTO banners (id, title, desc, img, link, sort) VALUES (?, ?, ?, ?, ?, ?)')
  mock.banners.forEach((item, index) => insertBanner.run(item.id, item.title, item.desc, item.img, item.link, index))

  const insertStat = db.prepare('INSERT INTO site_stats (label, value, sort) VALUES (?, ?, ?)')
  mock.stats.forEach((item, index) => insertStat.run(item.label, item.value, index))

  const insertScene = db.prepare('INSERT INTO service_scenes (scene_id, title, desc, icon, path, sort) VALUES (?, ?, ?, ?, ?, ?)')
  mock.serviceScenes.forEach((item, index) => insertScene.run(item.id, item.title, item.desc, item.icon, item.path, index))

  const insertCase = db.prepare('INSERT INTO success_cases (id, title, result, desc, cover, detail, sort) VALUES (?, ?, ?, ?, ?, ?, ?)')
  mock.cases.forEach((item, index) => {
    const detailMap = {
      1: { client: '鄞州某连锁餐饮', industry: '餐饮', city: '宁波市鄞州区', duration: '3天', amount: '80万元', institution: '宁波银行容易贷', challenge: '门店扩张需备货资金，但材料分散在多家门店，重复提交效率低。', solution: '亮叶专员统一整理近12个月流水、租赁合同与纳税记录，通过容易贷线上授权测额，3个工作日内完成预审反馈。', outcome: '客户获得80万经营周转额度意向，减少2轮材料补交。', timeline: ['Day1 需求对接与材料清单', 'Day2 纳税数据授权与流水整理', 'Day3 预审反馈与方案确认'], relatedPath: '/subpackages/product/pages/detail/detail?id=11', cover: '/subpackages/cases/images/cases/case-1.webp', tag: '企业经营' },
      2: { client: '宁波某新能源经销商', industry: '汽车零售', city: '宁波市', duration: '5天', amount: '200万元', institution: '建行+宁波银行组合', challenge: '库存车辆占用大量资金，回款周期与厂家结算节奏不匹配。', solution: '结合车辆清单、销售合同与历史回款数据，设计短期库存周转方案，匹配建行营运车辆融资与银行承兑组合。', outcome: '获得200万周转额度意向，缓解2个月库存资金压力。', timeline: ['Day1 库存清单梳理', 'Day2-3 机构方案比选', 'Day4-5 材料提交与预审'], relatedPath: '/subpackages/autoFinance/pages/list/list', cover: '/subpackages/cases/images/cases/case-2.webp', tag: '汽车金融' },
      3: { client: '北仑某物流企业', industry: '物流', city: '宁波市北仑区', duration: '1天', amount: '评估价28万', institution: '平安银行车主贷', challenge: '企业临时周转，需快速了解不押车方案与综合成本。', solution: '当日完成车辆权属核验与评估价参考，明确GPS安装、保险要求与还款安排，提交车抵进件预审。', outcome: '当日获得评估反馈，客户明确综合成本后决定是否继续办理。', timeline: ['上午 车辆材料核验', '下午 评估价反馈与方案说明'], relatedPath: '/subpackages/autoFinance/pages/carMortgage/carMortgage', cover: '/subpackages/cases/images/cases/case-3.webp', tag: '车抵服务' },
      4: { client: '鄞州某商贸企业', industry: '批发零售', city: '宁波市鄞州区', duration: '7天', amount: '500万元', institution: '工商银行e抵快贷', challenge: '大额经营周转，需住宅抵押，材料涉及多人共有人。', solution: '整理房产证、婚姻证明、经营流水与用途说明，对接工行宁波市分行e抵快贷，协调共有人签署材料。', outcome: '7个工作日内完成评估与初审，获得500万额度意向。', timeline: ['Day1-2 产权材料整理', 'Day3-4 房产评估', 'Day5-7 机构初审'], relatedPath: '/subpackages/product/pages/detail/detail?id=17', cover: '/subpackages/cases/images/cases/case-4.webp', tag: '抵押经营' },
      5: { client: '江北某事业单位员工', industry: '公共服务', city: '宁波市江北区', duration: '2天', amount: '50万元', institution: '宁波银行白领通', challenge: '装修资金需求，不了解公积金客户可匹配的产品路径。', solution: '根据公积金连续缴存记录与收入证明，匹配宁波银行白领通消费贷，明确用途合规要求。', outcome: '2天内完成方案说明与材料清单，客户按清单准备后提交机构审核。', timeline: ['Day1 资质评估', 'Day2 方案与材料清单'], relatedPath: '/subpackages/product/pages/detail/detail?id=14', cover: '/subpackages/cases/images/cases/case-5.webp', tag: '消费信贷' },
      6: { client: '慈溪某制造企业', industry: '制造业', city: '宁波市慈溪市', duration: '4天', amount: '按团购规模', institution: '工行+延保服务商', challenge: '50名员工团购新能源，需同时办理车贷与三电延保，流程繁琐。', solution: '批量收集员工材料，统一对接工行汽车分期与延保套餐，进件系统批量填报减少重复录入。', outcome: '4天内完成首批20名员工材料预审与延保套餐选择。', timeline: ['Day1 团购方案说明', 'Day2-3 批量进件', 'Day4 延保套餐确认'], relatedPath: '/subpackages/autoFinance/pages/warranty/warranty?type=ev', cover: '/subpackages/cases/images/cases/case-6.webp', tag: '团购服务' }
    }
    const detail = detailMap[item.id] || {}
    insertCase.run(item.id, item.title, item.result, item.desc, detail.cover || '', JSON.stringify(detail), index)
  })

  const insertProduct = db.prepare('INSERT INTO products (id, category, name, rate, desc, amount, term, suitable, path, cover, compliance_note, source_name, source_url, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  const insertTag = db.prepare('INSERT INTO product_tags (product_id, tag) VALUES (?, ?)')
  mock.products.forEach((item, index) => {
    insertProduct.run(item.id, item.category, item.name, item.rate, item.desc, item.amount, item.term, item.suitable, item.path, item.cover || `/subpackages/product/images/products/product-${item.id}.webp`, item.complianceNote || '本平台仅提供金融信息咨询与居间撮合服务，具体产品条件以持牌机构审核结果和正式合同为准。', item.sourceName || '亮叶企服产品库', item.sourceUrl || 'https://data.stats.gov.cn/', index)
    ;(item.tags || []).forEach(tag => insertTag.run(item.id, tag))
  })

  const insertArticle = db.prepare('INSERT INTO articles (id, type, category, title, summary, content, cover, source, level, risk_level, views, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  const contentText = item => `${item.summary || item.content || item.title}\n\n亮叶企服围绕业务场景整理要点、材料和风险提示，帮助用户在申请前形成清晰判断。`
  mock.news.forEach(item => insertArticle.run(item.id, 'news', item.category, item.title, item.summary, contentText(item), item.cover, item.source, null, null, item.views || 0, item.date))
  mock.knowledge.forEach(item => insertArticle.run(item.id + 1000, 'knowledge', item.category, item.title, item.summary, contentText(item), null, '亮叶研究院', item.level, null, item.views || 0, item.date))
  mock.tips.forEach(item => insertArticle.run(item.id + 2000, 'tips', item.category, item.title, item.summary, contentText(item), null, '亮叶风控', item.levelText, item.level, item.views || 0, item.date))

  const insertExposure = db.prepare('INSERT INTO exposures (id, type, title, content, report_count, status, status_color, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
  mock.exposures.forEach(item => insertExposure.run(item.id, item.type, item.title, item.content, Number(String(item.count).replace(/\D/g, '')) || 0, item.status, item.statusColor, item.date))

  const insertDemand = db.prepare('INSERT INTO demands (id, type, title, amount, period, contact, status, progress) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
  mock.demands.forEach(item => insertDemand.run(item.id, item.type, item.title, item.amount, item.period, item.contact, item.status, item.progress))

  const insertClue = db.prepare('INSERT INTO clues (id, type, title, price, location, province, city, district, dealer, contact, description, tags, source, external_id, raw_payload, verified_status, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  mock.clues.forEach(item => insertClue.run(item.id, item.type, item.title, item.price, item.location, item.province || '浙江省', item.city || '宁波市', item.district || '', item.dealer, item.contact, item.description, JSON.stringify(item.tags || []), item.source || 'official-form', item.externalId || `mock-${item.id}`, JSON.stringify(item), 'approved', item.status))

  const insertSetting = db.prepare('INSERT INTO system_settings (key, value) VALUES (?, ?)')
  insertSetting.run('service_phone', '4008887777')
  insertSetting.run('sms_mock_code', '123456')
  insertSetting.run('brand_name', '亮叶企服')

  const insertSource = db.prepare("INSERT INTO data_sources (id, name, type, source_url, description, last_sync_at) VALUES (?, ?, ?, ?, ?, datetime('now'))")
  insertSource.run(1, '国家统计局国家数据', 'public-statistics', 'https://data.stats.gov.cn/', '分省月度、季度、年度宏观统计数据入口')
  insertSource.run(2, '天地图公开行政区划服务', 'public-map', 'https://lbs.tianditu.gov.cn/', '行政区划、地名检索与统计搜索服务')
  insertSource.run(3, '亮叶企服审核线索池', 'verified-business', 'local-admin', '后台审核通过的业务线索与服务数据')

  const insertSnapshot = db.prepare('INSERT INTO analytics_snapshots (province, city, metric_key, metric_label, metric_value, source_name, source_url) VALUES (?, ?, ?, ?, ?, ?, ?)')
  ;[
    ['浙江省', '宁波市', 'clues', '线索数量', 36, '亮叶企服审核线索池', 'local-admin'],
    ['浙江省', '杭州市', 'demands', '需求数量', 28, '亮叶企服审核线索池', 'local-admin'],
    ['浙江省', '绍兴市', 'applications', '申请数量', 16, '亮叶企服审核线索池', 'local-admin'],
    ['江苏省', '南京市', 'clues', '线索数量', 12, '亮叶企服审核线索池', 'local-admin'],
    ['上海市', '上海市', 'demands', '需求数量', 18, '亮叶企服审核线索池', 'local-admin']
  ].forEach(row => insertSnapshot.run(...row))

  const insertNotification = db.prepare('INSERT INTO notifications (user_id, title, content, type, link) VALUES (?, ?, ?, ?, ?)')
  insertNotification.run(1, '需求匹配进度更新', '您发布的经营周转需求已进入方案匹配阶段，请补充近6个月经营流水。', 'demand', '/pages/financeCircle/financeCircle')
  insertNotification.run(1, '线索跟进提醒', '新能源SUV首购客户线索将在今日16:00前完成回访。', 'clue', '/subpackages/clue/pages/list/list')
  insertNotification.run(1, '合规服务提示', '平台仅提供信息咨询与撮合服务，请勿向个人账户支付任何前置费用。', 'risk', '/subpackages/tips/pages/list/list')

  const samplePayload = {
    meta: {
      applicationNo: 'LY20260703000001',
      productType: 'newCar',
      productName: '新能源车购车咨询',
      status: 'auditing',
      progress: 72,
      submittedAt: new Date().toISOString()
    },
    basic: { applyCity: '宁波市', loanPurpose: '购车消费', expectedAmount: '20万', expectedTerm: '36期' },
    personal: { realName: '演示用户', idCard: '330212199001011234', mobile: '13800000000', address: '浙江省宁波市鄞州区' },
    vehicle: { brand: '比亚迪', model: '宋PLUS DM-i', purchasePrice: '18.8万' },
    finance: { downPayment: '5万', loanAmount: '13.8万', loanTerm: '36' },
    workflow: {
      audit: { status: 'processing', operator: '亮叶审核专员', remark: '材料已提交，正在进行合规初审' },
      disburse: { status: 'locked', remark: '审批通过后安排放款' },
      archive: { status: 'locked', remark: '放款完成后自动归档' },
      collection: { status: 'locked', remark: '正常还款无需催收介入' }
    }
  }
  db.prepare(`
    INSERT INTO intake_applications (
      application_no, user_id, product_type, product_name, status, progress, payload, workflow, submitted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    samplePayload.meta.applicationNo,
    1,
    samplePayload.meta.productType,
    samplePayload.meta.productName,
    samplePayload.meta.status,
    samplePayload.meta.progress,
    JSON.stringify(samplePayload),
    JSON.stringify(samplePayload.workflow),
    samplePayload.meta.submittedAt
  )

  const insertStaff = db.prepare('INSERT INTO sales_staff (name, phone, region, department, role, status) VALUES (?, ?, ?, ?, ?, ?)')
  ;[
    ['陈顾问', '13800008801', '宁波市', '延保业务部', 'advisor', 'active'],
    ['周专员', '13700006602', '宁波市', '汽车金融部', 'advisor', 'active'],
    ['王经理', '13600005503', '杭州市', '企业贷业务部', 'manager', 'active']
  ].forEach(row => insertStaff.run(...row))

  const extras = mock.financeCircleExtras || {}
  const insertPost = db.prepare('INSERT INTO finance_circle_posts (user_name, avatar, content, images, likes, post_type, intake_product, intake_product_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
  ;(extras.feedPosts || []).forEach(p => {
    insertPost.run(
      p.user, p.avatar || '/images/avatar.webp', p.content, JSON.stringify(p.images || []),
      p.likes || 0, p.type || 'feed', p.intakeProduct || '', p.intakeProductName || ''
    )
  })

  const { setTrialVersionMeta } = require('../services/trial-version.service')
  setTrialVersionMeta({
    version: '1.0.0',
    desc: '亮叶企服体验版（种子数据）',
    updatedAt: new Date().toISOString()
  })

  // --- 系统配置种子数据 ---
  const insertConfig = db.prepare('INSERT OR IGNORE INTO config_settings (category, key, value, description) VALUES (?, ?, ?, ?)')
  ;[
    ['general', 'service_phone', '400-888-7777', '客服热线'],
    ['general', 'brand_name', '亮叶企服', '品牌名称'],
    ['general', 'company_address', '浙江省宁波市鄞州区南部商务区', '公司地址'],
    ['general', 'working_hours', '周一至周五 9:00-18:00', '工作时间'],
    ['email', 'smtp_host', '', 'SMTP 服务器地址'],
    ['email', 'smtp_port', '465', 'SMTP 端口'],
    ['email', 'admin_email', 'admin@liangyeqf.com', '管理员邮箱'],
    ['risk', 'max_loan_amount', '500000', '最大贷款金额（元）'],
    ['risk', 'min_credit_score', '600', '最低信用分'],
    ['risk', 'require_guarantor', 'true', '大额贷款是否需要担保人'],
    ['display', 'home_banner_interval', '5000', '首页轮播切换间隔（ms）'],
    ['display', 'products_per_page', '20', '产品列表每页数量']
  ].forEach(row => insertConfig.run(...row))

  // --- 初始审计日志 ---
  const insertAudit = db.prepare("INSERT INTO audit_logs (admin_id, admin_name, action, resource_type, detail) VALUES (?, ?, ?, ?, ?)")
  insertAudit.run(1, '超级管理员', 'login', 'system', '数据库初始化默认登录')

  // --- RBAC 初始化 ---
  const { initRbac } = require('../services/rbac.service')
  initRbac()

  // --- 举报示例数据 ---
  const insertReport = db.prepare('INSERT INTO exposure_reports (type, title, content, contact, evidence, user_id, status, admin_note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
  insertReport.run('诈骗', '假冒贷款平台诈骗', '声称无抵押快速放款，要求先交2000元手续费', '张先生 13900001111', '', 1, 'pending', '', "datetime('now', '-2 days')")
  insertReport.run('虚假信息', '产品利率与实际不符', '宣传利率3.6%，实际申请时被告知利率8.5%', '李女士 13800002222', '', 1, 'pending', '', "datetime('now', '-1 days')")
  insertReport.run('骚扰', '频繁电话推销', '一天打5次电话推销贷款产品，已明确表示不需要', '王先生 13700003333', '', 1, 'confirmed', '已核实，标记该号码为骚扰电话', "datetime('now', '-5 days')")
  insertReport.run('其他', '个人信息疑似泄露', '从未注册过的平台知道我手机号和姓名', '陈女士 13600004444', '', 1, 'dismissed', '经核查无证据证明信息泄露', "datetime('now', '-7 days')")

  db.exec('PRAGMA foreign_keys = ON')
}

seed()
console.log('Database seed completed')
