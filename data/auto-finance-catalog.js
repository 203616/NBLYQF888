/**
 * 汽车金融公开产品目录（持牌机构信息整理，利率/额度以机构审批为准）
 * 亮叶企服仅提供信息咨询与居间撮合
 */
const COMPLIANCE = '本平台仅提供金融信息咨询与居间撮合，具体条件以持牌机构审核及正式合同为准。'

const autoFinanceProducts = [
  {
    id: 'icbc-auto', intakeType: 'newCar', category: 'auto',
    institution: '中国工商银行', region: '宁波市',
    title: '工行汽车消费贷款',
    desc: '工商银行个人汽车消费贷款，支持新车、二手车购置，宁波地区可通过网点或手机银行咨询办理。',
    rate: '按LPR及客户资质定价', amount: '1-100万', term: '12-60期',
    tags: ['国有大行', '新车', '二手车'], sourceName: '中国工商银行官网', sourceUrl: 'https://www.icbc.com.cn/',
    cover: '/subpackages/product/images/products/product-1.webp', icon: '🆕',
    url: '/subpackages/autoFinance/pages/newCar/newCar?institution=icbc'
  },
  {
    id: 'ccb-auto', intakeType: 'newCar', category: 'auto',
    institution: '中国建设银行', region: '宁波市',
    title: '建行汽车贷款',
    desc: '建设银行"车e贷"汽车金融服务，宁波分行支持燃油及新能源乘用车按揭，可对接合作车商。',
    rate: '以建行审批定价为准', amount: '1-50万', term: '12-60期',
    tags: ['建设银行', '车e贷', '新能源'], sourceName: '中国建设银行官网', sourceUrl: 'https://www.ccb.com/',
    cover: '/subpackages/product/images/products/product-1.webp', icon: '🆕',
    url: '/subpackages/autoFinance/pages/newCar/newCar?institution=ccb'
  },
  {
    id: 'abc-auto', intakeType: 'newCar', category: 'auto',
    institution: '中国农业银行', region: '宁波市',
    title: '农行汽车消费贷',
    desc: '农业银行个人汽车消费贷款，宁波地区客户可凭收入证明、征信等资料向农行网点申请。',
    rate: '以农行审批定价为准', amount: '1-80万', term: '12-60期',
    tags: ['农业银行', '消费贷'], sourceName: '中国农业银行官网', sourceUrl: 'https://www.abchina.com/',
    cover: '/subpackages/product/images/products/product-1.webp', icon: '🆕',
    url: '/subpackages/autoFinance/pages/newCar/newCar?institution=abc'
  },
  {
    id: 'boc-auto', intakeType: 'newCar', category: 'auto',
    institution: '中国银行', region: '宁波市',
    title: '中行汽车分期贷款',
    desc: '中国银行汽车消费类贷款，宁波地区支持合作4S店直客模式，材料通过中行渠道提交。',
    rate: '以中行审批定价为准', amount: '1-50万', term: '12-48期',
    tags: ['中国银行', '4S店合作'], sourceName: '中国银行官网', sourceUrl: 'https://www.boc.cn/',
    cover: '/subpackages/product/images/products/product-1.webp', icon: '🆕',
    url: '/subpackages/autoFinance/pages/newCar/newCar?institution=boc'
  },
  {
    id: 'nbcb-auto', intakeType: 'newCar', category: 'auto',
    institution: '宁波银行', region: '宁波市',
    title: '宁波银行汽车分期',
    desc: '宁波银行本地汽车消费金融服务，面向宁波户籍或本地工作客户，支持新能源专项方案咨询。',
    rate: '以宁波银行审批为准', amount: '1-50万', term: '12-60期',
    tags: ['宁波银行', '本地优选', '新能源'], sourceName: '宁波银行官网', sourceUrl: 'https://www.nbcb.com.cn/',
    cover: '/subpackages/product/images/products/product-1.webp', icon: '🆕',
    url: '/subpackages/autoFinance/pages/newCar/newCar?institution=nbcb'
  },
  {
    id: 'psbc-auto', intakeType: 'newCar', category: 'auto',
    institution: '中国邮政储蓄银行', region: '宁波市',
    title: '邮储汽车消费贷款',
    desc: '邮储银行个人汽车消费贷款，宁波县域及城区网点均可受理，支持新车购置按揭咨询。',
    rate: '以邮储银行审批为准', amount: '1-30万', term: '12-48期',
    tags: ['邮储银行', '普惠'], sourceName: '中国邮政储蓄银行官网', sourceUrl: 'https://www.psbc.com/',
    cover: '/subpackages/product/images/products/product-1.webp', icon: '🆕',
    url: '/subpackages/autoFinance/pages/newCar/newCar?institution=psbc'
  },
  {
    id: 'cmb-auto', intakeType: 'newCar', category: 'auto',
    institution: '招商银行', region: '宁波市',
    title: '招行汽车分期',
    desc: '招商银行汽车消费贷款/分期服务，宁波分行支持优质客户信用类汽车融资方案。',
    rate: '以招行审批定价为准', amount: '1-50万', term: '12-60期',
    tags: ['招商银行', '信用类'], sourceName: '招商银行官网', sourceUrl: 'https://www.cmbchina.com/',
    cover: '/subpackages/product/images/products/product-1.webp', icon: '🆕',
    url: '/subpackages/autoFinance/pages/newCar/newCar?institution=cmb'
  },
  {
    id: 'pingan-auto', intakeType: 'newCar', category: 'auto',
    institution: '平安银行', region: '宁波市',
    title: '平安银行车主贷/新车贷',
    desc: '平安银行汽车相关融资服务，含新车按揭及车主信用类方案，宁波地区可线上预审咨询。',
    rate: '以平安银行审批为准', amount: '1-50万', term: '12-48期',
    tags: ['平安银行', '线上预审'], sourceName: '平安银行官网', sourceUrl: 'https://bank.pingan.com/',
    cover: '/subpackages/product/images/products/product-1.webp', icon: '🆕',
    url: '/subpackages/autoFinance/pages/newCar/newCar?institution=pingan'
  },
  {
    id: 'used-icbc', intakeType: 'usedCar', category: 'auto',
    institution: '中国工商银行', region: '宁波市',
    title: '工行二手车按揭',
    desc: '工商银行二手车贷款，结合车辆评估价、车龄与借款人资质审批，宁波合作二手车商可协助进件。',
    rate: '以工行审批为准', amount: '1-30万', term: '12-36期',
    tags: ['工商银行', '二手车'], sourceName: '中国工商银行官网', sourceUrl: 'https://www.icbc.com.cn/',
    cover: '/subpackages/product/images/products/product-2.webp', icon: '🔄',
    url: '/subpackages/autoFinance/pages/usedCar/usedCar?institution=icbc'
  },
  {
    id: 'used-ccb', intakeType: 'usedCar', category: 'auto',
    institution: '中国建设银行', region: '宁波市',
    title: '建行二手车贷款',
    desc: '建设银行二手车金融服务，要求车辆评估及过户手续齐全，宁波地区按建行政策执行。',
    rate: '以建行审批为准', amount: '1-30万', term: '12-36期',
    tags: ['建设银行', '二手车'], sourceName: '中国建设银行官网', sourceUrl: 'https://www.ccb.com/',
    cover: '/subpackages/product/images/products/product-2.webp', icon: '🔄',
    url: '/subpackages/autoFinance/pages/usedCar/usedCar?institution=ccb'
  },
  {
    id: 'used-nbcb', intakeType: 'usedCar', category: 'auto',
    institution: '宁波银行', region: '宁波市',
    title: '宁波银行二手车分期',
    desc: '宁波银行二手车按揭咨询，面向宁波本地购车客户，需第三方评估及合规交易凭证。',
    rate: '以宁波银行审批为准', amount: '1-25万', term: '12-36期',
    tags: ['宁波银行', '本地车源'], sourceName: '宁波银行官网', sourceUrl: 'https://www.nbcb.com.cn/',
    cover: '/subpackages/product/images/products/product-2.webp', icon: '🔄',
    url: '/subpackages/autoFinance/pages/usedCar/usedCar?institution=nbcb'
  },
  {
    id: 'mortgage-icbc', intakeType: 'mortgage', category: 'auto',
    institution: '中国工商银行', region: '宁波市',
    title: '工行车辆抵押贷',
    desc: '以本人名下车辆作为抵押物的个人经营或消费类融资，宁波工行按监管要求办理抵押登记。',
    rate: '以工行审批为准', amount: '5-50万', term: '6-36期',
    tags: ['工商银行', '车辆抵押'], sourceName: '中国工商银行官网', sourceUrl: 'https://www.icbc.com.cn/',
    cover: '/subpackages/product/images/products/product-3.webp', icon: '🔑',
    url: '/subpackages/autoFinance/pages/carMortgage/carMortgage?institution=icbc'
  },
  {
    id: 'mortgage-nbcb', intakeType: 'mortgage', category: 'auto',
    institution: '宁波银行', region: '宁波市',
    title: '宁波银行车辆抵押融资',
    desc: '宁波银行车辆抵押类融资咨询，适用于短期周转，需车辆权属清晰且通过评估。',
    rate: '以宁波银行审批为准', amount: '5-50万', term: '6-36期',
    tags: ['宁波银行', '车抵'], sourceName: '宁波银行官网', sourceUrl: 'https://www.nbcb.com.cn/',
    cover: '/subpackages/product/images/products/product-3.webp', icon: '🔑',
    url: '/subpackages/autoFinance/pages/carMortgage/carMortgage?institution=nbcb'
  },
  {
    id: 'mortgage-pingan', intakeType: 'mortgage', category: 'auto',
    institution: '平安银行', region: '宁波市',
    title: '平安车主贷（车抵类）',
    desc: '平安银行车主信用/车辆相关融资产品，宁波地区可咨询不押车方案，以审批结果为准。',
    rate: '以平安银行审批为准', amount: '3-50万', term: '6-36期',
    tags: ['平安银行', '车主贷'], sourceName: '平安银行官网', sourceUrl: 'https://bank.pingan.com/',
    cover: '/subpackages/product/images/products/product-3.webp', icon: '🔑',
    url: '/subpackages/autoFinance/pages/carMortgage/carMortgage?institution=pingan'
  },
  {
    id: 'ev-special', intakeType: 'newCar', category: 'auto',
    institution: '多家持牌机构', region: '宁波市',
    title: '新能源购车专项方案',
    desc: '对接工行、建行、宁波银行等新能源乘用车专项利率政策，含比亚迪、特斯拉、蔚来等品牌合作渠道。',
    rate: '以机构专项政策为准', amount: '5-50万', term: '12-60期',
    tags: ['新能源', '专项利率', '宁波'], sourceName: '各机构官网公开信息', sourceUrl: 'https://www.nbcb.com.cn/',
    cover: '/subpackages/product/images/products/product-1.webp', icon: '🆕',
    url: '/subpackages/autoFinance/pages/newCar/newCar?type=ev'
  },
  {
    id: 'commercial-auto', intakeType: 'newCar', category: 'auto',
    institution: '中国建设银行', region: '宁波市',
    title: '建行商用车/营运车融资',
    desc: '建设银行营运车辆、商用车按揭方案，适用于物流、网约车等合规营运主体，宁波分行属地审批。',
    rate: '以建行审批为准', amount: '10-80万', term: '12-48期',
    tags: ['商用车', '营运', '建行'], sourceName: '中国建设银行官网', sourceUrl: 'https://www.ccb.com/',
    cover: '/subpackages/product/images/products/product-3.webp', icon: '🔑',
    url: '/subpackages/autoFinance/pages/newCar/newCar?type=commercial'
  },
  {
    id: 'saic-finance', intakeType: 'newCar', category: 'auto',
    institution: '上汽通用汽车金融', region: '宁波市',
    title: '上汽通用汽车金融分期',
    desc: '上汽通用旗下汽车金融公司，为别克、雪佛兰、凯迪拉克等品牌提供厂家金融分期，宁波4S店可办理。',
    rate: '以厂家金融方案为准', amount: '按车型', term: '12-60期',
    tags: ['厂家金融', '上汽通用'], sourceName: '上汽通用汽车金融官网', sourceUrl: 'https://www.saicgmfc.com/',
    cover: '/subpackages/product/images/products/product-1.webp', icon: '🆕',
    url: '/subpackages/autoFinance/pages/newCar/newCar?institution=saicgmfc'
  },
  {
    id: 'faw-finance', intakeType: 'newCar', category: 'auto',
    institution: '一汽汽车金融', region: '宁波市',
    title: '一汽金融购车分期',
    desc: '一汽集团旗下汽车金融，服务大众、奥迪、丰田等品牌经销店，宁波合作4S店提供厂家贴息方案咨询。',
    rate: '以厂家金融方案为准', amount: '按车型', term: '12-60期',
    tags: ['厂家金融', '一汽'], sourceName: '一汽汽车金融官网', sourceUrl: 'https://www.faf.com.cn/',
    cover: '/subpackages/product/images/products/product-1.webp', icon: '🆕',
    url: '/subpackages/autoFinance/pages/newCar/newCar?institution=faw'
  },
  {
    id: 'gac-finance', intakeType: 'newCar', category: 'auto',
    institution: '广汽汇理汽车金融', region: '宁波市',
    title: '广汽汇理汽车金融',
    desc: '广汽集团旗下汽车金融公司，为传祺、本田等品牌提供购车分期，宁波授权经销商可受理。',
    rate: '以厂家金融方案为准', amount: '按车型', term: '12-60期',
    tags: ['厂家金融', '广汽'], sourceName: '广汽汇理官网', sourceUrl: 'https://www.gacsofinco.com/',
    cover: '/subpackages/product/images/products/product-1.webp', icon: '🆕',
    url: '/subpackages/autoFinance/pages/newCar/newCar?institution=gac'
  },
  {
    id: 'bmw-finance', intakeType: 'newCar', category: 'auto',
    institution: '宝马汽车金融', region: '宁波市',
    title: '宝马汽车金融方案',
    desc: '宝马集团在华汽车金融，宁波宝马/MINI授权经销商提供灵活分期、残值保障等厂家方案咨询。',
    rate: '以厂家金融方案为准', amount: '按车型', term: '12-60期',
    tags: ['豪华品牌', '厂家金融'], sourceName: '宝马汽车金融官网', sourceUrl: 'https://www.bmw.com.cn/',
    cover: '/subpackages/product/images/products/product-1.webp', icon: '🆕',
    url: '/subpackages/autoFinance/pages/newCar/newCar?institution=bmw'
  },
  {
    id: 'genius-finance', intakeType: 'newCar', category: 'auto',
    institution: '吉致汽车金融', region: '宁波市',
    title: '吉致汽车金融分期',
    desc: '吉利控股旗下汽车金融公司（原GMAC），为吉利、领克、沃尔沃等品牌提供厂家金融分期，宁波授权经销商可办理。',
    rate: '以吉致金融方案为准', amount: '按车型', term: '12-60期',
    tags: ['厂家金融', '吉利系'], sourceName: '吉致汽车金融官网', sourceUrl: 'https://www.geniusafc.com/',
    cover: '/subpackages/product/images/products/product-1.webp', icon: '🆕',
    url: '/subpackages/autoFinance/pages/newCar/newCar?institution=genius'
  },
  {
    id: 'ruifude-finance', intakeType: 'newCar', category: 'auto',
    institution: '瑞福德汽车金融', region: '宁波市',
    title: '瑞福德汽车金融',
    desc: '瑞福德汽车金融有限公司，为江淮、大众等品牌经销商提供汽车消费信贷，宁波合作4S店可受理。',
    rate: '以瑞福德审批为准', amount: '按车型', term: '12-60期',
    tags: ['厂家金融', '瑞福德'], sourceName: '瑞福德汽车金融官网', sourceUrl: 'https://www.rffinance.com.cn/',
    cover: '/subpackages/product/images/products/product-1.webp', icon: '🆕',
    url: '/subpackages/autoFinance/pages/newCar/newCar?institution=ruifude'
  },
  {
    id: 'huachen-finance', intakeType: 'newCar', category: 'auto',
    institution: '华晨东亚汽车金融', region: '宁波市',
    title: '华晨东亚汽车金融',
    desc: '华晨宝马合资汽车金融公司，为宝马、MINI等品牌提供专属金融方案，宁波宝马授权店可咨询办理。',
    rate: '以华晨东亚方案为准', amount: '按车型', term: '12-60期',
    tags: ['豪华品牌', '华晨东亚'], sourceName: '华晨东亚汽车金融官网', sourceUrl: 'https://www.bmw-brilliance.cn/',
    cover: '/subpackages/product/images/products/product-1.webp', icon: '🆕',
    url: '/subpackages/autoFinance/pages/newCar/newCar?institution=huachen'
  },
  {
    id: 'dongfeng-finance', intakeType: 'newCar', category: 'auto',
    institution: '东风汽车金融', region: '宁波市',
    title: '东风汽车金融分期',
    desc: '东风汽车金融有限公司，为日产、本田、标致等品牌提供厂家金融分期，宁波合作经销商可受理。',
    rate: '以东风金融方案为准', amount: '按车型', term: '12-60期',
    tags: ['厂家金融', '东风'], sourceName: '东风汽车金融官网', sourceUrl: 'https://www.dongfeng-finance.com/',
    cover: '/subpackages/product/images/products/product-1.webp', icon: '🆕',
    url: '/subpackages/autoFinance/pages/newCar/newCar?institution=dongfeng'
  },
  {
    id: 'changan-finance', intakeType: 'newCar', category: 'auto',
    institution: '长安汽车金融', region: '宁波市',
    title: '长安汽车金融',
    desc: '长安汽车金融有限公司，为长安、深蓝、阿维塔等品牌提供购车分期，宁波授权经销商可办理。',
    rate: '以长安金融方案为准', amount: '按车型', term: '12-60期',
    tags: ['厂家金融', '长安'], sourceName: '长安汽车金融官网', sourceUrl: 'https://www.caffinance.com.cn/',
    cover: '/subpackages/product/images/products/product-1.webp', icon: '🆕',
    url: '/subpackages/autoFinance/pages/newCar/newCar?institution=changan'
  },
  {
    id: 'mercedes-finance', intakeType: 'newCar', category: 'auto',
    institution: '梅赛德斯-奔驰汽车金融', region: '宁波市',
    title: '奔驰汽车金融方案',
    desc: '梅赛德斯-奔驰汽车金融，宁波奔驰授权经销商提供灵活分期、星徽管家等厂家金融方案咨询。',
    rate: '以奔驰金融方案为准', amount: '按车型', term: '12-60期',
    tags: ['豪华品牌', '奔驰'], sourceName: '梅赛德斯-奔驰汽车金融官网', sourceUrl: 'https://www.mercedes-benz.com.cn/',
    cover: '/subpackages/product/images/products/product-1.webp', icon: '🆕',
    url: '/subpackages/autoFinance/pages/newCar/newCar?institution=mercedes'
  },
  {
    id: 'toyota-finance', intakeType: 'newCar', category: 'auto',
    institution: '丰田汽车金融', region: '宁波市',
    title: '丰田汽车金融分期',
    desc: '丰田汽车金融（中国）有限公司，为丰田、雷克萨斯品牌提供厂家金融分期，宁波4S店可咨询办理。',
    rate: '以丰田金融方案为准', amount: '按车型', term: '12-60期',
    tags: ['厂家金融', '丰田'], sourceName: '丰田汽车金融官网', sourceUrl: 'https://www.toyota-finance.com.cn/',
    cover: '/subpackages/product/images/products/product-1.webp', icon: '🆕',
    url: '/subpackages/autoFinance/pages/newCar/newCar?institution=toyota'
  }
]

module.exports = { autoFinanceProducts, COMPLIANCE }
