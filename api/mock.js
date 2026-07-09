const catalog = require('../data/ningbo-catalog')

const banners = [
  { id: 1, img: '/images/banner1.webp', title: '新能源汽车金融服务升级', desc: '新车、二手车、车抵贷一站式方案', link: '/subpackages/banner/pages/detail/detail?id=1' },
  { id: 2, img: '/images/banner2.webp', title: '专精特新企业融资计划', desc: '围绕企业现金流与成长周期定制资金方案', link: '/subpackages/banner/pages/detail/detail?id=2' }
]

const stats = [
  { label: '合作机构', value: '36+' },
  { label: '产品方案', value: '80+' },
  { label: '平均响应', value: '30分钟' },
  { label: '服务城市', value: '浙江' }
]

const serviceScenes = [
  { id: 'auto', title: '汽车融资', desc: '新车按揭、二手车按揭、车抵贷', icon: '🚗', path: '/subpackages/autoFinance/pages/list/list' },
  { id: 'business', title: '企业周转', desc: '宁波银行·农行·建行小微贷', icon: '🏦', path: '/pages/products/products?category=business' },
  { id: 'risk', title: '风险防范', desc: '避坑指南、曝光案例、合规提醒', icon: '💡', path: '/subpackages/tips/pages/list/list' },
  { id: 'knowledge', title: '融资课堂', desc: '政策解读、流程说明、成本测算', icon: '📖', path: '/subpackages/knowledge/pages/list/list' }
]

const baseProducts = [
  { id: 1, category: 'auto', intakeType: 'newCar', institution: '亮叶企服撮合', region: '宁波市', name: '新能源车购车咨询方案', rate: '机构审核定价', desc: '围绕首付比例、月供压力、车辆发票和保险材料提供方案匹配', tags: ['汽车金融', '材料预审'], amount: '5-50万', term: '12-60期', suitable: '新车购置、置换升级', cover: '/subpackages/product/images/products/product-1.webp', complianceNote: '平台仅提供信息咨询和撮合服务，具体审批、额度、费用以持牌机构最终结果为准。', sourceName: '亮叶企服产品库', sourceUrl: 'https://data.stats.gov.cn/', path: '/subpackages/autoFinance/pages/newCar/newCar' },
  { id: 2, category: 'auto', intakeType: 'usedCar', institution: '亮叶企服撮合', region: '宁波市', name: '二手车按揭咨询方案', rate: '机构审核定价', desc: '结合车龄、车况、交易合同和征信资料协助匹配二手车金融服务', tags: ['二手车', '车商合作'], amount: '3-30万', term: '12-36期', suitable: '二手车购置与置换', cover: '/subpackages/product/images/products/product-2.webp', complianceNote: '车辆评估和费用由合作机构独立审核确认。', sourceName: '亮叶企服产品库', sourceUrl: 'https://data.stats.gov.cn/', path: '/subpackages/autoFinance/pages/usedCar/usedCar' },
  { id: 3, category: 'auto', intakeType: 'mortgage', institution: '亮叶企服撮合', region: '宁波市', name: '车辆抵押咨询方案', rate: '机构审核定价', desc: '梳理车辆权属、评估价、保险、用途证明和还款安排', tags: ['车抵咨询', '周转'], amount: '5-50万', term: '6-36期', suitable: '短期资金周转信息撮合', cover: '/subpackages/product/images/products/product-3.webp', complianceNote: '不承诺放款，不收取任何前置保证金。', sourceName: '亮叶企服产品库', sourceUrl: 'https://data.stats.gov.cn/', path: '/subpackages/autoFinance/pages/carMortgage/carMortgage' },
  { id: 4, category: 'business', intakeType: 'business', institution: '亮叶企服撮合', region: '宁波市', name: '小微企业经营贷信息撮合', rate: '以机构披露为准', desc: '基于税票、流水、经营年限和主体资质整理申请材料，可对接宁波银行、农行、建行等公开小微产品', tags: ['企业贷款', '经营周转', '宁波'], amount: '10-300万', term: '12-36期', suitable: '宁波小微企业经营周转', cover: '/subpackages/product/images/products/product-4.webp', complianceNote: '亮叶企服不发放贷款，仅协助用户了解并对接持牌机构公开服务。', sourceName: '亮叶企服产品库', sourceUrl: 'https://data.stats.gov.cn/', path: '/subpackages/product/pages/detail/detail?id=4' },
  { id: 5, category: 'property', intakeType: 'property', institution: '亮叶企服撮合', region: '宁波市', name: '抵押类经营周转咨询', rate: '以机构披露为准', desc: '协助梳理产权、估值、经营流水、用途证明和还款周期，可对接工行e抵快贷、宁波银行房抵贷等', tags: ['抵押咨询', '材料清单', '宁波'], amount: '50-1000万', term: '1-10年', suitable: '宁波大额经营资金信息咨询', cover: '/subpackages/product/images/products/product-5.webp', complianceNote: '抵押登记、利率和期限由合作机构依法审核确认。', sourceName: '亮叶企服产品库', sourceUrl: 'https://data.stats.gov.cn/', path: '/subpackages/product/pages/detail/detail?id=5' },
  { id: 6, category: 'personal', intakeType: 'personal', institution: '亮叶企服撮合', region: '宁波市', name: '个人消费贷信息咨询', rate: '以机构披露为准', desc: '围绕公积金、社保、收入流水等资料提供申请前评估清单，可对接白领通、工行信用贷等', tags: ['个人贷款', '资料整理', '宁波'], amount: '1-80万', term: '12-60期', suitable: '宁波个人合规消费资金咨询', cover: '/subpackages/product/images/products/product-6.webp', complianceNote: '不得用于违规投资、购房首付或其他监管禁止用途。', sourceName: '亮叶企服产品库', sourceUrl: 'https://data.stats.gov.cn/', path: '/subpackages/product/pages/detail/detail?id=6' },
  { id: 7, category: 'lease', intakeType: 'lease', institution: '亮叶企服撮合', region: '宁波市', name: '设备融资租赁咨询', rate: '以租赁机构披露为准', desc: '适用于生产设备、运营车辆、商用设备等租赁方案咨询，含浙江海港租赁等机构', tags: ['融资租赁', '设备更新', '宁波'], amount: '20-500万', term: '12-48期', suitable: '宁波设备采购与更新', cover: '/subpackages/product/images/products/product-7.webp', complianceNote: '租赁关系、租金和所有权安排以正式租赁合同为准。', sourceName: '亮叶企服产品库', sourceUrl: 'https://data.stats.gov.cn/', path: '/subpackages/product/pages/detail/detail?id=7' },
  { id: 8, category: 'private', intakeType: 'business', institution: '亮叶合规服务中心', region: '宁波市', name: '民间借贷风险识别服务', rate: '风险咨询服务', desc: '识别高息、砍头息、暴力催收、虚假合同和个人收款风险', tags: ['风险防范', '合规提醒'], amount: '按风险事项评估', term: '按事项评估', suitable: '借贷合同审阅与风险提示', cover: '/subpackages/product/images/products/product-8.webp', complianceNote: '本服务仅提供风险识别，不撮合非法民间借贷。', sourceName: '亮叶风控资料库', sourceUrl: 'https://data.stats.gov.cn/', path: '/subpackages/product/pages/detail/detail?id=8' },
  { id: 9, category: 'warranty', intakeType: 'warranty', institution: '亮叶合作延保服务商', region: '宁波市', name: '汽车延保服务咨询', rate: '服务商报价为准', desc: '展示保障范围、免赔规则、合作服务商和预约检测流程，覆盖宁波全市网点', tags: ['汽车延保', '售后服务'], amount: '按车型评估', term: '1-3年', suitable: '宁波车辆售后保障咨询', cover: '/subpackages/product/images/products/product-9.webp', complianceNote: '延保服务由合作服务商提供，保障范围以服务合同为准。', sourceName: '亮叶企服产品库', sourceUrl: 'https://data.stats.gov.cn/', path: '/subpackages/autoFinance/pages/warranty/warranty' },
  { id: 10, category: 'workflow', intakeType: 'workflow', institution: '亮叶企服', region: '宁波市', name: '金融进件材料系统', rate: '系统服务', desc: '覆盖基本信息、个人信息、车辆信息、融资信息、工作收入、资料上传、紧急联系人及审核放款归档催收全流程', tags: ['进件系统', '材料管理', '流程跟踪'], amount: '按服务包配置', term: '按服务包配置', suitable: '客户经理、融资专员与企业用户一站式材料填报与进度管理', cover: '/subpackages/product/images/products/product-10.webp', complianceNote: '系统仅用于材料管理，不代表机构审批结果。', sourceName: '亮叶企服产品库', sourceUrl: 'https://data.stats.gov.cn/', path: '/subpackages/intake/pages/index/index?productType=workflow' }
]

const products = [...baseProducts, ...catalog.extraProducts]

const news = [
  { id: 1, category: '行业新闻', title: '甬江金融新政解读', summary: '小微企业融资新政策要点', date: '2025-07-01', source: '财政部官网', views: 3200, cover: '/subpackages/news/images/news/news-1.webp' },
  { id: 2, category: '避坑常识', title: '融资诈骗识别指南', summary: '常见骗局与防范建议', date: '2025-06-28', source: '金融时报', views: 2800, cover: '/subpackages/news/images/news/news-2.webp' },
  { id: 3, category: '行业知识', title: '企业融资的五大方式', summary: '银行贷款、股权融资、融资租赁等', date: '2025-06-25', source: '亮叶研究院', views: 1950, cover: '/subpackages/news/images/news/news-3.webp' },
  { id: 4, category: '政策分析', title: '绿色金融政策支持方向梳理', summary: '环保节能、新能源及供应链低碳改造获得更多政策支持', date: '2025-06-22', source: '政策观察', views: 1680, cover: '/subpackages/news/images/news/news-4.webp' },
  { id: 5, category: '汽车金融', title: '二手车金融业务审核关注点', summary: '车况、车龄、流水、征信是二手车按揭评估重点', date: '2025-06-19', source: '亮叶研究院', views: 1426, cover: '/subpackages/news/images/news/news-5.webp' },
  { id: 6, category: '服务公告', title: '亮叶企服上线融资材料清单助手', summary: '围绕车贷、经营贷、抵押贷整理常用资料清单', date: '2025-06-16', source: '亮叶企服', views: 1230, cover: '/subpackages/news/images/news/news-6.webp' }
]

const knowledge = [
  { id: 1, title: '企业融资的五大常见方式', category: 'finance', level: '入门', summary: '全面了解银行贷款、股权融资、融资租赁等渠道', date: '2025-06-20', views: 1280, readMinutes: 8, author: '亮叶研究院', cover: '/subpackages/knowledge/images/knowledge/knowledge-1.webp' },
  { id: 2, title: '信用贷款申请全流程解析', category: 'loan', level: '进阶', summary: '从材料准备到放款的全流程指南', date: '2025-06-18', views: 956, readMinutes: 12, author: '亮叶研究院', cover: '/subpackages/knowledge/images/knowledge/knowledge-2.webp' },
  { id: 3, title: '如何评估企业融资成本', category: 'finance', level: '进阶', summary: '综合计算实际融资成本的实用方法', date: '2025-06-15', views: 743, readMinutes: 10, author: '亮叶研究院', cover: '/subpackages/knowledge/images/knowledge/knowledge-3.webp' },
  { id: 4, title: '供应链金融操作实务', category: 'innovation', level: '高级', summary: '产业链融资的操作要点与案例', date: '2025-06-12', views: 621, readMinutes: 15, author: '亮叶研究院', cover: '/subpackages/knowledge/images/knowledge/knowledge-4.webp' },
  { id: 5, title: '绿色金融政策解读', category: 'policy', level: '入门', summary: '2025年绿色金融最新政策梳理', date: '2025-06-10', views: 892, readMinutes: 6, author: '政策观察', cover: '/subpackages/knowledge/images/knowledge/knowledge-5.webp' },
  { id: 6, title: '车抵贷额度如何评估', category: 'loan', level: '进阶', summary: '车辆评估价、车龄、保险与征信共同影响额度', date: '2025-06-08', views: 701, readMinutes: 9, author: '亮叶研究院', cover: '/subpackages/knowledge/images/knowledge/knowledge-6.webp' }
]

const tips = [
  { id: 1, title: '识别非法集资的10个特征', category: '风险防范', level: 'high', levelText: '高风险', summary: '了解非法集资的典型特征，保护您的财产安全', date: '2025-06-20', views: 2340, cover: '/subpackages/tips/images/tips/tips-1.webp' },
  { id: 2, title: '贷款诈骗常见手段及防范', category: '安全警示', level: 'high', levelText: '高风险', summary: '揭秘常见贷款诈骗套路，避免落入陷阱', date: '2025-06-18', views: 1890, cover: '/subpackages/tips/images/tips/tips-2.webp' },
  { id: 3, title: '融资合同中的隐藏条款', category: '法律知识', level: 'medium', levelText: '中风险', summary: '签约前必看的合同条款解读', date: '2025-06-15', views: 1560, cover: '/subpackages/tips/images/tips/tips-3.webp' },
  { id: 4, title: '如何避免高利贷陷阱', category: '风险防范', level: 'high', levelText: '高风险', summary: '识别非法借贷，维护合法权益', date: '2025-06-12', views: 2100, cover: '/subpackages/tips/images/tips/tips-4.webp' },
  { id: 5, title: '企业融资中的税务风险', category: '财税知识', level: 'medium', levelText: '中风险', summary: '融资过程中的税务合规要点', date: '2025-06-10', views: 980, cover: '/subpackages/tips/images/tips/tips-5.webp' },
  { id: 6, title: '提前还款前要算清哪些成本', category: '风险防范', level: 'low', levelText: '低风险', summary: '综合比较剩余利息、违约金、返现与机会成本', date: '2025-06-06', views: 760, cover: '/subpackages/tips/images/tips/tips-6.webp' }
]

const exposures = [
  { id: 'exp_1_1', type: 'fraud', typeName: '诈骗类', title: '虚假低息贷款平台诱导缴纳保证金', content: '用户举报某平台以“秒批低息”为噱头，要求先缴纳保证金后失联。', count: '128人举报', date: '2025-06-15', status: '已核实', statusColor: '#0F3D2E', cover: '/subpackages/exposure/images/exposure/exposure-1.webp', evidence: ['/subpackages/exposure/images/exposure/exposure-1.webp'] },
  { id: 'exp_1_2', type: 'illegal', typeName: '违规类', title: '违规收取服务费且未披露综合成本', content: '部分中介未明确披露服务费、担保费等费用，导致用户实际成本上升。', count: '76人举报', date: '2025-06-12', status: '处理中', statusColor: '#faad14', cover: '/subpackages/exposure/images/exposure/exposure-2.webp', evidence: ['/subpackages/exposure/images/exposure/exposure-2.webp'] },
  { id: 'exp_1_3', type: 'fake', typeName: '虚假类', title: '冒充银行合作方发布虚假额度', content: '不法机构冒用银行名义发布虚假高额度审批广告。', count: '92人举报', date: '2025-06-10', status: '已处理', statusColor: '#52c41a', cover: '/subpackages/exposure/images/exposure/exposure-3.webp', evidence: ['/subpackages/exposure/images/exposure/exposure-3.webp'] },
  { id: 'exp_1_4', type: 'fraud', typeName: '诈骗类', title: '以征信修复为名收取高额费用', content: '宣称可删除征信逾期记录，收款后无法提供任何合法服务。', count: '58人举报', date: '2025-06-08', status: '已核实', statusColor: '#0F3D2E', cover: '/subpackages/exposure/images/exposure/exposure-4.webp', evidence: ['/subpackages/exposure/images/exposure/exposure-4.webp'] }
]

const demands = [
  { id: 1001, type: 'funding', title: '寻求500万房产抵押融资', amount: '500万元', period: '3年', contact: '张经理 138****1234', city: '宁波市', purpose: '经营周转', status: '匹配中', progress: 60, createdAt: '2025-07-01', tags: ['房产抵押', '经营贷'], cover: '/subpackages/cases/images/cases/case-1.webp' },
  { id: 1002, type: 'loan', title: '提供小微企业信用贷', amount: '50-300万元', period: '1-5年', contact: '宁波银行', city: '宁波市', purpose: '机构供给', status: '可咨询', progress: 80, createdAt: '2025-06-28', tags: ['信用贷', '小微'], cover: '/subpackages/cases/images/cases/case-2.webp' },
  { id: 1003, type: 'funding', title: '新能源车商库存融资需求', amount: '200万元', period: '6个月', contact: '陈总 139****6677', city: '杭州市', purpose: '库存周转', status: '待沟通', progress: 35, createdAt: '2025-07-02', tags: ['汽车金融', '库存'] },
  { id: 1004, type: 'loan', title: '小微商户流水贷方案', amount: '20-100万元', period: '1-3年', contact: '合作机构', city: '绍兴市', purpose: '机构供给', status: '可咨询', progress: 75, createdAt: '2025-06-30', tags: ['流水贷', '个体户'] },
  { id: 1005, type: 'funding', title: '餐饮门店装修资金需求', amount: '80万元', period: '2年', contact: '刘老板 137****8899', city: '宁波市', purpose: '装修升级', status: '初审中', progress: 20, createdAt: '2025-07-03', tags: ['消费贷', '餐饮'] },
  ...catalog.extraDemands
]

const cases = [
  { id: 1, title: '餐饮企业经营贷匹配', result: '3天完成预审', desc: '鄞州餐饮老板根据流水与租赁合同匹配宁波银行容易贷方案，减少重复提交材料。', cover: '/subpackages/cases/images/cases/case-1.webp', path: '/subpackages/cases/pages/detail/detail?id=1', tag: '经营贷' },
  { id: 2, title: '车商库存周转方案', result: '额度200万', desc: '宁波新能源车商结合车辆清单与回款周期，设计短期周转额度。', cover: '/subpackages/cases/images/cases/case-2.webp', path: '/subpackages/cases/pages/detail/detail?id=2', tag: '汽车金融' },
  { id: 3, title: '个人车抵周转咨询', result: '当日完成评估', desc: '北仑物流企业不押车方案，提前明确综合成本与还款安排。', cover: '/subpackages/cases/images/cases/case-3.webp', path: '/subpackages/cases/pages/detail/detail?id=3', tag: '车抵咨询' },
  { id: 4, title: '工行e抵快贷方案', result: '额度500万', desc: '鄞州商贸企业以住宅抵押，整理材料后对接工商银行宁波市分行e抵快贷。', cover: '/subpackages/cases/images/cases/case-1.webp', path: '/subpackages/cases/pages/detail/detail?id=4', tag: '抵押贷' },
  { id: 5, title: '白领通消费贷咨询', result: '额度50万', desc: '江北事业单位员工通过公积金缴存记录，匹配宁波银行白领通消费贷。', cover: '/subpackages/cases/images/cases/case-2.webp', path: '/subpackages/cases/pages/detail/detail?id=5', tag: '消费贷' },
  { id: 6, title: '新能源延保+车贷组合', result: '一站式办理', desc: '慈溪制造业员工团购新能源，同步完成车贷进件与三电延保套餐选择。', cover: '/subpackages/cases/images/cases/case-3.webp', path: '/subpackages/cases/pages/detail/detail?id=6', tag: '延保' }
]

const profile = {
  oaStats: [
    { name: '待办事项', count: 6, icon: '📌' },
    { name: '方案跟进', count: 4, icon: '📊' },
    { name: '材料待补', count: 2, icon: '📎' },
    { name: '本周会议', count: 2, icon: '📅' }
  ],
  oaTasks: [
    { id: 1, title: '跟进新能源车融资申请', type: '客户回访', priority: '高', status: '待处理', due: '今日 16:00', desc: '确认首付比例、征信授权和车辆发票信息。', assignee: '王专员' },
    { id: 2, title: '审核房抵经营贷材料', type: '材料审核', priority: '中', status: '进行中', due: '明日 10:00', desc: '核对房产证、经营流水和抵押物估值报告。', assignee: '李审核' },
    { id: 3, title: '易融圈需求方案匹配', type: '方案匹配', priority: '中', status: '待沟通', due: '本周五', desc: '为500万经营周转需求匹配两家合作机构。', assignee: '张经理' },
    { id: 4, title: '延保套餐检测预约', type: '客户服务', priority: '低', status: '待处理', due: '下周一', desc: '协调客户车辆检测与套餐签约时间。', assignee: '陈顾问' }
  ],
  meetings: [
    { id: 1, title: '汽车金融晨会', time: '周二 09:30', place: '线上会议', host: '运营中心', agenda: '复盘昨日进件与线索转化' },
    { id: 2, title: '融资产品周复盘', time: '周四 15:00', place: '宁波办公室', host: '产品部', agenda: '各产品线利率与材料清单更新' },
    { id: 3, title: '合规培训', time: '周五 14:00', place: '线上会议', host: '合规部', agenda: '前置收费风险与投诉处理' }
  ],
  docItems: [
    { id: 'identity', name: '身份资料', icon: '🪪', desc: '身份证、营业执照、法人信息', status: '已归档', count: 6, progress: 100, required: ['身份证正反面', '营业执照', '法人授权书'] },
    { id: 'income', name: '经营流水', icon: '💳', desc: '银行流水、开票、纳税记录', status: '待补充', count: 3, progress: 60, required: ['近6个月流水', '纳税记录', '开票明细'] },
    { id: 'contracts', name: '合同档案', icon: '📄', desc: '融资合同、购车合同、服务协议', status: '审核中', count: 4, progress: 80, required: ['融资合同', '购车合同', '服务协议'] },
    { id: 'videos', name: '验证视频', icon: '🎥', desc: '面签、车辆、经营场所视频', status: '未上传', count: 1, progress: 20, required: ['面签视频', '车辆验车', '经营场所'] },
    { id: 'vehicle', name: '车辆资料', icon: '🚗', desc: '行驶证、发票、评估报告', status: '待补充', count: 2, progress: 45, required: ['行驶证', '购车发票', '评估报告'] },
    { id: 'credit', name: '征信授权', icon: '🔐', desc: '征信查询授权书、授权记录', status: '已归档', count: 2, progress: 100, required: ['征信授权书', '授权签字页'] }
  ],
  settings: [
    { id: 'account', title: '账号安全', desc: '登录密码、手机号、设备管理', enabled: true },
    { id: 'privacy', title: '隐私授权', desc: '位置、相册、用户资料授权状态', enabled: true },
    { id: 'notice', title: '消息通知', desc: '审批、需求、系统公告提醒', enabled: true },
    { id: 'service', title: '客服与协议', desc: '客服电话、隐私政策、服务协议', enabled: true }
  ]
}

const clues = [
  { id: 1, type: 'new', title: '新能源SUV首购客户', price: '18.8万', location: '浙江省宁波市鄞州区', province: '浙江省', city: '宁波市', district: '鄞州区', dealer: '亮叶合作车商A', contact: '李先生 138****8201', description: '客户计划购买新能源SUV，首付预算5万，希望月供压力可控。', tags: ['新车', '材料预审', '待回访'], source: 'official-form', externalId: 'ly-new-001', status: '跟进中', createTime: '2025-07-02' },
  { id: 2, type: 'used', title: '二手商务车置换融资', price: '12.6万', location: '浙江省杭州市萧山区', province: '浙江省', city: '杭州市', district: '萧山区', dealer: '二手车联盟门店', contact: '陈女士 136****5520', description: '现有旧车置换，需评估残值并匹配二手车按揭咨询方案。', tags: ['二手车', '置换', '资料待补'], source: 'dealer-webhook', externalId: 'ly-used-002', status: '材料待补', createTime: '2025-07-01' },
  { id: 3, type: 'mortgage', title: '车抵周转客户线索', price: '评估价28万', location: '浙江省绍兴市越城区', province: '浙江省', city: '绍兴市', district: '越城区', dealer: '线上咨询', contact: '王总 139****1188', description: '企业临时周转，名下车辆可抵押，希望了解不押车信息撮合流程。', tags: ['车抵咨询', '企业周转'], source: 'website-form', externalId: 'ly-mortgage-003', status: '待评估', createTime: '2025-06-30' },
  ...catalog.extraClues
]

const applications = [
  { id: 1, productId: 1, productName: '新能源车专属融资', contact: '张先生 138****1234', status: '已提交', amount: '20万', createdAt: '2025-07-02' },
  { id: 2, productId: 5, productName: '房产抵押周转贷', contact: '宁波某餐饮企业', status: '专员跟进', amount: '500万', createdAt: '2025-07-01' }
]

const notifications = [
  { id: 1, title: '需求匹配进度更新', content: '您的经营周转需求已进入方案匹配阶段，请补充近6个月经营流水。', type: 'demand', status: 'unread', link: '/pages/financeCircle/financeCircle', createdAt: '2025-07-02 09:30' },
  { id: 2, title: '线索跟进提醒', content: '新能源SUV首购客户线索将在今日16:00前完成回访。', type: 'clue', status: 'unread', link: '/subpackages/clue/pages/list/list', createdAt: '2025-07-02 10:10' },
  { id: 3, title: '合规服务提示', content: '请勿向个人账户支付任何前置费用，所有合作服务以正式合同为准。', type: 'risk', status: 'read', link: '/subpackages/tips/pages/list/list', createdAt: '2025-07-01 18:20' },
  { id: 4, title: '进件审核进度', content: '您的经营贷进件材料已提交，专员将在1个工作日内完成初审。', type: 'intake', status: 'unread', link: '/subpackages/intake/pages/status/status', createdAt: '2025-07-02 14:00' },
  { id: 5, title: '系统维护公告', content: '7月3日 02:00-04:00 将进行系统维护，期间部分功能可能短暂不可用。', type: 'system', status: 'read', createdAt: '2025-07-01 20:00' }
]

const serviceFaqs = [
  { q: '亮叶企服是否发放贷款？', a: '不发放贷款。平台定位为金融信息咨询与居间撮合服务，具体审批、额度、费用以持牌机构审核和合同为准。' },
  { q: '是否需要先交保证金？', a: '不建议向个人账户或不明主体支付任何前置费用。如遇“先收费后放款”“包过”等宣传，请保留证据并谨慎处理。' },
  { q: '如何准备企业经营贷材料？', a: '通常需要营业执照、法人身份证明、近6个月流水、纳税或开票记录、用途说明等，具体以机构要求为准。' }
]

const fuelPrices = {
  updatedAt: '2025-06-28 24:00',
  sourceName: '国家发改委成品油价格机制',
  sourceUrl: 'https://www.ndrc.gov.cn/',
  items: [
    { city: '宁波市', province: '浙江省', gasoline92: 7.42, gasoline95: 7.90, diesel0: 7.08 },
    { city: '杭州市', province: '浙江省', gasoline92: 7.45, gasoline95: 7.93, diesel0: 7.11 },
    { city: '绍兴市', province: '浙江省', gasoline92: 7.43, gasoline95: 7.91, diesel0: 7.09 },
    { city: '上海市', province: '上海市', gasoline92: 7.48, gasoline95: 7.96, diesel0: 7.14 }
  ]
}

const carListings = [
  { id: 1, brand: '比亚迪', model: '宋PLUS DM-i 110KM', year: 2024, mileage: '0.8万公里', price: '12.8万', city: '宁波市', province: '浙江省', dealer: '亮叶合作车商A', tags: ['新能源', '准新车', '可按揭'], cover: '/subpackages/cars/images/cars/car-1.webp', desc: '一手车源，支持新车/二手车按揭咨询，材料齐全可当天预审。' },
  { id: 2, brand: '丰田', model: '凯美瑞 2.0G', year: 2021, mileage: '3.2万公里', price: '13.6万', city: '杭州市', province: '浙江省', dealer: '二手车联盟门店', tags: ['家用', '车况优', '可置换'], cover: '/subpackages/cars/images/cars/car-2.webp', desc: '4S店置换车源，支持第三方检测，可按评估价办理二手车按揭咨询。' },
  { id: 3, brand: '特斯拉', model: 'Model 3 后驱版', year: 2023, mileage: '1.5万公里', price: '18.9万', city: '宁波市', province: '浙江省', dealer: '新能源专营门店', tags: ['新能源', '低里程', '可车抵'], cover: '/subpackages/cars/images/cars/car-3.webp', desc: '电池健康报告齐全，支持车抵咨询与置换升级方案匹配。' },
  { id: 4, brand: '大众', model: '帕萨特 330TSI', year: 2020, mileage: '5.6万公里', price: '11.2万', city: '绍兴市', province: '浙江省', dealer: '亮叶合作车商B', tags: ['商务', '可按揭', '本地车源'], cover: '/subpackages/cars/images/cars/car-4.webp', desc: '本地牌照，保养记录完整，可按用途匹配经营贷或消费贷咨询方案。' },
  { id: 5, brand: '理想', model: 'L7 Pro', year: 2024, mileage: '0.5万公里', price: '28.6万', city: '上海市', province: '上海市', dealer: '华东新能源中心', tags: ['新能源', '准新车', '高保值'], cover: '/subpackages/cars/images/cars/car-5.webp', desc: '官方渠道车源，支持延保咨询与分期方案预审。' },
  { id: 6, brand: '本田', model: 'CR-V 240TURBO', year: 2022, mileage: '2.1万公里', price: '16.5万', city: '宁波市', province: '浙江省', dealer: '亮叶合作车商A', tags: ['SUV', '家庭首选', '可置换'], cover: '/subpackages/cars/images/cars/car-6.webp', desc: '无重大事故，支持上门验车与按揭材料清单生成。' }
]

const channelPartners = [
  { id: 1, name: '甬江助融工作室', city: '宁波市', province: '浙江省', score: 4.9, cases: 126, tags: ['企业贷', '经营周转'], desc: '专注宁波本地小微企业融资咨询，擅长税票贷与流水贷材料整理。', contact: '陈经理', verified: true, avatar: '/subpackages/channel/images/channel/avatar-1.webp' },
  { id: 2, name: '钱塘车贷联盟', city: '杭州市', province: '浙江省', score: 4.8, cases: 98, tags: ['汽车金融', '二手车'], desc: '覆盖杭州及周边二手车按揭、车抵咨询与置换方案匹配。', contact: '周顾问', verified: true, avatar: '/subpackages/channel/images/channel/avatar-2.webp' },
  { id: 3, name: '绍兴产融服务团', city: '绍兴市', province: '浙江省', score: 4.7, cases: 76, tags: ['抵押咨询', '供应链金融'], desc: '服务纺织、制造类企业，提供抵押类经营周转信息撮合。', contact: '王专员', verified: true, avatar: '/subpackages/channel/images/channel/avatar-3.webp' },
  { id: 4, name: '亮叶官方客服组', city: '宁波市', province: '浙江省', score: 5.0, cases: 320, tags: ['官方', '合规咨询'], desc: '亮叶企服官方团队，提供产品咨询、材料清单与风险提示。', contact: '官方客服', verified: true, avatar: '/subpackages/channel/images/channel/avatar-4.webp' }
]

const valuationBrands = [
  { brand: '比亚迪', baseRate: 0.82 },
  { brand: '丰田', baseRate: 0.78 },
  { brand: '特斯拉', baseRate: 0.80 },
  { brand: '大众', baseRate: 0.74 },
  { brand: '本田', baseRate: 0.76 },
  { brand: '理想', baseRate: 0.81 }
]

const regionStats = [
  { province: '浙江省', city: '宁波市', clues: 36, demands: 22, applications: 18, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin', updatedAt: '2025-07-02 10:00' },
  { province: '浙江省', city: '杭州市', clues: 28, demands: 25, applications: 20, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin', updatedAt: '2025-07-02 10:00' },
  { province: '浙江省', city: '绍兴市', clues: 16, demands: 12, applications: 9, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin', updatedAt: '2025-07-02 10:00' },
  { province: '浙江省', city: '温州市', clues: 14, demands: 11, applications: 8, sourceName: '浙江省公共数据开放平台', sourceUrl: 'https://data.zj.gov.cn/', updatedAt: '2025-07-02 10:00' },
  { province: '浙江省', city: '嘉兴市', clues: 10, demands: 8, applications: 6, sourceName: '浙江省公共数据开放平台', sourceUrl: 'https://data.zj.gov.cn/', updatedAt: '2025-07-02 10:00' },
  { province: '上海市', city: '上海市', clues: 18, demands: 18, applications: 13, sourceName: '上海市公共数据开放平台', sourceUrl: 'https://data.sh.gov.cn/', updatedAt: '2025-07-02 10:00' },
  { province: '江苏省', city: '南京市', clues: 12, demands: 10, applications: 7, sourceName: '国家统计局国家数据', sourceUrl: 'https://data.stats.gov.cn/', updatedAt: '2025-07-02 10:00' },
  { province: '江苏省', city: '苏州市', clues: 15, demands: 13, applications: 9, sourceName: '国家统计局国家数据', sourceUrl: 'https://data.stats.gov.cn/', updatedAt: '2025-07-02 10:00' }
]

const regionDistricts = {
  '宁波市': [
    { district: '海曙区', clues: 6, demands: 4, applications: 3, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin' },
    { district: '鄞州区', clues: 9, demands: 6, applications: 5, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin' },
    { district: '江北区', clues: 4, demands: 3, applications: 2, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin' },
    { district: '北仑区', clues: 5, demands: 3, applications: 3, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin' },
    { district: '镇海区', clues: 3, demands: 2, applications: 2, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin' },
    { district: '奉化区', clues: 2, demands: 1, applications: 1, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin' },
    { district: '慈溪市', clues: 4, demands: 2, applications: 1, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin' },
    { district: '余姚市', clues: 2, demands: 1, applications: 1, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin' },
    { district: '象山县', clues: 1, demands: 0, applications: 0, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin' },
    { district: '宁海县', clues: 0, demands: 0, applications: 0, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin' }
  ],
  '杭州市': [
    { district: '西湖区', clues: 5, demands: 5, applications: 4, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin' },
    { district: '滨江区', clues: 6, demands: 5, applications: 4, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin' },
    { district: '萧山区', clues: 7, demands: 6, applications: 5, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin' },
    { district: '余杭区', clues: 5, demands: 4, applications: 3, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin' },
    { district: '拱墅区', clues: 3, demands: 3, applications: 2, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin' },
    { district: '上城区', clues: 2, demands: 2, applications: 2, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin' }
  ],
  '绍兴市': [
    { district: '越城区', clues: 5, demands: 4, applications: 3, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin' },
    { district: '柯桥区', clues: 4, demands: 3, applications: 2, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin' },
    { district: '上虞区', clues: 3, demands: 2, applications: 2, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin' },
    { district: '诸暨市', clues: 2, demands: 2, applications: 1, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin' },
    { district: '嵊州市', clues: 2, demands: 1, applications: 1, sourceName: '亮叶企服审核线索池', sourceUrl: 'local-admin' }
  ]
}

function findById(list, id) {
  return list.find(item => String(item.id) === String(id))
}

function searchAll(keyword = '', type = 'all') {
  const results = [
    ...products.map(item => ({ id: item.id, type: 'product', title: item.name, desc: item.desc, path: item.path === '/pages/products/products' ? `/subpackages/product/pages/detail/detail?id=${item.id}` : item.path })),
    ...news.map(item => ({ id: item.id, type: 'news', title: item.title, desc: item.summary, path: `/subpackages/news/pages/detail/detail?id=${item.id}` })),
    ...knowledge.map(item => ({ id: item.id, type: 'knowledge', title: item.title, desc: item.summary, path: `/subpackages/knowledge/pages/detail/detail?id=${item.id}` })),
    ...tips.map(item => ({ id: item.id, type: 'tips', title: item.title, desc: item.summary, path: `/subpackages/tips/pages/detail/detail?id=${item.id}` })),
    ...exposures.map(item => ({ id: item.id, type: 'exposure', title: item.title, desc: item.content, path: `/subpackages/exposure/pages/detail/detail?id=${item.id}` })),
    ...carListings.map(item => ({ id: item.id, type: 'car', title: `${item.brand} ${item.model}`, desc: item.desc, path: `/subpackages/cars/pages/detail/detail?id=${item.id}` })),
    ...channelPartners.map(item => ({ id: item.id, type: 'channel', title: item.name, desc: item.desc, path: `/subpackages/channel/pages/list/list` }))
  ]

  return results.filter(item => {
    const typeMatched = type === 'all' || item.type === type || (type === 'service' && ['knowledge', 'tips', 'exposure'].includes(item.type))
    const keywordMatched = !keyword || item.title.includes(keyword) || item.desc.includes(keyword)
    return typeMatched && keywordMatched
  })
}

function createProductDetail(product) {
  if (!product) return null
  const extras = {
    1: {
      highlights: ['新车专享方案匹配', '首付比例灵活配置', '合作车商绿色通道', '保险与GPS一站式协助'],
      process: ['在线提交进件材料', '专员预审材料完整性', '匹配持牌金融机构方案', '面签放款提车'],
      materials: ['身份证正反面', '驾驶证', '购车合同/意向书', '收入证明或银行流水', '征信授权书'],
      faq: [{ q: '新车按揭最低首付多少？', a: '首付比例因机构和车型而异，通常20%起，以机构审核为准。' }, { q: '新能源车有专项政策吗？', a: '部分合作机构对新能源车型有利率优惠，具体以审批结果为准。' }]
    },
    2: {
      highlights: ['二手车评估价参考', '车龄里程综合评估', '合作车商验车报告', '快速预审反馈'],
      process: ['提交车辆与个人信息', '车辆评估与定价', '匹配二手车金融产品', '签约过户放款'],
      materials: ['身份证', '行驶证', '二手车交易合同', '银行流水', '征信授权'],
      faq: [{ q: '二手车最高贷多少？', a: '通常不超过评估价的70%，具体以验车报告和机构政策为准。' }, { q: '车龄超过10年能贷吗？', a: '部分机构限制车龄，建议先提交材料由专员评估。' }]
    },
    3: {
      highlights: ['不押车方案咨询', '评估价快速参考', '用途合规审核', '还款方式灵活'],
      process: ['提交车辆权属材料', '车辆评估定价', '机构审批额度', '抵押登记放款'],
      materials: ['身份证', '行驶证', '车辆登记证', '保险单', '收入证明', '征信授权'],
      faq: [{ q: '车抵贷需要押车吗？', a: '部分产品支持不押车，需安装GPS，以机构方案为准。' }, { q: '放款需要多久？', a: '材料齐全后通常1-3个工作日，具体因机构而异。' }]
    },
    4: {
      highlights: ['税票流水综合评估', '专精特新绿色通道', '多种担保方式咨询', '还款周期灵活'],
      process: ['提交企业经营材料', '机构实地或远程审核', '额度与利率审批', '签约放款'],
      materials: ['营业执照', '法人身份证', '近12个月纳税记录', '银行对公流水', '经营场所证明'],
      faq: [{ q: '成立不满一年能申请吗？', a: '部分机构要求经营满1-2年，可提交材料由专员匹配适合产品。' }, { q: '需要抵押吗？', a: '有信用贷和抵押贷多种方式，根据企业资质匹配。' }]
    },
    5: {
      highlights: ['房产评估参考', '大额资金方案', '产权清晰审核', '长期限产品咨询'],
      process: ['提交产权材料', '评估与尽调', '机构审批', '抵押登记放款'],
      materials: ['身份证', '房产证', '婚姻证明', '收入或经营流水', '资金用途证明'],
      faq: [{ q: '抵押率一般多少？', a: '通常不超过评估价的70%，因地区和机构政策而异。' }]
    },
    6: {
      highlights: ['公积金客户优选', '纯信用无需抵押', '线上提交便捷', '多种期限选择'],
      process: ['提交个人材料', '征信与收入审核', '额度审批', '签约放款'],
      materials: ['身份证', '收入证明', '公积金/社保记录', '银行流水', '征信授权'],
      faq: [{ q: '消费贷能用于装修吗？', a: '合规消费用途可以，不得用于购房首付或投资。' }]
    },
    7: {
      highlights: ['设备残值评估', '租金方案测算', '到期回购/续租', '税收优惠咨询'],
      process: ['提交设备需求', '方案设计与报价', '合同签署', '设备交付起租'],
      materials: ['企业营业执照', '设备采购合同', '财务报表', '法人身份证明'],
      faq: [{ q: '融资租赁和贷款有什么区别？', a: '租赁期间设备所有权归出租方，期满可回购；贷款则直接购买。' }]
    },
    8: {
      highlights: ['合同条款风险识别', '利率合法性核查', '催收合规评估', '维权路径指引'],
      process: ['提交借贷合同', '专业审阅分析', '出具风险提示报告', '协助合规维权'],
      materials: ['借贷合同', '转账记录', '沟通记录', '催收录音/短信'],
      faq: [{ q: '年化多少算高利贷？', a: '超过法定利率上限的利息部分不受法律保护，具体以司法解释为准。' }]
    },
    9: {
      highlights: ['原厂质保衔接', '宁波全市网点', '免赔条款透明', '预约检测便捷'],
      process: ['选择保障套餐', '车辆检测评估', '签署延保合同', '保障生效'],
      materials: ['行驶证', '购车发票', '现有质保记录', '车辆检测报告'],
      faq: [{ q: '延保和车险有什么区别？', a: '车险保障事故损失，延保保障机械故障维修，互为补充。' }]
    },
    ...catalog.productDetails
  }
  const extra = extras[product.id] || {}
  const base = {
    ...product,
    highlights: product.highlights || extra.highlights || ['材料清单清晰', '专员协助预审', '综合成本透明'],
    process: product.process || extra.process || ['提交基础信息', '匹配产品方案', '补充申请材料', '机构审批放款'],
    materials: product.materials || extra.materials || ['身份证明', '收入或经营流水', '征信授权', '用途证明'],
    faq: product.faq || extra.faq || [
      { q: '多久可以反馈初审结果？', a: '资料齐全后通常30分钟内完成初步反馈。' },
      { q: '是否会强制收取前置费用？', a: '平台不建议向个人账户或不明主体支付任何前置费用，正式服务以合同约定和持牌机构披露为准。' }
    ]
  }
  if (String(product.id) === '10' || product.category === 'workflow') {
    return {
      ...base,
      highlights: [
        '12大模块：基本信息、个人信息、车辆、融资、工作、收入、资料上传、紧急联系人',
        '审核、放款、归档、催收全流程节点可视化跟踪',
        '按产品类型自动预填用途与期限，减少重复录入',
        '本地安全存储，支持断点续填与进度百分比提醒'
      ],
      process: [
        '选择产品类型进入进件首页',
        '依次完善基本信息、个人信息、车辆与融资信息',
        '上传身份证、流水、收入证明等影像资料',
        '填写工作与收入、紧急联系人后提交审核',
        '跟踪审核→放款→归档→催收各节点状态'
      ],
      materials: [
        '身份证正反面影像',
        '近6个月银行流水',
        '收入证明或个税/公积金记录',
        '车辆发票/合同、驾驶证（如适用）',
        '征信授权书及其他补充材料'
      ],
      faq: [
        { q: '进件系统与机构审批是什么关系？', a: '本系统用于材料整理与进度管理，最终审批、额度、利率由合作持牌金融机构独立决定。' },
        { q: '资料保存在哪里？', a: '填报数据暂存于本机，提交审核后同步至亮叶企服后台队列，平台严格保密。' },
        { q: '进度达到多少可以提交？', a: '完成度达55%以上（含基本信息、个人信息及必传资料）即可提交初审。' }
      ]
    }
  }
  return base
}

function estimateCarValue(payload = {}) {
  const brandInfo = valuationBrands.find(item => item.brand === payload.brand) || { baseRate: 0.75 }
  const purchasePrice = Number(payload.purchasePrice) || 150000
  const year = Number(payload.year) || new Date().getFullYear()
  const mileage = Number(payload.mileage) || 3
  const age = Math.max(new Date().getFullYear() - year, 0)
  const ageDepreciation = Math.max(0.45, 1 - age * 0.08)
  const mileageDepreciation = Math.max(0.85, 1 - mileage * 0.012)
  const estimate = Math.round(purchasePrice * brandInfo.baseRate * ageDepreciation * mileageDepreciation)
  return {
    estimate,
    range: `${Math.round(estimate * 0.95 / 10000)}-${Math.round(estimate * 1.05 / 10000)}万`,
    factors: ['品牌保值率', '车龄折旧', '里程影响', '本地市场参考'],
    complianceNote: '估值结果仅供参考，实际评估价以合作机构验车报告为准。'
  }
}

const knowledgeExtras = {
  1: { content: '<p>企业融资主要包括：银行贷款、股权融资、债券融资、融资租赁、供应链金融等方式。</p><p>不同融资方式适用于不同发展阶段的企业，需综合考虑成本、期限、稀释程度等因素。</p><p>初创期可优先考虑股权融资或政策性贷款；成长期适合银行信用贷与供应链金融；成熟期可探索债券融资与并购贷款。</p>', testQuestion: { question: '以下哪种融资方式不会稀释股权？', options: ['股权融资', '银行贷款', '引入战略投资者', 'IPO'], answer: 1 } },
  2: { content: '<p>信用贷款申请流程：准备材料 → 提交申请 → 机构审核 → 签约放款 → 按时还款。</p><p>材料通常包括身份证明、收入证明、征信授权、用途说明等，具体以机构要求为准。</p>', testQuestion: { question: '信用贷款最重要的审核因素是什么？', options: ['企业规模', '个人征信', '行业类型', '注册年限'], answer: 1 } },
  3: { content: '<p>企业融资成本不仅包括名义利率，还应考虑手续费、担保费、时间成本等综合因素。</p><p>建议使用年化综合资金成本（APR）进行横向比较。</p>', testQuestion: { question: '评估融资成本时应考虑哪些因素？', options: ['仅看名义利率', '综合费用和时间成本', '只看还款期限', '只看担保方式'], answer: 1 } },
  4: { content: '<p>供应链金融基于真实贸易背景，为产业链上下游企业提供融资服务，降低整体融资成本。</p><p>核心企业确权、应收账款质押、存货融资是常见模式。</p>', testQuestion: { question: '供应链金融的核心基础是什么？', options: ['企业规模', '真实贸易背景', '政府担保', '固定资产'], answer: 1 } },
  5: { content: '<p>绿色金融支持环保、节能、清洁能源等领域的项目，享受利率优惠和政策扶持。</p><p>企业申请绿色贷款需提供项目环评、节能认证等材料。</p>', testQuestion: { question: '绿色金融主要支持哪类项目？', options: ['房地产', '环保节能', '娱乐消费', '传统制造'], answer: 1 } },
  6: { content: '<p>车抵贷额度受车辆评估价、车龄、保险状态、征信记录等多因素影响。</p><p>一般评估额度为车辆评估价的50%-80%，具体以机构审核为准。</p>', testQuestion: { question: '影响车抵贷额度的主要因素不包括？', options: ['车辆评估价', '车龄', '股票持仓', '征信记录'], answer: 2 } }
}

const tipsExtras = {
  1: { content: '<p>非法集资是指未经国务院金融管理部门依法许可，以许诺还本付息或者给予其他投资回报的方式，向不特定对象吸收资金的行为。</p><p>常见特征包括：未经批准公开宣传、承诺保本高收益、向不特定公众募集资金、无真实经营项目等。</p>', case: '某公司以"区块链投资"为名，承诺月收益15%，实际采用庞氏骗局模式，最终资金链断裂，造成500余名投资者损失。', preventions: ['核实企业是否持有金融牌照', '警惕"保本高收益"宣传', '不向个人账户转账投资', '保留合同和转账凭证', '发现异常及时向监管部门举报'] },
  2: { content: '<p>贷款诈骗是指犯罪分子以办理贷款为名，收取各种费用后不提供贷款服务的诈骗行为。</p>', case: '受害人申请网络贷款时，被要求在放款前缴纳"保证金""解冻费"等费用，累计被骗2万余元。', preventions: ['正规贷款不会在放款前收取费用', '通过官方渠道申请贷款', '不轻信"无抵押秒批"广告', '保护个人征信和身份信息'] },
  3: { content: '<p>部分融资合同中存在对用户不利的隐藏条款，如高额违约金、自动续期条款、单方面变更利率等。</p>', case: '某企业签署融资合同时未注意"提前还款需支付剩余本金20%违约金"条款，提前还款时多付10万元。', preventions: ['仔细阅读合同全文', '重点关注利率、费用、违约条款', '必要时请律师审核', '保留合同原件'] },
  4: { content: '<p>高利贷是指超过法定利率上限的借贷行为，可能伴随暴力催收等违法手段。</p>', case: '借款人通过非正规渠道借款，实际年化利率超过100%，因无力偿还遭受暴力催收。', preventions: ['了解法定利率上限', '选择持牌金融机构', '计算实际年化利率', '遇暴力催收及时报警'] },
  5: { content: '<p>企业融资过程中若操作不当，可能引发税务合规风险，如发票虚开、关联交易定价不合理等。</p>', case: '某企业通过虚假贸易背景获取银行贷款，被税务机关查处并处以罚款。', preventions: ['确保融资用途真实合法', '规范财务和税务处理', '避免虚假贸易背景', '咨询专业税务顾问'] },
  6: { content: '<p>提前还款看似节省利息，但需综合比较违约金、返现冲抵、资金机会成本等因素。</p>', case: '某用户提前还清车贷后发现违约金高于节省的利息，综合成本反而上升。', preventions: ['查阅合同提前还款条款', '计算综合节省金额', '考虑资金其他用途收益', '与机构协商减免违约金'] }
}

const newsExtras = {
  1: { content: '<p>甬江金融新政聚焦小微企业融资可得性，重点支持专精特新、绿色制造和科技创新企业。</p><p>政策要点包括：扩大信用贷款覆盖面、优化续贷流程、降低综合融资成本。企业可关注当地人民银行与财政部门的配套贴息措施。</p><p>亮叶企服建议：提前整理近6个月经营流水与纳税记录，便于匹配政策性产品。</p>' },
  2: { content: '<p>融资诈骗常见套路包括：冒充银行工作人员、承诺“包过审批”、要求先交保证金或解冻费。</p><p>识别要点：正规机构不会在放款前收取任何费用；不轻信非官方渠道的“内部额度”。</p><p>如遇可疑情况，请通过曝光台举报或联系平台智能客服核实。</p>' },
  3: { content: '<p>企业融资五大方式：银行贷款、股权融资、债券融资、融资租赁、供应链金融。</p><p>银行贷款适合有稳定经营流水的主体；股权融资适合高成长企业但会稀释股权；融资租赁适合设备采购场景。</p><p>选择时需综合比较期限、成本、审批周期与材料复杂度。</p>' },
  4: { content: '<p>绿色金融政策支持环保节能、新能源、低碳供应链改造等领域，部分产品享受利率优惠。</p><p>申请通常需提供项目环评、节能认证或绿色产业目录匹配证明。</p><p>亮叶企服可协助梳理绿色项目材料清单并匹配合规机构。</p>' },
  5: { content: '<p>二手车金融业务审核重点关注：车况检测报告、车龄与里程、交易合同真实性、借款人流水与征信。</p><p>车龄超过8年或重大事故车源，可选方案会明显减少。建议购车前完成第三方检测。</p>' },
  6: { content: '<p>亮叶企服正式上线融资材料清单助手，覆盖车贷、经营贷、抵押贷等常见场景。</p><p>用户可按产品类型一键生成材料清单，减少遗漏与重复提交。该工具仅用于材料管理，不代表审批结果。</p>' }
}

function createNewsDetail(item) {
  if (!item) return null
  const extra = newsExtras[item.id] || {}
  return {
    ...item,
    content: extra.content || `<p>${item.summary}</p><p>围绕当前政策和市场环境，平台建议用户结合自身资金用途、还款周期、材料完整度和综合成本，选择合适的产品路径。</p>`
  }
}

function createKnowledgeDetail(item) {
  if (!item) return null
  const extra = knowledgeExtras[item.id] || {}
  return { ...item, ...extra }
}

function createTipDetail(item) {
  if (!item) return null
  const extra = tipsExtras[item.id] || {}
  return { ...item, ...extra }
}

function createExposureDetail(item) {
  if (!item) return null
  return {
    ...item,
    content: item.content ? `<p>${item.content}</p><p>平台建议用户在选择融资服务时，核验机构资质、综合费率、合同条款及收款账户，避免向个人账户或不明主体支付前置费用。</p><p class="warning">如遇到承诺包过、先收费后放款、征信修复等宣传，请谨慎辨别并保留证据。</p>` : item.content,
    evidence: item.evidence || [],
    progress: item.progress || [
      { date: item.date, action: '收到用户举报', org: '亮叶风控中心' },
      { date: item.date, action: '初步核实', org: '合规审核组' },
      { date: item.date, action: item.status || '持续跟进', org: '亮叶企服' }
    ]
  }
}

function createCaseDetail(item) {
  if (!item) return null
  const details = {
    1: {
      client: '鄞州某连锁餐饮', industry: '餐饮', city: '宁波市鄞州区', duration: '3天',
      amount: '80万元', institution: '宁波银行容易贷',
      challenge: '门店扩张需备货资金，但材料分散在多家门店，重复提交效率低。',
      solution: '亮叶专员统一整理近12个月流水、租赁合同与纳税记录，通过容易贷线上授权测额，3个工作日内完成预审反馈。',
      outcome: '客户获得80万经营周转额度意向，减少2轮材料补交。',
      timeline: ['Day1 需求对接与材料清单', 'Day2 纳税数据授权与流水整理', 'Day3 预审反馈与方案确认'],
      relatedPath: '/subpackages/product/pages/detail/detail?id=11'
    },
    2: {
      client: '宁波某新能源经销商', industry: '汽车零售', city: '宁波市', duration: '5天',
      amount: '200万元', institution: '建行+宁波银行组合',
      challenge: '库存车辆占用大量资金，回款周期与厂家结算节奏不匹配。',
      solution: '结合车辆清单、销售合同与历史回款数据，设计短期库存周转方案，匹配建行营运车辆融资与银行承兑组合。',
      outcome: '获得200万周转额度意向，缓解2个月库存资金压力。',
      timeline: ['Day1 库存清单梳理', 'Day2-3 机构方案比选', 'Day4-5 材料提交与预审'],
      relatedPath: '/subpackages/autoFinance/pages/list/list'
    },
    3: {
      client: '北仑某物流企业', industry: '物流', city: '宁波市北仑区', duration: '1天',
      amount: '评估价28万', institution: '平安银行车主贷',
      challenge: '企业临时周转，需快速了解不押车方案与综合成本。',
      solution: '当日完成车辆权属核验与评估价参考，明确GPS安装、保险要求与还款安排，提交车抵进件预审。',
      outcome: '当日获得评估反馈，客户明确综合成本后决定是否继续办理。',
      timeline: ['上午 车辆材料核验', '下午 评估价反馈与方案说明'],
      relatedPath: '/subpackages/autoFinance/pages/carMortgage/carMortgage'
    },
    4: {
      client: '鄞州某商贸企业', industry: '批发零售', city: '宁波市鄞州区', duration: '7天',
      amount: '500万元', institution: '工商银行e抵快贷',
      challenge: '大额经营周转，需住宅抵押，材料涉及多人共有人。',
      solution: '整理房产证、婚姻证明、经营流水与用途说明，对接工行宁波市分行e抵快贷，协调共有人签署材料。',
      outcome: '7个工作日内完成评估与初审，获得500万额度意向。',
      timeline: ['Day1-2 产权材料整理', 'Day3-4 房产评估', 'Day5-7 机构初审'],
      relatedPath: '/subpackages/product/pages/detail/detail?id=17'
    },
    5: {
      client: '江北某事业单位员工', industry: '公共服务', city: '宁波市江北区', duration: '2天',
      amount: '50万元', institution: '宁波银行白领通',
      challenge: '装修资金需求，不了解公积金客户可匹配的产品路径。',
      solution: '根据公积金连续缴存记录与收入证明，匹配宁波银行白领通消费贷，明确用途合规要求。',
      outcome: '2天内完成方案说明与材料清单，客户按清单准备后提交机构审核。',
      timeline: ['Day1 资质评估', 'Day2 方案与材料清单'],
      relatedPath: '/subpackages/product/pages/detail/detail?id=14'
    },
    6: {
      client: '慈溪某制造企业', industry: '制造业', city: '宁波市慈溪市', duration: '4天',
      amount: '按团购规模', institution: '工行+延保服务商',
      challenge: '50名员工团购新能源，需同时办理车贷与三电延保，流程繁琐。',
      solution: '批量收集员工材料，统一对接工行汽车分期与延保套餐，进件系统批量填报减少重复录入。',
      outcome: '4天内完成首批20名员工材料预审与延保套餐选择。',
      timeline: ['Day1 团购方案说明', 'Day2-3 批量进件', 'Day4 延保套餐确认'],
      relatedPath: '/subpackages/autoFinance/pages/warranty/warranty?type=ev'
    }
  }
  const extra = details[item.id] || {}
  return {
    ...item,
    ...extra,
    complianceNote: '本案例为亮叶企服居间服务记录，具体审批结果以持牌机构为准，不构成放款承诺。'
  }
}

function createBannerDetail(banner) {
  if (!banner) return null
  const contents = {
    1: {
      content: '<p><strong>新能源汽车金融服务升级</strong></p><p>亮叶企服联合工行、建行、宁波银行等持牌机构，为新能源购车客户提供信息咨询与材料撮合服务。</p><ul><li>新车按揭：比亚迪、特斯拉、蔚来等品牌专项方案</li><li>二手车置换：评估价参考与材料预审</li><li>车抵周转：权属核验与合规用途审核</li></ul><p>平台不从事放贷，具体利率、额度以机构审批及正式合同为准。</p>',
      link: '/subpackages/autoFinance/pages/list/list',
      actionText: '查看汽车金融产品',
      highlights: ['15+持牌机构产品', '30分钟预审反馈', '零前置费用']
    },
    2: {
      content: '<p><strong>专精特新企业融资计划</strong></p><p>针对专精特新、高新技术企业，亮叶企服提供经营贷、信用贷、抵押贷等信息撮合。</p><ul><li>宁波银行容易贷：纳税数据授权测额</li><li>农行微捷贷：小微企业线上信用贷</li><li>工行e抵快贷：房产抵押经营周转</li></ul><p>协助整理税票、流水、研发与订单材料，匹配合规持牌机构公开产品。</p>',
      link: '/pages/products/products?category=business',
      actionText: '查看企业经营贷产品',
      highlights: ['专精特新绿色通道', '材料清单助手', '1对1专员跟进']
    }
  }
  const extra = contents[banner.id] || {}
  return {
    title: banner.title,
    content: extra.content || `<p>${banner.desc}</p>`,
    image: banner.img,
    link: extra.link || banner.link,
    actionText: extra.actionText || '立即了解',
    highlights: extra.highlights || []
  }
}

module.exports = {
  banners,
  stats,
  serviceScenes,
  products,
  homeCategoryNav: catalog.homeCategoryNav,
  ningboInstitutions: catalog.ningboInstitutions,
  financeCircleExtras: catalog.financeCircleExtras,
  news,
  knowledge,
  tips,
  exposures,
  demands,
  cases,
  profile,
  clues,
  applications,
  notifications,
  serviceFaqs,
  fuelPrices,
  carListings,
  channelPartners,
  valuationBrands,
  regionStats,
  regionDistricts,
  findById,
  searchAll,
  createProductDetail,
  createNewsDetail,
  createKnowledgeDetail,
  createTipDetail,
  createExposureDetail,
  createBannerDetail,
  createCaseDetail,
  estimateCarValue
}
