/**
 * 宁波地区金融机构产品目录（公开信息整理，利率/额度以机构审批为准）
 * 亮叶企服仅提供信息咨询与撮合，不发放贷款
 */

const COMPLIANCE = '本平台仅提供金融信息咨询与居间撮合服务，具体利率、额度、期限以持牌机构审核结果和正式合同为准。'

const cover = id => `/subpackages/product/images/products/product-${((id - 1) % 10) + 1}.webp`

const extraProducts = [
  // —— 企业经营贷 · 宁波 ——
  {
    id: 11, category: 'business', intakeType: 'business',
    institution: '宁波银行', region: '宁波市',
    name: '宁波银行·容易贷（小微经营性）',
    rate: '年化约3.6%起（以审批为准）',
    desc: '面向宁波地区小微企业的经营性信用贷款，支持线上申请、税务数据授权，适用于流动资金周转、备货采购等合规用途。',
    tags: ['宁波银行', '信用贷', '纳税授权'], amount: '最高300万', term: '最长3年',
    suitable: '宁波注册小微企业、个体工商户', cover: cover(11),
    complianceNote: COMPLIANCE, sourceName: '宁波银行官网公开产品信息', sourceUrl: 'https://www.nbcb.com.cn/',
    path: '/subpackages/product/pages/detail/detail?id=11'
  },
  {
    id: 12, category: 'business', intakeType: 'business',
    institution: '中国农业银行宁波市分行', region: '宁波市',
    name: '农行宁波·微捷贷',
    rate: '按LPR加点定价（以审批为准）',
    desc: '农业银行小微企业线上信用贷款产品，宁波地区企业可通过网银/掌银渠道申请，结合纳税、流水等数据进行授信。',
    tags: ['农业银行', '线上贷', '小微企业'], amount: '最高200万', term: '1-3年',
    suitable: '有稳定经营流水的小微企业', cover: cover(12),
    complianceNote: COMPLIANCE, sourceName: '中国农业银行官网', sourceUrl: 'https://www.abchina.com/',
    path: '/subpackages/product/pages/detail/detail?id=12'
  },
  {
    id: 13, category: 'business', intakeType: 'business',
    institution: '中国建设银行宁波市分行', region: '宁波市',
    name: '建行宁波·小微快贷',
    rate: '按建行系统定价（以审批为准）',
    desc: '建设银行面向小微企业的全流程线上贷款，宁波企业可凭结算、纳税、社保等多维度数据测额，支持随借随还。',
    tags: ['建设银行', '小微快贷', '随借随还'], amount: '最高500万', term: '最长1年（可续）',
    suitable: '建行对公结算活跃企业', cover: cover(13),
    complianceNote: COMPLIANCE, sourceName: '中国建设银行官网', sourceUrl: 'https://www.ccb.com/',
    path: '/subpackages/product/pages/detail/detail?id=13'
  },
  // —— 个人消费贷 · 宁波 ——
  {
    id: 14, category: 'personal', intakeType: 'personal',
    institution: '宁波银行', region: '宁波市',
    name: '宁波银行·白领通',
    rate: '年化约3.5%起（以审批为准）',
    desc: '宁波银行面向优质工薪阶层的个人信用消费贷款，宁波地区缴纳公积金/社保白领可申请，用于装修、教育、旅游等合规消费。',
    tags: ['宁波银行', '信用消费贷', '白领'], amount: '最高80万', term: '最长5年',
    suitable: '宁波在职白领、事业单位员工', cover: cover(14),
    complianceNote: COMPLIANCE + '不得用于购房首付、证券投资等禁止用途。', sourceName: '宁波银行官网', sourceUrl: 'https://www.nbcb.com.cn/',
    path: '/subpackages/product/pages/detail/detail?id=14'
  },
  {
    id: 15, category: 'personal', intakeType: 'personal',
    institution: '中国工商银行宁波市分行', region: '宁波市',
    name: '工行宁波·个人信用贷款',
    rate: '按LPR及客户资质定价',
    desc: '工商银行个人信用贷款，宁波户籍或本地工作缴纳社保满一定期限可申请，支持手机银行线上测额。',
    tags: ['工商银行', '信用贷', '线上测额'], amount: '最高50万', term: '最长5年',
    suitable: '有稳定收入、征信良好的个人客户', cover: cover(15),
    complianceNote: COMPLIANCE, sourceName: '中国工商银行官网', sourceUrl: 'https://www.icbc.com.cn/',
    path: '/subpackages/product/pages/detail/detail?id=15'
  },
  {
    id: 16, category: 'personal', intakeType: 'personal',
    institution: '中国银行宁波市分行', region: '宁波市',
    name: '中行宁波·随心智贷',
    rate: '以中行审批定价为准',
    desc: '中国银行个人消费类信用贷款，宁波地区客户可凭公积金、代发工资等资质申请，资金用于合规个人消费。',
    tags: ['中国银行', '消费贷', '公积金客户'], amount: '最高30万', term: '最长3年',
    suitable: '中行代发薪、公积金缴存客户', cover: cover(16),
    complianceNote: COMPLIANCE, sourceName: '中国银行官网', sourceUrl: 'https://www.boc.cn/',
    path: '/subpackages/product/pages/detail/detail?id=16'
  },
  // —— 抵押经营贷 · 宁波 ——
  {
    id: 17, category: 'property', intakeType: 'property',
    institution: '中国工商银行宁波市分行', region: '宁波市',
    name: '工行宁波·e抵快贷',
    rate: '按LPR加点（以审批为准）',
    desc: '以宁波市住宅、商铺等不动产抵押的经营性贷款，线上评估、快速审批，资金用于企业生产经营周转。',
    tags: ['工商银行', '房产抵押', '经营贷'], amount: '最高1000万', term: '最长10年',
    suitable: '有宁波房产的企业主、个体工商户', cover: cover(17),
    complianceNote: COMPLIANCE + '抵押登记由合作机构依法办理。', sourceName: '中国工商银行官网', sourceUrl: 'https://www.icbc.com.cn/',
    path: '/subpackages/product/pages/detail/detail?id=17'
  },
  {
    id: 18, category: 'property', intakeType: 'property',
    institution: '宁波银行', region: '宁波市',
    name: '宁波银行·房抵贷（经营）',
    rate: '以宁波银行审批为准',
    desc: '以宁波地区房产作为抵押物的经营性融资，支持一抵、二抵（符合政策条件下），用于企业流动资金、设备购置等。',
    tags: ['宁波银行', '房抵', '经营周转'], amount: '最高2000万', term: '最长10年',
    suitable: '持有宁波产权房产的经营主体', cover: cover(18),
    complianceNote: COMPLIANCE, sourceName: '宁波银行官网', sourceUrl: 'https://www.nbcb.com.cn/',
    path: '/subpackages/product/pages/detail/detail?id=18'
  },
  {
    id: 19, category: 'property', intakeType: 'property',
    institution: '中国邮政储蓄银行宁波市分行', region: '宁波市',
    name: '邮储宁波·房产抵押贷款',
    rate: '以邮储银行审批为准',
    desc: '邮储银行房产抵押类贷款，宁波地区住宅、商业用房均可作为抵押物，适用于个体工商户、小微企业主经营融资。',
    tags: ['邮储银行', '房产抵押', '个体户'], amount: '最高500万', term: '最长10年',
    suitable: '有清晰产权的宁波房产所有人', cover: cover(19),
    complianceNote: COMPLIANCE, sourceName: '中国邮政储蓄银行官网', sourceUrl: 'https://www.psbc.com/',
    path: '/subpackages/product/pages/detail/detail?id=19'
  },
  // —— 融资租赁 · 宁波 ——
  {
    id: 20, category: 'lease', intakeType: 'lease',
    institution: '浙江海港融资租赁有限公司', region: '宁波市',
    name: '浙江海港租赁·设备融资租赁',
    rate: '租金方案定制（以合同为准）',
    desc: '浙江省海港集团下属融资租赁公司，服务宁波临港制造、港口物流等企业，提供生产设备、港机设备等直租/回租方案。',
    tags: ['省属国企', '设备租赁', '临港制造'], amount: '500万-2亿', term: '3-5年',
    suitable: '宁波临港、制造、物流企业', cover: cover(20),
    complianceNote: '租赁物所有权归属以融资租赁合同约定为准。', sourceName: '浙江海港集团公开信息', sourceUrl: 'https://www.zjseaport.com/',
    path: '/subpackages/product/pages/detail/detail?id=20'
  },
  {
    id: 21, category: 'lease', intakeType: 'lease',
    institution: '平安国际融资租赁有限公司', region: '宁波市',
    name: '平安租赁·商用车/设备融资',
    rate: '以租赁合同约定为准',
    desc: '平安集团旗下融资租赁业务，在宁波地区为物流、工程、制造企业提供商用车、工程机械等设备融资租赁服务。',
    tags: ['平安集团', '商用车', '工程机械'], amount: '50万-5000万', term: '2-5年',
    suitable: '有稳定现金流的企业设备更新', cover: cover(21),
    complianceNote: COMPLIANCE, sourceName: '平安国际融资租赁官网', sourceUrl: 'https://www.pingan.com/',
    path: '/subpackages/product/pages/detail/detail?id=21'
  },
  {
    id: 22, category: 'lease', intakeType: 'lease',
    institution: '远东宏信有限公司', region: '宁波市',
    name: '远东宏信·医疗/教育/建设租赁',
    rate: '以项目方案报价为准',
    desc: '远东宏信在华东地区（含宁波）为医疗、教育、基础建设等行业提供设备与设施融资租赁，支持直租与售后回租。',
    tags: ['上市公司', '医疗教育', '回租'], amount: '100万-3亿', term: '3-7年',
    suitable: '医院、学校、基建相关主体', cover: cover(22),
    complianceNote: COMPLIANCE, sourceName: '远东宏信官网', sourceUrl: 'https://www.fehorizon.com/',
    path: '/subpackages/product/pages/detail/detail?id=22'
  },
  // —— 汽车延保 · 宁波 ——
  {
    id: 23, category: 'warranty', intakeType: 'warranty',
    institution: '亮叶合作延保服务商', region: '宁波市',
    name: '宁波地区·新能源延保套餐',
    rate: '1299元起（按车型）',
    desc: '专为宁波新能源车主设计，覆盖三电系统、电控部件，合作网点覆盖鄞州、江北、北仑等区域。',
    tags: ['新能源', '三电保障', '宁波网点'], amount: '按车型定价', term: '1-3年',
    suitable: '宁波新能源乘用车车主', cover: cover(23),
    complianceNote: '延保保障范围以正式服务合同为准。', sourceName: '亮叶企服合作服务商', sourceUrl: 'https://data.stats.gov.cn/',
    path: '/subpackages/autoFinance/pages/warranty/warranty?type=ev'
  },
  {
    id: 24, category: 'warranty', intakeType: 'warranty',
    institution: '亮叶合作延保服务商', region: '宁波市',
    name: '宁波地区·豪华品牌全面延保',
    rate: '2499元起（按车型）',
    desc: '针对宝马、奔驰、奥迪等豪华品牌，覆盖发动机、变速箱、转向及空调系统，含4次/年道路救援。',
    tags: ['豪华品牌', '全面保障', '道路救援'], amount: '按车型定价', term: '1-3年',
    suitable: '豪华品牌过保或即将过保车辆', cover: cover(24),
    complianceNote: '延保保障范围以正式服务合同为准。', sourceName: '亮叶企服合作服务商', sourceUrl: 'https://data.stats.gov.cn/',
    path: '/subpackages/autoFinance/pages/warranty/warranty?type=premium'
  },
  {
    id: 25, category: 'warranty', intakeType: 'warranty',
    institution: '亮叶合作延保服务商', region: '宁波市',
    name: '宁波地区·营运车辆延保',
    rate: '1899元起（按车型）',
    desc: '面向网约车、物流车等营运车辆，强化发动机与传动系统保障，支持宁波全市合作检测网点预约。',
    tags: ['营运车辆', '网约车', '强化保障'], amount: '按车型定价', term: '1-2年',
    suitable: '宁波网约车、物流营运车辆', cover: cover(25),
    complianceNote: '营运车辆需通过车况检测方可承保。', sourceName: '亮叶企服合作服务商', sourceUrl: 'https://data.stats.gov.cn/',
    path: '/subpackages/autoFinance/pages/warranty/warranty?type=commercial'
  },
  // —— 合规风险识别 ——
  {
    id: 26, category: 'private', intakeType: 'business',
    institution: '亮叶合规服务中心', region: '宁波市',
    name: '民间借贷合同合规审阅',
    rate: '按件咨询收费',
    desc: '由合规专员审阅民间借贷合同条款，识别高利贷、砍头息、暴力催收等违法风险，出具书面提示意见。',
    tags: ['合同审阅', '高利贷识别', '维权指引'], amount: '按件评估', term: '按件',
    suitable: '已签订或拟签订民间借贷合同的个人/企业', cover: cover(26),
    complianceNote: '本服务不撮合民间借贷，仅提供风险识别。', sourceName: '亮叶风控资料库', sourceUrl: 'https://data.stats.gov.cn/',
    path: '/subpackages/product/pages/detail/detail?id=26'
  },
  {
    id: 27, category: 'private', intakeType: 'business',
    institution: '亮叶合规服务中心', region: '宁波市',
    name: '非法中介/套路贷识别咨询',
    rate: '免费咨询首诊',
    desc: '针对“AB贷”“包装流水”“征信修复”等常见套路，为宁波客户提供识别要点与维权路径指引。',
    tags: ['套路贷', 'AB贷', '征信修复骗局'], amount: '免费咨询', term: '按次',
    suitable: '遭遇可疑中介宣传的客户', cover: cover(27),
    complianceNote: '如遇诈骗请及时报警并保留证据。', sourceName: '亮叶风控资料库', sourceUrl: 'https://data.stats.gov.cn/',
    path: '/subpackages/tips/pages/list/list'
  }
]

const productDetails = {
  11: {
    highlights: ['宁波银行官方产品', '线上授权纳税数据', '最快当天出额（以审批为准）', '随借随还'],
    process: ['亮叶企服预审材料', '授权税务/银行数据', '宁波银行系统审批', '签约放款至对公账户'],
    materials: ['营业执照', '法人身份证', '近12个月纳税记录', '对公银行流水', '征信授权书'],
    faq: [{ q: '容易贷需要什么条件？', a: '通常要求企业注册在宁波、经营满一定期限、纳税正常，具体以宁波银行系统审核为准。' }]
  },
  12: {
    highlights: ['农行线上全流程', '无需抵押', '额度可循环', '宁波全市覆盖'],
    process: ['企业网银/掌银申请', '系统大数据测额', '人工复核', '签约用款'],
    materials: ['营业执照', '法人及实控人身份证', '经营流水', '纳税证明', '征信授权'],
    faq: [{ q: '微捷贷额度多久有效？', a: '额度有效期以农业银行审批结果为准，到期需重新申请。' }]
  },
  13: {
    highlights: ['建行结算客户优选', '线上测额', '随借随还', '宁波分行属地服务'],
    process: ['建行网银/手机银行申请', '大数据测额', '补充材料（如需）', '签约放款'],
    materials: ['营业执照', '法人身份证', '建行对公流水', '纳税数据授权', '用途说明'],
    faq: [{ q: '没有建行账户能申请吗？', a: '建议先开立对公结算账户并保持活跃流水，具体以建行政策为准。' }]
  },
  14: {
    highlights: ['宁波银行招牌产品', '公积金客户优选', '纯信用无抵押', '手机银行申请'],
    process: ['亮叶预审个人资质', '宁波银行白领通测额', '线下面签（如需）', '放款至借记卡'],
    materials: ['身份证', '工作证明/劳动合同', '公积金/社保缴存证明', '银行流水', '征信授权'],
    faq: [{ q: '白领通可以用于买房吗？', a: '不得用于购房首付或投资，仅限合规消费用途。' }]
  },
  15: {
    highlights: ['工行品牌保障', '线上测额', '多种还款方式', '宁波全市网点'],
    process: ['手机银行申请', '系统审批', '补充材料', '签约放款'],
    materials: ['身份证', '收入证明', '工行工资流水', '征信授权书'],
    faq: [{ q: '审批需要多久？', a: '资料齐全后通常1-3个工作日，以工行实际处理为准。' }]
  },
  16: {
    highlights: ['中行代发薪客户', '公积金联动', '消费用途明确', '宁波属地审批'],
    process: ['手机银行/网点申请', '资质审核', '额度审批', '签约用款'],
    materials: ['身份证', '收入证明', '公积金缴存证明', '征信授权'],
    faq: [{ q: '随心智贷和房贷有什么区别？', a: '个人消费贷不得用于购房，房产融资请选择抵押类经营贷产品。' }]
  },
  17: {
    highlights: ['工行e抵快贷', '线上房产评估', '经营用途', '宁波房产均可'],
    process: ['提交房产信息', '线上评估', '经营材料审核', '抵押登记放款'],
    materials: ['身份证', '房产证', '营业执照', '经营流水', '婚姻状况证明', '征信授权'],
    faq: [{ q: '抵押率多少？', a: '一般不超过评估价70%，宁波各区域政策略有差异。' }]
  },
  18: {
    highlights: ['宁波银行本地服务', '一抵二抵均可咨询', '大额经营周转', '专属客户经理'],
    process: ['房产评估', '经营尽调', '审批出额', '抵押登记放款'],
    materials: ['房产证', '营业执照', '法人身份证', '近6个月流水', '资金用途证明'],
    faq: [{ q: '二抵需要什么条件？', a: '需一抵余额加二抵金额不超过评估价一定比例，以银行审批为准。' }]
  },
  19: {
    highlights: ['邮储银行普惠', '个体户友好', '房产抵押', '宁波县域覆盖'],
    process: ['网点咨询', '房产评估', '材料审核', '抵押登记放款'],
    materials: ['身份证', '房产证', '营业执照或经营证明', '银行流水', '征信授权'],
    faq: [{ q: '商铺可以抵押吗？', a: '商业用房抵押政策因机构而异，建议先提交产权信息评估。' }]
  },
  20: {
    highlights: ['省属国企背景', '港口物流专长', '大额度设备融资', '宁波临港优势'],
    process: ['提交设备需求与报价', '租赁方案设计', '尽职调查', '签约起租'],
    materials: ['营业执照', '财务报表', '设备采购合同', '项目可行性说明'],
    faq: [{ q: '直租和回租区别？', a: '直租由租赁公司购买设备出租；回租是自有设备出售后再租回。' }]
  },
  21: {
    highlights: ['平安集团背书', '商用车专长', '全国网络', '宁波团队属地服务'],
    process: ['设备选型与报价', '租赁方案测算', '审批签约', '设备交付起租'],
    materials: ['营业执照', '法人身份证', '财务报表', '设备合同', '还款来源说明'],
    faq: [{ q: '期末可以买断吗？', a: '多数方案支持留购，具体以租赁合同约定为准。' }]
  },
  22: {
    highlights: ['医疗教育专长', '回租释放现金流', '华东地区经验', '宁波项目落地'],
    process: ['需求调研', '方案与报价', '审批', '设备交付/资金到位'],
    materials: ['事业单位法人证书或营业执照', '财务报表', '设备清单', '资金用途说明'],
    faq: [{ q: '医院设备可以回租吗？', a: '符合监管要求的医疗设备可开展售后回租，需个案评估。' }]
  },
  23: {
    highlights: ['三电系统保障', '宁波新能源网点', '电池健康检测', '道路救援2次/年'],
    process: ['选择套餐', '车辆检测', '签约付款', '保障生效'],
    materials: ['行驶证', '购车发票', '现有质保记录', '车辆检测报告'],
    faq: [{ q: '电池衰减保吗？', a: '自然衰减通常除外，具体以合同免责条款为准。' }]
  },
  24: {
    highlights: ['豪华品牌适配', '全面部件保障', '4次道路救援', '专属顾问'],
    process: ['预约检测', '套餐确认', '签约', '保障生效'],
    materials: ['行驶证', '保养记录', '4S店检测报告'],
    faq: [{ q: '过保多久还能买？', a: '通常原厂质保到期前后6个月内可投保，以检测为准。' }]
  },
  25: {
    highlights: ['营运车专属', '强化发动机保障', '全市检测网点', '快速理赔通道'],
    process: ['营运资质核验', '车况检测', '签约', '保障服务'],
    materials: ['行驶证', '营运证', '网约车平台截图（如适用）'],
    faq: [{ q: '网约车能保吗？', a: '需通过车况及营运记录审核，部分高里程车辆可能拒保。' }]
  }
}

const homeCategoryNav = [
  { id: 'business', title: '企业经营贷', desc: '容易贷·微捷贷·小微快贷', path: '/pages/products/products?category=business', icon: '🏢' },
  { id: 'personal', title: '个人消费贷', desc: '白领通·信用贷·随心智贷', path: '/pages/products/products?category=personal', icon: '👤' },
  { id: 'property', title: '房产抵押贷', desc: 'e抵快贷·房抵贷', path: '/pages/products/products?category=property', icon: '🏠' },
  { id: 'lease', title: '融资租赁', desc: '设备·商用车', path: '/pages/products/products?category=lease', icon: '⚙️' },
  { id: 'auto', title: '汽车金融', desc: '新车·二手车·车抵', path: '/subpackages/autoFinance/pages/list/list', icon: '🚗' },
  { id: 'warranty', title: '汽车延保', desc: '新能源·豪华·营运', path: '/subpackages/autoFinance/pages/warranty/warranty', icon: '🛡️' }
]

const ningboInstitutions = [
  { name: '宁波银行', type: '城商行', products: '容易贷、白领通、房抵贷', hot: true },
  { name: '工商银行宁波市分行', type: '国有大行', products: 'e抵快贷、个人信用贷' },
  { name: '农业银行宁波市分行', type: '国有大行', products: '微捷贷' },
  { name: '建设银行宁波市分行', type: '国有大行', products: '小微快贷' },
  { name: '中国银行宁波市分行', type: '国有大行', products: '随心智贷' },
  { name: '邮储银行宁波市分行', type: '国有大行', products: '房产抵押贷款' },
  { name: '浙江海港融资租赁', type: '融资租赁', products: '临港设备租赁' }
]

const financeCircleExtras = {
  institutionSupply: [
    { title: '宁波银行容易贷', amount: '最高300万', type: 'loan', tags: ['纳税贷', '宁波'] },
    { title: '工行宁波e抵快贷', amount: '最高1000万', type: 'loan', tags: ['房产抵押', '经营'] },
    { title: '农行微捷贷', amount: '最高200万', type: 'loan', tags: ['小微', '线上'] }
  ],
  hotPurposes: ['经营周转', '设备购置', '装修升级', '备货采购', '纳税合规周转', '新能源车辆购置'],
  feedPosts: [
    { id: 1, user: '张经理', avatar: '/images/avatar.webp', time: '10分钟前', content: '慈溪模具企业100万周转需求已匹配容易贷方案，材料清单已发送。', images: ['/subpackages/cases/images/cases/case-1.webp'], likes: 12, comments: 3, type: 'case', intakeProduct: 'business', intakeProductName: '经营贷进件' },
    { id: 2, user: '银行甬城支行', avatar: '/images/avatar.webp', time: '1小时前', content: '【机构供给】容易贷最高300万，纳税正常企业可申请，欢迎咨询。', images: [], likes: 28, comments: 5, type: 'supply' },
    { id: 3, user: '亮叶企服', avatar: '/images/logo.webp', time: '3小时前', content: '提醒：平台不收取前置费用，所有服务以正式合同约定为准。', images: ['/images/banner2.webp'], likes: 45, comments: 2, type: 'notice' }
  ],
  guides: [
    { title: '小微企业如何选贷？', desc: '有纳税数据优先容易贷/微捷贷；有房产选e抵快贷；有设备需求考虑融资租赁。' },
    { title: '发布需求后多久匹配？', desc: '工作时间内通常30分钟内专员联系，1-3个工作日出具初步方案。' },
    { title: '是否收取前置费用？', desc: '亮叶企服不收取前置保证金，所有费用以正式合同约定为准。' }
  ]
}

const extraClues = [
  { id: 4, type: 'new', title: '宁波江北首购家庭SUV', price: '22.5万', location: '浙江省宁波市江北区', province: '浙江省', city: '宁波市', district: '江北区', dealer: '宁波甬江汽车城', contact: '赵先生 137****3301', description: '家庭首购，关注比亚迪宋PLUS，首付预算6万，需匹配宁波银行车贷方案。', tags: ['新车', '宁波本地', '家庭首购'], source: 'official-form', externalId: 'ly-nb-004', status: '跟进中', createTime: '2025-07-02' },
  { id: 5, type: 'used', title: '鄞州二手车宝马3系', price: '15.8万', location: '浙江省宁波市鄞州区', province: '浙江省', city: '宁波市', district: '鄞州区', dealer: '鄞州精品二手车', contact: '孙女士 135****8822', description: '2020年宝马320Li，里程4.2万，需二手车按揭及延保咨询。', tags: ['二手车', '豪华品牌', '延保'], source: 'dealer-webhook', externalId: 'ly-nb-005', status: '待评估', createTime: '2025-07-01' },
  { id: 6, type: 'mortgage', title: '北仑物流企业车抵', price: '评估价35万', location: '浙江省宁波市北仑区', province: '浙江省', city: '宁波市', district: '北仑区', dealer: '线上进件', contact: '刘总 139****5566', description: '物流企业临时周转，名下厢式货车可抵押，希望不押车方案。', tags: ['车抵', '物流企业', '北仑'], source: 'website-form', externalId: 'ly-nb-006', status: '材料待补', createTime: '2025-06-30' },
  { id: 7, type: 'new', title: '慈溪制造业员工购车', price: '14.2万', location: '浙江省宁波市慈溪市', province: '浙江省', city: '宁波市', district: '慈溪市', dealer: '慈溪合作4S店', contact: '周先生 136****1199', description: '工厂员工团购新能源，需批量按揭方案咨询。', tags: ['新车', '团购', '新能源'], source: 'official-form', externalId: 'ly-nb-007', status: '待沟通', createTime: '2025-06-29' },
  { id: 8, type: 'lease', title: '镇海物流公司以租代购', price: '月租6800元', location: '浙江省宁波市镇海区', province: '浙江省', city: '宁波市', district: '镇海区', dealer: '亮叶合作租赁商', contact: '吴经理 138****7700', description: '物流公司需新增3台厢式货车，倾向以租代购模式，租期36期，到期回购。', tags: ['以租代购', '商用车', '物流'], source: 'official-form', externalId: 'ly-lease-008', status: '跟进中', createTime: '2025-07-02' },
  { id: 9, type: 'lease', title: '网约车司机以租代购', price: '月租4200元', location: '浙江省宁波市海曙区', province: '浙江省', city: '宁波市', district: '海曙区', dealer: '新能源出行中心', contact: '钱师傅 137****4412', description: '持证网约车司机，意向比亚迪秦PLUS EV以租代购，需了解押金与保险安排。', tags: ['以租代购', '网约车', '新能源'], source: 'dealer-webhook', externalId: 'ly-lease-009', status: '待评估', createTime: '2025-07-01' },
  { id: 10, type: 'lease', title: '奉化个体户设备以租代购', price: '月租5500元', location: '浙江省宁波市奉化区', province: '浙江省', city: '宁波市', district: '奉化区', dealer: '设备租赁联盟', contact: '何老板 139****2233', description: '餐饮配送个体户，需冷藏配送车以租代购方案，关注维保责任划分。', tags: ['以租代购', '个体户', '配送'], source: 'website-form', externalId: 'ly-lease-010', status: '材料待补', createTime: '2025-06-28' },
  { id: 11, type: 'business', title: '鄞州外贸企业100万周转', price: '100万', location: '浙江省宁波市鄞州区', province: '浙江省', city: '宁波市', district: '鄞州区', dealer: '亮叶企服', contact: '林总 136****8890', description: '外贸企业季节性备货，需100万经营周转，有纳税记录与对公流水，倾向宁波银行容易贷。', tags: ['企业贷', '外贸', '纳税贷'], source: 'official-form', externalId: 'ly-biz-011', status: '跟进中', createTime: '2025-07-03' },
  { id: 12, type: 'business', title: '余姚模具厂设备更新贷', price: '200万', location: '浙江省宁波市余姚市', province: '浙江省', city: '宁波市', district: '余姚市', dealer: '亮叶企服', contact: '黄厂长 135****6677', description: '模具制造企业计划更新CNC设备，需对接建行小微快贷与设备融资租赁组合方案。', tags: ['企业贷', '制造业', '设备'], source: 'official-form', externalId: 'ly-biz-012', status: '待评估', createTime: '2025-07-02' },
  { id: 13, type: 'business', title: '江北餐饮连锁扩张贷', price: '80万', location: '浙江省宁波市江北区', province: '浙江省', city: '宁波市', district: '江北区', dealer: '亮叶企服', contact: '马老板 138****5544', description: '本地餐饮连锁计划新开2家门店，需装修与备货资金，可提供租赁合同与近12个月流水。', tags: ['企业贷', '餐饮', '扩张'], source: 'dealer-webhook', externalId: 'ly-biz-013', status: '材料待补', createTime: '2025-07-01' },
  { id: 14, type: 'personal', title: '海曙事业单位白领通', price: '50万', location: '浙江省宁波市海曙区', province: '浙江省', city: '宁波市', district: '海曙区', dealer: '亮叶企服', contact: '郑女士 137****3322', description: '事业单位在编员工，公积金连续缴存36个月，意向宁波银行白领通消费贷用于装修。', tags: ['个人贷', '白领通', '公积金'], source: 'official-form', externalId: 'ly-per-014', status: '跟进中', createTime: '2025-07-02' },
  { id: 15, type: 'personal', title: '鄞州IT从业者信用贷', price: '30万', location: '浙江省宁波市鄞州区', province: '浙江省', city: '宁波市', district: '鄞州区', dealer: '亮叶企服', contact: '许先生 136****7788', description: '软件公司技术主管，月收入2.5万，无其他贷款，需30万信用贷用于家庭消费。', tags: ['个人贷', '信用贷', 'IT'], source: 'website-form', externalId: 'ly-per-015', status: '待沟通', createTime: '2025-07-01' },
  { id: 16, type: 'personal', title: '北仑工厂职工消费贷', price: '15万', location: '浙江省宁波市北仑区', province: '浙江省', city: '宁波市', district: '北仑区', dealer: '亮叶企服', contact: '丁师傅 139****9900', description: '制造业一线员工，有稳定工资流水，需15万消费贷用于子女教育支出。', tags: ['个人贷', '消费贷', '工薪'], source: 'official-form', externalId: 'ly-per-016', status: '待评估', createTime: '2025-06-30' },
  { id: 17, type: 'mortgage_house', title: '鄞州商铺抵押经营贷', price: '300万', location: '浙江省宁波市鄞州区', province: '浙江省', city: '宁波市', district: '鄞州区', dealer: '亮叶企服', contact: '沈总 138****1122', description: '名下鄞州核心商圈商铺，评估价约450万，需300万抵押经营周转，产权清晰无查封。', tags: ['房贷', '商铺抵押', '经营贷'], source: 'official-form', externalId: 'ly-house-017', status: '跟进中', createTime: '2025-07-03' },
  { id: 18, type: 'mortgage_house', title: '江北住宅二押咨询', price: '150万', location: '浙江省宁波市江北区', province: '浙江省', city: '宁波市', district: '江北区', dealer: '亮叶企服', contact: '冯女士 137****4455', description: '江北万达板块住宅，一押工行余额80万，评估价380万，咨询二押150万可行性。', tags: ['房贷', '二押', '住宅'], source: 'website-form', externalId: 'ly-house-018', status: '待评估', createTime: '2025-07-02' },
  { id: 19, type: 'mortgage_house', title: '慈溪自建房抵押贷', price: '80万', location: '浙江省宁波市慈溪市', province: '浙江省', city: '宁波市', district: '慈溪市', dealer: '亮叶企服', contact: '韩先生 136****6677', description: '慈溪城区自建房，有完整产权证明，需80万抵押贷用于厂房扩建。', tags: ['房贷', '自建房', '抵押'], source: 'official-form', externalId: 'ly-house-019', status: '材料待补', createTime: '2025-07-01' },
  { id: 20, type: 'other', title: '象山渔船经营贷咨询', price: '60万', location: '浙江省宁波市象山县', province: '浙江省', city: '宁波市', district: '象山县', dealer: '亮叶企服', contact: '宋船长 139****8811', description: '渔业合作社成员，需60万资金用于渔船维修与设备更新，咨询农行农户贷与经营贷组合。', tags: ['其它贷款', '渔业', '农户贷'], source: 'official-form', externalId: 'ly-other-020', status: '跟进中', createTime: '2025-07-02' },
  { id: 21, type: 'other', title: '宁海民宿装修贷', price: '40万', location: '浙江省宁波市宁海县', province: '浙江省', city: '宁波市', district: '宁海县', dealer: '亮叶企服', contact: '叶老板 137****2233', description: '前童古镇民宿经营者，需40万装修升级资金，有稳定经营流水与租赁合同。', tags: ['其它贷款', '民宿', '装修'], source: 'dealer-webhook', externalId: 'ly-other-021', status: '待沟通', createTime: '2025-07-01' },
  { id: 22, type: 'other', title: '高新区科技贷补贴咨询', price: '按项目', location: '浙江省宁波市高新区', province: '浙江省', city: '宁波市', district: '高新区', dealer: '亮叶企服', contact: '科创企业 138****5566', description: '高新技术企业，咨询科技贷、知识产权质押及政府贴息政策叠加方案。', tags: ['其它贷款', '科技贷', '补贴'], source: 'website-form', externalId: 'ly-other-022', status: '待评估', createTime: '2025-06-29' }
]

const extraDemands = [
  { id: 1006, type: 'funding', title: '慈溪模具企业100万周转', amount: '100万元', period: '1年', contact: '慈溪某模具厂', city: '宁波市', purpose: '备货采购', status: '匹配中', progress: 45, createdAt: '2025-07-03', tags: ['制造业', '宁波'] },
  { id: 1007, type: 'loan', title: '宁波银行容易贷产品供给', amount: '最高300万', period: '1-3年', contact: '宁波银行甬城支行', city: '宁波市', purpose: '机构供给', status: '可咨询', progress: 90, createdAt: '2025-07-02', tags: ['容易贷', '纳税贷'] },
  { id: 1008, type: 'funding', title: '鄞州餐饮连锁装修资金', amount: '60万元', period: '2年', contact: '鄞州餐饮老板', city: '宁波市', purpose: '装修升级', status: '初审中', progress: 25, createdAt: '2025-07-03', tags: ['餐饮', '消费贷'] }
]

module.exports = {
  extraProducts,
  productDetails,
  homeCategoryNav,
  ningboInstitutions,
  financeCircleExtras,
  extraClues,
  extraDemands,
  COMPLIANCE
}
