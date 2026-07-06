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

  const insertCase = db.prepare('INSERT INTO success_cases (id, title, result, desc, sort) VALUES (?, ?, ?, ?, ?)')
  mock.cases.forEach((item, index) => insertCase.run(item.id, item.title, item.result, item.desc, index))

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

  db.exec('PRAGMA foreign_keys = ON')
}

seed()
console.log('Database seed completed')
