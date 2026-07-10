const mockDashboard = {
  stats: [
    { name: '待办任务', count: 8, icon: '📋' },
    { name: '待审核', count: 3, icon: '🔍' },
    { name: '会议', count: 2, icon: '📅' },
    { name: '待报税', count: 5, icon: '💰' }
  ],
  tasks: [
    { id: 't1', title: '审核李明的进件申请', desc: '个人车贷申请已提交全套材料，需在48小时内完成初审', type: '进件审核', due: '2026-07-10', priority: '高', status: '待处理', assignee: '张经理' },
    { id: 't2', title: '处理王芳的抵押合同', desc: '抵押合同编号 M20260708 已生成，请用印并归档', type: '合同处理', due: '2026-07-11', priority: '高', status: '待处理', assignee: '李专员' },
    { id: 't3', title: '跟进易融圈赵总的资金需求', desc: '赵总发布500万资金需求，优先匹配有抵押产品', type: '客户跟进', due: '2026-07-09', priority: '中', status: '待沟通', assignee: '' },
    { id: 't4', title: '审核新合作机构资质', desc: '广发银行提交合作意向书及相关资质文件', type: '机构审核', due: '2026-07-14', priority: '中', status: '进行中', assignee: '王总监' },
    { id: 't5', title: '6月渠道分润对账', desc: '与各代理商确认6月分润数据，编制结算单', type: '财务', due: '2026-07-12', priority: '中', status: '进行中', assignee: '刘会计' },
    { id: 't6', title: '税务申报提醒', desc: '本季度增值税及附加税申报截止日期为7月15日', type: '税务', due: '2026-07-15', priority: '高', status: '待处理', assignee: '' },
    { id: 't7', title: '新产品定价审核', desc: '新能源汽车金融产品定价方案需经风控会审议', type: '产品', due: '2026-07-18', priority: '低', status: '进行中', assignee: '陈总' },
    { id: 't8', title: '周报提交', desc: '提交本周工作周报及下周工作计划', type: '行政', due: '2026-07-12', priority: '低', status: '待处理', assignee: '' }
  ],
  meetings: [
    { id: 'm1', title: '风控委员会月度会议', time: '2026-07-10 14:00', place: '3楼大会议室', host: '陈总', agenda: '1. 6月不良率分析 2. 新产品风控模型评审 3. 7月风控策略调整' },
    { id: 'm2', title: '渠道合作商季度交流会', time: '2026-07-15 09:30', place: '2楼多功能厅', host: '王总监', agenda: '1. Q2业务回顾 2. 新产品发布 3. 优秀代理商表彰 4. Q3政策解读' },
    { id: 'm3', title: '税务合规培训', time: '2026-07-18 15:00', place: '线上腾讯会议', host: '刘会计', agenda: '最新税务政策解读、数电票实务操作' }
  ]
}

const mockTaxData = {
  taxpayerTypes: [
    { id: 'individual', name: '个体工商户', label: '适合个人经营、小店、工作室', icon: '👤', taxRates: '3%~35%' },
    { id: 'general', name: '一般纳税人', label: '适合企业、公司、有完整账务', icon: '🏢', taxRates: '6%~25%' }
  ],
  taxCategories: [
    { id: 'vat', name: '增值税', desc: '销售货物或提供服务产生的税款', icon: '🧾', baseRate: '3%' },
    { id: 'cit', name: '企业所得税', desc: '企业应纳税所得额缴纳的税款', icon: '📊', baseRate: '25%' },
    { id: 'pit', name: '个人所得税', desc: '个人经营所得缴纳的税款', icon: '👤', baseRate: '5%~35%' },
    { id: 'surtax', name: '附加税', desc: '增值税附加（城建税、教育费附加等）', icon: '📎', baseRate: '12%' },
    { id: 'stamp', name: '印花税', desc: '合同、账簿等应税凭证', icon: '📜', baseRate: '0.03%~0.05%' }
  ],
  taxPeriods: [
    { id: 'monthly', name: '月报', desc: '每月申报一次', freq: 12 },
    { id: 'quarterly', name: '季度报税', desc: '每季度申报一次', freq: 4 },
    { id: 'annual', name: '年度报税', desc: '每年申报一次', freq: 1 }
  ],
  taxCalendar: [
    { month: '7月', items: [{ name: '增值税', deadline: '07月15日', status: '未截止' }, { name: '企业所得税季度预缴', deadline: '07月15日', status: '未截止' }, { name: '附加税', deadline: '07月15日', status: '未截止' }] },
    { month: '8月', items: [{ name: '增值税', deadline: '08月15日', status: '未截止' }, { name: '附加税', deadline: '08月15日', status: '未截止' }] },
    { month: '9月', items: [{ name: '增值税', deadline: '09月15日', status: '未截止' }, { name: '附加税', deadline: '09月15日', status: '未截止' }] },
    { month: '10月', items: [{ name: '增值税', deadline: '10月24日', status: '未截止' }, { name: '企业所得税季度预缴', deadline: '10月24日', status: '未截止' }, { name: '附加税', deadline: '10月24日', status: '未截止' }] }
  ],
  taxHistory: [
    { id: 'th1', taxpayerType: '一般纳税人', taxCategory: '增值税', period: '2026年06月', declareType: '正常申报', amount: '12,580.00', status: '已缴款', date: '2026-06-12', certificateNo: 'WZ202606120001', detail: { taxableIncome: '420,000.00', deductions: '15,600.00', taxRate: '3%', taxDue: '12,600.00', paid: '12,580.00' } },
    { id: 'th2', taxpayerType: '一般纳税人', taxCategory: '企业所得税', period: '2026年Q2', declareType: '正常申报', amount: '28,750.00', status: '已申报', date: '2026-06-28', certificateNo: '', detail: { taxableIncome: '230,000.00', deductions: '45,000.00', taxRate: '25%', taxDue: '46,250.00', paid: '-', taxCredit: '17,500.00', finalDue: '28,750.00' } },
    { id: 'th3', taxpayerType: '一般纳税人', taxCategory: '附加税', period: '2026年06月', declareType: '正常申报', amount: '1,512.00', status: '已缴款', date: '2026-06-12', certificateNo: 'WZ202606120002', detail: { vatAmount: '12,600.00', surtaxRate: '12%', taxDue: '1,512.00', paid: '1,512.00' } },
    { id: 'th4', taxpayerType: '个体工商户', taxCategory: '个人所得税', period: '2026年Q1', declareType: '正常申报', amount: '3,650.00', status: '已完结', date: '2026-04-10', certificateNo: 'WZ202604100005', detail: { taxableIncome: '85,000.00', deductions: '12,000.00', taxDue: '3,650.00', paid: '3,650.00' } },
    { id: 'th5', taxpayerType: '个体工商户', taxCategory: '增值税', period: '2026年05月', declareType: '0申报', amount: '0.00', status: '已申报', date: '2026-05-10', certificateNo: '', detail: { taxableIncome: '0.00', remarks: '本期无收入，零申报' } }
  ],
  wizardSteps: ['选择类型', '选择周期', '填写数据', '预览确认', '提交完成']
}

const mockAgentData = {
  applications: [
    { id: 'a1', company: '融易达金融服务有限公司', contact: '赵总', phone: '138****6789', region: '广东省深圳市', qualification: '营业执照、金融许可证、法人身份证', status: '已通过', applyDate: '2026-06-20', remark: '优质合作商，推荐人：王总监' },
    { id: 'a2', company: '快捷车贷服务中心', contact: '钱经理', phone: '159****2345', region: '四川省成都市', qualification: '营业执照、法人身份证', status: '待审核', applyDate: '2026-07-05', remark: '' },
    { id: 'a3', company: '安信汽车金融工作室', contact: '孙先生', phone: '177****8901', region: '浙江省杭州市', qualification: '营业执照、法人身份证、业务案例', status: '待审核', applyDate: '2026-07-07', remark: '已电话沟通，资质齐全' },
    { id: 'a4', company: '万利达资产管理公司', contact: '李总', phone: '136****4567', region: '上海市浦东新区', qualification: '营业执照、私募基金牌照', status: '已驳回', applyDate: '2026-06-15', remark: '资质不全，缺少金融许可证，驳回理由：需补充完整资质文件' },
    { id: 'a5', company: '鑫源汽车销售服务公司', contact: '周总', phone: '188****5678', region: '广东省广州市', qualification: '营业执照、法人身份证、汽车销售资质', status: '已通过', applyDate: '2026-05-10', remark: '已签约，分润比例12%' }
  ],
  commissionRules: [
    { id: 'cr1', productType: '新车分期', baseRate: '1.5%', tier1Rate: '2.0%', tier2Rate: '2.5%', desc: '月放款量<100万1.5%，100~300万2.0%，>300万2.5%' },
    { id: 'cr2', productType: '二手车分期', baseRate: '2.0%', tier1Rate: '2.5%', tier2Rate: '3.0%', desc: '月放款量<80万2.0%，80~200万2.5%，>200万3.0%' },
    { id: 'cr3', productType: '车抵贷', baseRate: '1.0%', tier1Rate: '1.5%', tier2Rate: '2.0%', desc: '月放款量<50万1.0%，50~150万1.5%，>150万2.0%' },
    { id: 'cr4', productType: '企业经营贷', baseRate: '0.8%', tier1Rate: '1.2%', tier2Rate: '1.5%', desc: '月放款量<200万0.8%，200~500万1.2%，>500万1.5%' }
  ],
  commissionReports: [
    { period: '2026年06月', totalCommission: '56,800.00', orderCount: 42, details: [
      { agent: '融易达金融服务有限公司', amount: '28,500.00', orders: 18 },
      { agent: '鑫源汽车销售服务公司', amount: '18,300.00', orders: 15 },
      { agent: '信达车贷服务中心', amount: '10,000.00', orders: 9 }
    ]},
    { period: '2026年05月', totalCommission: '48,200.00', orderCount: 35, details: [
      { agent: '融易达金融服务有限公司', amount: '22,000.00', orders: 14 },
      { agent: '鑫源汽车销售服务公司', amount: '15,200.00', orders: 12 },
      { agent: '信达车贷服务中心', amount: '11,000.00', orders: 9 }
    ]},
    { period: '2026年Q2', totalCommission: '156,800.00', orderCount: 118, details: [
      { agent: '融易达金融服务有限公司', amount: '72,500.00', orders: 48 },
      { agent: '鑫源汽车销售服务公司', amount: '48,600.00', orders: 40 },
      { agent: '信达车贷服务中心', amount: '35,700.00', orders: 30 }
    ]}
  ],
  performanceData: [
    { agent: '融易达', amount: 285000, color: '#0F3D2E', chartLabel: '28.5万' },
    { agent: '鑫源', amount: 183000, color: '#1F6B4B', chartLabel: '18.3万' },
    { agent: '信达', amount: 100000, color: '#D4A84B', chartLabel: '10.0万' },
    { agent: '安信', amount: 65000, color: '#52c41a', chartLabel: '6.5万' },
    { agent: '快捷', amount: 42000, color: '#faad14', chartLabel: '4.2万' }
  ],
  productTypes: ['新车分期', '二手车分期', '车抵贷', '企业经营贷']
}

const mockFinanceData = {
  records: [
    { id: 'f1', type: 'income', category: '渠道分润收入', amount: 28500.00, date: '2026-07-08', note: '融易达6月分润结算', paymentMethod: '银行转账' },
    { id: 'f2', type: 'income', category: '服务费收入', amount: 12000.00, date: '2026-07-05', note: '新车分期服务费-客户赵明', paymentMethod: '对公账户' },
    { id: 'f3', type: 'expense', category: '办公支出', amount: 3500.00, date: '2026-07-04', note: '办公用品采购-得力文具', paymentMethod: '微信支付' },
    { id: 'f4', type: 'expense', category: '人员工资', amount: 65000.00, date: '2026-07-03', note: '6月工资发放（含社保）', paymentMethod: '银行代发' },
    { id: 'f5', type: 'expense', category: '差旅费', amount: 2800.00, date: '2026-07-02', note: '王总监杭州出差费用', paymentMethod: '企业备用金' },
    { id: 'f6', type: 'income', category: '渠道分润收入', amount: 18300.00, date: '2026-06-30', note: '鑫源5月分润结算', paymentMethod: '银行转账' },
    { id: 'f7', type: 'income', category: '咨询费收入', amount: 8000.00, date: '2026-06-28', note: '企业经营贷咨询费', paymentMethod: '对公账户' },
    { id: 'f8', type: 'expense', category: '营销推广', amount: 5800.00, date: '2026-06-25', note: '百度SEM推广费', paymentMethod: '对公账户' },
    { id: 'f9', type: 'expense', category: '税费', amount: 15800.00, date: '2026-06-15', note: '5月增值税及附加税', paymentMethod: '税务扣缴' },
    { id: 'f10', type: 'income', category: '服务费收入', amount: 9500.00, date: '2026-06-20', note: '车抵贷服务费-客户钱华', paymentMethod: '银行转账' }
  ],
  paymentReminders: [
    { id: 'pr1', title: '办公室房租', amount: 28000, dueDate: '2026-07-15', status: '待支付', type: '固定支出' },
    { id: 'pr2', title: '7月社保缴纳', amount: 18500, dueDate: '2026-07-10', status: '待支付', type: '固定支出' },
    { id: 'pr3', title: '税务申报缴款', amount: 12800, dueDate: '2026-07-15', status: '待支付', type: '税费' },
    { id: 'pr4', title: '6月分润结算', amount: 56800, dueDate: '2026-07-20', status: '待支付', type: '分润支出' }
  ]
}

const mockProductData = {
  products: [
    { id: 'p1', name: '新车轻松贷', type: '新车分期', rateRange: '2.5%~4.5%', partner: '工商银行', status: '已上架', applyDate: '2026-06-01', desc: '适用于购买新车客户，期限12-60期，最高额度100万' },
    { id: 'p2', name: '二手车优享贷', type: '二手车分期', rateRange: '3.5%~6.0%', partner: '平安银行', status: '已上架', applyDate: '2026-05-15', desc: '适用于购买二手车客户，期限12-48期，最高额度50万' },
    { id: 'p3', name: '车辆抵押贷', type: '车抵贷', rateRange: '6.0%~12.0%', partner: '中航信托', status: '审核中', applyDate: '2026-07-01', desc: '全款车/按揭车均可抵押，最高可贷车辆估值80%' },
    { id: 'p4', name: '新能源专享贷', type: '新车分期', rateRange: '2.0%~3.5%', partner: '招商银行', status: '审核中', applyDate: '2026-07-03', desc: '仅限新能源汽车，享受绿色金融优惠利率' },
    { id: 'p5', name: '经营快贷', type: '企业经营贷', rateRange: '4.5%~8.0%', partner: '建设银行', status: '草稿', applyDate: '2026-06-25', desc: '小微企业信用贷款，最高额度200万' },
    { id: 'p6', name: '车主信用贷', type: '车抵贷', rateRange: '5.0%~10.0%', partner: '微众银行', status: '已下架', applyDate: '2026-04-01', desc: '已持有车辆车主专属，纯信用无抵押' }
  ],
  agentsForAuth: [
    { id: 'ag1', name: '融易达金融服务有限公司', authorizedProducts: ['p1', 'p2'] },
    { id: 'ag2', name: '鑫源汽车销售服务公司', authorizedProducts: ['p1', 'p2', 'p3'] },
    { id: 'ag3', name: '信达车贷服务中心', authorizedProducts: ['p1'] },
    { id: 'ag4', name: '安信汽车金融工作室', authorizedProducts: [] }
  ],
  reviewRecords: [
    { id: 'rv1', productName: '新能源专享贷', applicant: '产品部-张明', applyDate: '2026-07-03', status: '初审通过', currentStep: '待终审', history: [{ step: '提交申请', time: '2026-07-03 09:30', operator: '张明', comment: '产品方案已准备完毕' }, { step: '产品部初审', time: '2026-07-04 14:20', operator: '李主管', comment: '利率合理，市场竞争力强，同意' }] },
    { id: 'rv2', productName: '车辆抵押贷', applicant: '产品部-王芳', applyDate: '2026-07-01', status: '初审通过', currentStep: '待终审', history: [{ step: '提交申请', time: '2026-07-01 11:00', operator: '王芳', comment: '' }, { step: '产品部初审', time: '2026-07-02 16:30', operator: '李主管', comment: '风控模型需补充压力测试数据，其余OK' }] },
    { id: 'rv3', productName: '经营快贷', applicant: '产品部-张明', applyDate: '2026-06-25', status: '草稿', currentStep: '未提交', history: [] }
  ]
}

const mockTemplateData = {
  categories: [
    { id: 'all', name: '全部' },
    { id: 'contract', name: '合同模板' },
    { id: 'form', name: '表单模板' },
    { id: 'document', name: '文档模板' }
  ],
  templates: [
    { id: 'tm1', category: 'contract', title: '居间服务合同', templateNo: 'CT-2026-001', version: 'v2.3', updateDate: '2026-06-15', icon: '📝', desc: '适用于金融信息咨询服务场景的标准居间合同，包含双方权利义务、服务费用、保密条款等', content: '居间服务合同\n\n甲方（委托人）：________\n乙方（居间人）：亮叶企服\n\n第一条 服务内容\n乙方为甲方提供金融信息咨询及居间撮合服务，协助甲方对接符合条件的资金方。\n\n第二条 服务费用\n甲方应于签订借款合同后____日内，按实际融资金额的____%向乙方支付居间服务费。\n\n第三条 保密义务\n双方对本合同内容及履行过程中知悉的对方商业秘密负有保密义务。\n\n第四条 争议解决\n本合同履行中发生争议，双方应友好协商解决；协商不成的，提交乙方所在地人民法院诉讼解决。' },
    { id: 'tm2', category: 'contract', title: '借款合同', templateNo: 'CT-2026-002', version: 'v3.1', updateDate: '2026-06-10', icon: '📜', desc: '民间借贷/机构借款标准合同模板，支持个人及企业借款场景', content: '借款合同\n\n出借方：________\n借款方：________\n\n第一条 借款金额\n出借方同意向借款方提供借款人民币________元（大写：________）。\n\n第二条 借款期限\n借款期限自____年__月__日起至____年__月__日止。\n\n第三条 利率及还款方式\n借款年利率为____%。还款方式为：□等额本息 □先息后本 □到期一次性还本付息。\n\n第四条 违约责任\n借款方未按期还款的，每逾期一日按未还金额的____%支付违约金。' },
    { id: 'tm3', category: 'contract', title: '融资咨询服务协议', templateNo: 'CT-2026-003', version: 'v2.0', updateDate: '2026-05-20', icon: '🤝', desc: '为融资客户提供全方位融资咨询服务的专项协议', content: '融资咨询服务协议\n\n甲方：________\n乙方：亮叶企服\n\n第一条 服务内容\n1.1 乙方根据甲方融资需求提供融资方案设计、资金方推荐、资料整理等咨询服务。\n1.2 乙方协助甲方完成融资申请材料的准备与提报。\n\n第二条 服务期限\n自本协议签署之日起____个月内有效。\n\n第三条 服务费用\n融资成功后，甲方按实际融资金额的____%支付咨询服务费。\n\n第四条 排他条款\n服务期限内，甲方不得通过其他渠道就同一融资需求寻求服务。' },
    { id: 'tm4', category: 'contract', title: '保密协议', templateNo: 'CT-2026-004', version: 'v1.5', updateDate: '2026-04-12', icon: '🔒', desc: '用于保护双方商业秘密及客户信息的标准保密协议', content: '保密协议\n\n甲方：________\n乙方：________\n\n第一条 保密范围\n包括但不限于：客户信息、财务数据、经营信息、技术资料、商业计划等。\n\n第二条 保密期限\n本协议保密义务自签署之日起____年内有效。\n\n第三条 违约责任\n违反保密义务的一方应赔偿对方因此遭受的全部损失，并支付违约金人民币____元。' },
    { id: 'tm5', category: 'form', title: '进件申请表', templateNo: 'FM-2026-001', version: 'v4.2', updateDate: '2026-07-01', icon: '📋', desc: '客户业务进件标准申请表，包含基本信息、融资需求、资信情况等', content: '进件申请表\n\n申请人姓名：________ 身份证号：________\n联系电话：________ 所属机构：________\n\n融资需求：\n□ 新车分期 □ 二手车分期 □ 车辆抵押 □ 企业经营贷 □ 消费贷\n融资金额：________元 融资期限：________期\n\n收入情况：月收入________元\n资产情况：□ 有房产 □ 有车辆 □ 有存款 □ 其他\n\n征信授权：本人授权查询个人征信报告 签名：________' },
    { id: 'tm6', category: 'form', title: '客户信息登记表', templateNo: 'FM-2026-002', version: 'v3.0', updateDate: '2026-06-18', icon: '👤', desc: '完整的客户基础信息登记表格，用于客户档案管理', content: '客户信息登记表\n\n姓名：________ 性别：□男 □女 出生日期：________\n身份证号：________ 婚姻状况：________\n户籍地址：________ 现居住址：________\n\n工作单位：________ 职务：________ 工作年限：________\n月收入：________元 单位电话：________\n\n紧急联系人：________ 关系：________ 电话：________' },
    { id: 'tm7', category: 'form', title: '车辆评估表', templateNo: 'FM-2026-003', version: 'v2.1', updateDate: '2026-05-30', icon: '🚗', desc: '车辆抵押/贷款业务所需的标准车辆价值评估表', content: '车辆评估表\n\n车辆信息\n品牌：________ 车型：________ 车牌号：________\n车架号：________ 发动机号：________\n首次上牌日期：________ 行驶里程：________公里\n\n车辆状况：\n外观：□优 □良 □中 □差\n内饰：□优 □良 □中 □差\n发动机：□正常 □异常\n变速箱：□正常 □异常\n\n评估价值：________元 评估人：________ 评估日期：________' },
    { id: 'tm8', category: 'form', title: '抵押合同模板', templateNo: 'FM-2026-004', version: 'v3.2', updateDate: '2026-06-25', icon: '🏠', desc: '车辆/房产抵押业务标准抵押合同文书', content: '抵押合同\n\n抵押人：________ 抵押权人：________\n\n第一条 抵押物\n抵押物为：□车辆（车牌号：________） □房产（坐落：________）\n\n第二条 担保范围\n主合同项下的全部债务，包括本金、利息、违约金、损害赔偿金及实现抵押权的费用。\n\n第三条 抵押期间\n自____年__月__日起至____年__月__日止。\n\n第四条 抵押人义务\n妥善保管抵押物，不得擅自处分或设定其他担保。' },
    { id: 'tm9', category: 'document', title: '融资方案建议书', templateNo: 'DC-2026-001', version: 'v2.2', updateDate: '2026-06-08', icon: '📊', desc: '为客户量身定制的融资产品组合方案建议书', content: '融资方案建议书\n\n致：________ 客户\n\n一、客户需求概述\n融资金额：________元 融资期限：________\n资金用途：________\n\n二、推荐方案\n方案一：________ 产品 金额________元 利率________ 期限________\n方案二：________ 产品 金额________元 利率________ 期限________\n\n三、方案对比分析\n（融资成本、还款压力、审批效率等多维度对比）\n\n四、推荐结论\n建议选择方案________，综合融资成本最低，审批效率最高。' },
    { id: 'tm10', category: 'document', title: '客户回访记录', templateNo: 'DC-2026-002', version: 'v1.3', updateDate: '2026-04-20', icon: '📞', desc: '贷后/售后客户回访标准化记录模板', content: '客户回访记录\n\n客户姓名：________ 合同编号：________ 回访日期：________\n回访方式：□电话 □微信 □上门 □其他\n\n回访内容：\n1. 对服务满意度评价：□非常满意 □满意 □一般 □不满意\n2. 是否有其他融资需求：□是 □否\n3. 是否推荐他人使用本平台服务：□是 □否\n\n客户反馈意见：\n________________________________\n\n回访人：________ 下次回访日期：________' },
    { id: 'tm11', category: 'document', title: '风险告知书', templateNo: 'DC-2026-003', version: 'v2.0', updateDate: '2026-05-15', icon: '⚠️', desc: '向客户充分告知融资业务相关风险的标准告知文书', content: '风险告知书\n\n尊敬的客户：\n\n在您办理融资业务前，请仔细阅读以下风险提示内容：\n\n一、利率风险\n融资利率可能随市场变化而调整，具体以合同约定为准。\n\n二、信用风险\n如未能按时足额还款，将影响您的个人征信记录，并可能产生罚息。\n\n三、抵押物风险\n抵押贷款业务中，如发生违约，抵押物可能被处置。\n\n四、信息真实义务\n您应确保提供的所有资料真实、完整、有效，否则由此产生的后果由您自行承担。\n\n本人已阅读并充分理解上述风险提示。\n客户签名：________ 日期：________' }
  ]
}

function formatDate(d) {
  const dt = new Date(d)
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${dt.getFullYear()}-${m}-${day}`
}

function getToday() {
  return formatDate(new Date())
}

function filterTaxHistory(history, filter) {
  if (filter === 'all') return history
  return history.filter(h => h.status === filter)
}

function filterAgents(apps, filter) {
  if (filter === 'all') return apps
  return apps.filter(a => a.status === filter)
}

function filterFinanceByMonth(records, month) {
  if (!month || month === 'all') return records
  return records.filter(r => r.date.startsWith(month))
}

function getFinanceMonthOverview(records, month) {
  const filtered = filterFinanceByMonth(records, month)
  const income = filtered.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
  const expense = filtered.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
  const incomeItems = filtered.filter(r => r.type === 'income').reduce((acc, r) => {
    const existing = acc.find(i => i.category === r.category)
    if (existing) existing.amount += r.amount
    else acc.push({ category: r.category, amount: r.amount })
    return acc
  }, [])
  const expenseItems = filtered.filter(r => r.type === 'expense').reduce((acc, r) => {
    const existing = acc.find(i => i.category === r.category)
    if (existing) existing.amount += r.amount
    else acc.push({ category: r.category, amount: r.amount })
    return acc
  }, [])
  return { totalIncome: income, totalExpense: expense, balance: income - expense, incomeItems, expenseItems }
}

function filterProducts(products, filter) {
  if (filter === 'all') return products
  return products.filter(p => p.status === filter)
}

// 账号角色名称映射
const ACCOUNT_TYPE_LABELS = {
  admin: '管理员',
  agent: '代理商',
  staff: '业务员'
}

// 当前登录用户所属角色信息（模拟）
const ACCOUNT_PROFILES = {
  admin: { name: '亮叶企服管理后台', agentName: null },
  agent: { name: '融易达金融服务有限公司', agentName: '融易达' },
  staff: { name: '业务员-张明', agentName: null }
}

Page({
  data: {
    today: getToday(),
    /** 账号类型：admin / agent / staff */
    userAccountType: 'staff',
    currentAccountProfile: ACCOUNT_PROFILES.staff,
    ACCOUNT_TYPE_LABELS: ACCOUNT_TYPE_LABELS,
    /** 调试面板 */
    showDebugPanel: false,
    currentTab: 0,
    tabs: [
      { id: 'dashboard', name: '工作台', icon: '🏠' },
      { id: 'tax', name: '税务报账', icon: '💰' },
      { id: 'agent', name: '代理商', icon: '🤝' },
      { id: 'finance', name: '财务管理', icon: '📊' },
      { id: 'product', name: '产品准入', icon: '📦' },
      { id: 'templates', name: '模板中心', icon: '📋' }
    ],

    stats: [],
    tasks: [],
    filteredTasks: [],
    meetings: [],
    taskFilter: 'all',
    taskFilterLabel: '全部',

    taxCurrentStep: 1,
    taxTotalSteps: 5,
    taxpayerTypes: mockTaxData.taxpayerTypes,
    selectedTaxpayerType: null,
    taxCategories: mockTaxData.taxCategories,
    taxPeriods: mockTaxData.taxPeriods,
    selectedTaxPeriod: null,
    selectedTaxCategory: null,
    selectDeclareType: null,
    declareTypeOptions: [
      { id: 'normal', name: '正常申报', desc: '有实际经营收入和支出' },
      { id: 'zero', name: '0申报', desc: '本期无收入或无经营活动' }
    ],
    taxFormData: { taxableIncome: '', deductions: '', remarks: '' },
    taxPreview: null,
    taxHistory: mockTaxData.taxHistory.map(function(h) {
      return Object.assign({}, h, { amountPositive: parseFloat(String(h.amount).replace(/,/g, '')) > 0 })
    }),
    filteredTaxHistory: mockTaxData.taxHistory.map(function(h) {
      return Object.assign({}, h, { amountPositive: parseFloat(String(h.amount).replace(/,/g, '')) > 0 })
    }),
    taxCalendar: mockTaxData.taxCalendar,
    taxCalcInput: { income: '', deductions: '', taxRate: '' },
    taxCalcResult: null,
    taxHistoryFilter: 'all',
    selectedHistoryItem: null,
    wizardSteps: mockTaxData.wizardSteps,

    agentCurrentTab: 'apply',
    agentTabs: [
      { id: 'apply', name: '申请入驻', icon: '📝' },
      { id: 'list', name: '代理商列表', icon: '👥' },
      { id: 'commission', name: '分润配置', icon: '⚙️' },
      { id: 'report', name: '分润报表', icon: '📈' },
      { id: 'performance', name: '业绩统计', icon: '📊' }
    ],
    agentForm: { company: '', contact: '', phone: '', region: '', qualification: '', remark: '' },
    agentApplications: mockAgentData.applications,
    filteredAgents: mockAgentData.applications,
    commissionRules: mockAgentData.commissionRules,
    commissionReports: mockAgentData.commissionReports,
    /** 按角色过滤的分润数据 */
    filteredCommissionReports: mockAgentData.commissionReports,
    filteredPerformanceReports: mockAgentData.performanceData,
    performanceData: mockAgentData.performanceData,
    agentStatusFilter: 'all',
    agentSelectedReport: null,
    maxPerformanceAmount: Math.max(...mockAgentData.performanceData.map(d => d.amount)),
    totalAgentAmount: mockAgentData.performanceData.reduce((s, i) => s + i.amount, 0),
    totalAgentFormatted: (function() {
      const a = mockAgentData.performanceData.reduce((s, i) => s + i.amount, 0);
      return a >= 10000 ? (a / 10000).toFixed(1) + '万' : String(a);
    })(),
    latestOrderCount: mockAgentData.commissionReports[0] ? mockAgentData.commissionReports[0].orderCount : 0,

    financeCurrentTab: 'overview',
    financeTabs: [
      { id: 'overview', name: '月度概览', icon: '📊' },
      { id: 'records', name: '收支记录', icon: '📋' },
      { id: 'reports', name: '财务报表', icon: '📑' },
      { id: 'reminders', name: '收付款提醒', icon: '🔔' }
    ],
    financeRecords: mockFinanceData.records,
    filteredFinanceRecords: mockFinanceData.records,
    financeOverviewData: {
      month: '2026年07月',
      totalIncome: 40500,
      totalExpense: 71300,
      balance: -30800,
      totalIncome_str: '¥40,500',
      totalExpense_str: '¥71,300',
      balance_str: '-¥30,800',
      balanceClass: 'deficit',
      incomeItems: [],
      expenseItems: []
    },
    financeFilterMonth: '2026-07',
    financeMonths: ['2026-07', '2026-06', '2026-05', '2026-04'],
    financeMonthLabels: { '2026-07': '7月', '2026-06': '6月', '2026-05': '5月', '2026-04': '4月' },
    financeReminders: mockFinanceData.paymentReminders.map(r => ({
      ...r,
      amount_str: '¥' + Number(r.amount).toLocaleString()
    })),
    financeShowForm: false,
    financeForm: { type: 'income', category: '', amount: '', date: '', note: '' },

    productCurrentTab: 'list',
    productTabs: [
      { id: 'list', name: '产品列表', icon: '📋' },
      { id: 'apply', name: '上架申请', icon: '📝' },
      { id: 'authorize', name: '产品授权', icon: '🔑' },
      { id: 'review', name: '准入审核', icon: '✅' }
    ],
    products: mockProductData.products,
    filteredProducts: mockProductData.products,
    productForm: { name: '', type: '', rateRange: '', partner: '', desc: '', status: '草稿', contactPerson: '', termRange: '', targetCustomer: '' },
    agentProductAuth: mockProductData.agentsForAuth,
    reviewRecords: mockProductData.reviewRecords,
    productStatusFilter: 'all',
    productTypeOptions: ['新车分期', '二手车分期', '车抵贷', '企业经营贷'],
    selectedReview: null,

    templateCurrentCategory: 'all',
    templateCategories: mockTemplateData.categories,
    allTemplates: mockTemplateData.templates,
    filteredTemplates: mockTemplateData.templates,
    templatePreview: null,
    templateFavorites: [],
    wizardProgressText: '步骤 1/5：选择纳税人类型',
    financeCompletedReminders: [],
    agentDetailItem: null,
    confirmAction: null,
    productFormExtra: { contactPerson: '', termRange: '', targetCustomer: '' },
    productDetailItem: null,
    productStats: { online: 0, reviewing: 0, draft: 0, offline: 0 },
    templateSearchKeyword: ''
  },

  /* ==================== 生命周期 ==================== */
  onLoad() {
    wx.setNavigationBarTitle({ title: 'OA工作台' })
    this.loadDashboardData()
    this.computeFinanceData()
    this.computeProductData()
    const favs = wx.getStorageSync('oa_template_favorites') || []
    this.setData({ templateFavorites: favs })
    this.updateWizardProgressText()
    // 读取账号类型并应用角色过滤
    this.applyAccountType()
  },

  onShow() {
    this.loadDashboardData()
    this.computeFinanceData()
  },

  /* ==================== Tab切换 ==================== */
  switchTab(e) {
    const idx = parseInt(e.currentTarget.dataset.index)
    this.setData({ currentTab: idx })
    // 切换Tab时刷新对应模块数据
    if (idx === 3) this.computeFinanceData()
    if (idx === 4) this.computeProductData()
    wx.pageScrollTo({ scrollTop: 0, duration: 200 })
  },

  /* ==================== 工作台 ==================== */
  loadDashboardData() {
    const data = mockDashboard
    const meetings = (data.meetings || []).map(m => ({ ...m, ...this.parseMeetingTime(m.time) }))
    const tasks = (data.tasks || []).map(t => ({ ...t, priorityKey: { '高': 'high', '中': 'medium', '低': 'low' }[t.priority] || 'medium' }))
    this.setData({ stats: data.stats || [], tasks, meetings }, () => this.applyTaskFilter())
  },

  parseMeetingTime(timeStr = '') {
    const parts = String(timeStr).split(' ')
    return { dayLabel: parts[0] || '待定', timeShort: parts[1] || timeStr }
  },

  applyTaskFilter() {
    const { tasks, taskFilter } = this.data
    let filtered = tasks
    if (taskFilter === 'pending') filtered = tasks.filter(t => t.status === '待处理' || t.status === '待沟通')
    else if (taskFilter === 'processing') filtered = tasks.filter(t => t.status === '进行中')
    this.setData({ filteredTasks: filtered })
  },

  toggleTaskFilter() {
    const next = this.data.taskFilter === 'all' ? 'pending' : this.data.taskFilter === 'pending' ? 'processing' : 'all'
    const labels = { all: '全部', pending: '待处理', processing: '进行中' }
    this.setData({ taskFilter: next, taskFilterLabel: labels[next] }, () => this.applyTaskFilter())
  },

  onStatTap(e) {
    const name = e.currentTarget.dataset.name
    const statNavMap = {
      '待办任务': () => wx.showToast({ title: '请查看下方待办列表', icon: 'none' }),
      '待审核': () => { this.setData({ currentTab: 2 }); wx.pageScrollTo({ scrollTop: 0, duration: 200 }) },
      '会议': () => wx.showToast({ title: '请查看下方会议通知', icon: 'none' }),
      '待报税': () => { this.setData({ currentTab: 1 }); wx.pageScrollTo({ scrollTop: 0, duration: 200 }) }
    }
    const action = statNavMap[name]
    if (action) action()
  },

  handleTaskTap(e) {
    const task = this.data.tasks.find(item => String(item.id) === String(e.currentTarget.dataset.id))
    if (!task) return
    const navMap = {
      '税务': () => { this.setData({ currentTab: 1 }); wx.pageScrollTo({ scrollTop: 0, duration: 200 }) },
      '财务': () => { this.setData({ currentTab: 3 }); wx.pageScrollTo({ scrollTop: 0, duration: 200 }) },
      '产品': () => { this.setData({ currentTab: 4 }); wx.pageScrollTo({ scrollTop: 0, duration: 200 }) },
      '进件审核': () => wx.navigateTo({ url: '/subpackages/intake/pages/index/index' }),
      '合同处理': () => wx.showToast({ title: '跳转合同管理', icon: 'none' }),
      '客户跟进': () => wx.switchTab({ url: '/pages/financeCircle/financeCircle' }),
      '机构审核': () => { this.setData({ currentTab: 2 }); wx.pageScrollTo({ scrollTop: 0, duration: 200 }) },
    }
    const navAction = navMap[task.type]
    if (navAction) {
      wx.showModal({
        title: task.title,
        content: `${task.desc}\n\n类型：${task.type}\n截止：${task.due}\n状态：${task.status}${task.assignee ? '\n负责人：' + task.assignee : ''}`,
        confirmText: '去处理',
        cancelText: '关闭',
        success: (res) => { if (res.confirm) navAction() }
      })
    } else {
      wx.showModal({
        title: task.title,
        content: `${task.desc}\n\n类型：${task.type}\n截止：${task.due}\n状态：${task.status}${task.assignee ? '\n负责人：' + task.assignee : ''}`,
        confirmText: '标记跟进',
        cancelText: '关闭',
        success: (res) => { if (res.confirm) wx.showToast({ title: '已更新跟进状态', icon: 'success' }) }
      })
    }
  },

  handleMeetingTap(e) {
    const meeting = this.data.meetings.find(m => String(m.id) === String(e.currentTarget.dataset.id))
    if (!meeting) return
    wx.showModal({
      title: meeting.title,
      content: `时间：${meeting.time}\n地点：${meeting.place}\n主持：${meeting.host}${meeting.agenda ? '\n议程：' + meeting.agenda : ''}`,
      confirmText: '添加到日历',
      cancelText: '关闭',
      success: (res) => { if (res.confirm) wx.showToast({ title: '已添加日历提醒', icon: 'success' }) }
    })
  },

  goIntake() { wx.navigateTo({ url: '/subpackages/intake/pages/index/index?productType=workflow' }) },
  goFinanceCircle() { wx.switchTab({ url: '/pages/financeCircle/financeCircle' }) },
  goDocs() { wx.navigateTo({ url: '/subpackages/profile/pages/docs/docs' }) },
  goChat() { wx.navigateTo({ url: '/subpackages/service/pages/chat/chat' }) },

  /* ==================== 税务报税 ==================== */

  selectTaxpayerType(e) {
    const typeId = e.currentTarget.dataset.id
    const type = this.data.taxpayerTypes.find(t => t.id === typeId)
    if (!type) return
    this.setData({ selectedTaxpayerType: type, selectedTaxCategory: null })
  },

  selectDeclareType(e) {
    const id = e.currentTarget.dataset.id
    const dt = this.data.declareTypeOptions.find(d => d.id === id)
    if (!dt) return
    this.setData({ selectDeclareType: dt })
  },

  selectTaxPeriod(e) {
    const periodId = e.currentTarget.dataset.id
    const period = this.data.taxPeriods.find(p => p.id === periodId)
    if (!period) return
    this.setData({ selectedTaxPeriod: period })
  },

  selectTaxCategory(e) {
    const catId = e.currentTarget.dataset.id
    const cat = this.data.taxCategories.find(c => c.id === catId)
    if (!cat) return
    this.setData({ selectedTaxCategory: cat })
  },

  taxInputChange(e) {
    const field = e.currentTarget.dataset.field
    const val = e.detail.value
    this.setData({ [`taxFormData.${field}`]: val })
  },

  taxPrevStep() {
    let step = this.data.taxCurrentStep
    if (step > 1) this.setData({ taxCurrentStep: step - 1 })
    this.updateWizardProgressText()
    wx.pageScrollTo({ scrollTop: 0, duration: 200 })
  },

  taxNextStep() {
    const step = this.data.taxCurrentStep
    const { selectedTaxpayerType, selectedTaxPeriod, selectedTaxCategory, selectDeclareType, taxFormData } = this.data

    if (step === 1) {
      if (!selectedTaxpayerType) { wx.showToast({ title: '请选择纳税人类型', icon: 'none' }); return }
    } else if (step === 2) {
      if (!selectedTaxPeriod || !selectedTaxCategory || !selectDeclareType) { wx.showToast({ title: '请选择完整信息', icon: 'none' }); return }
    } else if (step === 3) {
      if (selectDeclareType && selectDeclareType.id === 'normal' && (!taxFormData.taxableIncome || !taxFormData.deductions)) {
        wx.showToast({ title: '请填写收入和扣除金额', icon: 'none' }); return
      }
      const income = parseFloat(taxFormData.taxableIncome) || 0
      const deductions = parseFloat(taxFormData.deductions) || 0
      const baseRate = parseFloat((selectedTaxCategory.baseRate || '3%').replace('%', ''))
      const taxableAmount = Math.max(0, income - deductions)
      const taxDue = (taxableAmount * baseRate / 100).toFixed(2)
      this.setData({
        taxPreview: {
          taxpayerType: selectedTaxpayerType.name,
          taxCategory: selectedTaxCategory.name,
          period: selectedTaxPeriod.name,
          declareType: selectDeclareType ? selectDeclareType.name : '',
          taxableIncome: income.toFixed(2),
          deductions: deductions.toFixed(2),
          taxableAmount: taxableAmount.toFixed(2),
          taxRate: selectedTaxCategory.baseRate,
          taxDue: taxDue,
          remarks: taxFormData.remarks || '无'
        }
      })
    }

    if (step < 5) this.setData({ taxCurrentStep: step + 1 })
    this.updateWizardProgressText()
    wx.pageScrollTo({ scrollTop: 0, duration: 200 })
  },

  submitTax() {
    wx.showLoading({ title: '提交中...' })
    setTimeout(() => {
      wx.hideLoading()
      const { taxPreview, taxHistory, taxHistoryFilter } = this.data
      const newRecord = {
        id: 'th' + Date.now(),
        taxpayerType: taxPreview.taxpayerType,
        taxCategory: taxPreview.taxCategory,
        period: taxPreview.period,
        declareType: taxPreview.declareType,
        amount: taxPreview.taxDue,
        status: '已申报',
        date: getToday(),
        detail: { taxableIncome: taxPreview.taxableIncome, deductions: taxPreview.deductions, taxRate: taxPreview.taxRate, taxDue: taxPreview.taxDue },
        amountPositive: parseFloat(String(taxPreview.taxDue).replace(/,/g, '')) > 0
      }
      const updatedHistory = [newRecord, ...taxHistory]
      this.setData({
        taxCurrentStep: 5,
        taxHistory: updatedHistory,
        filteredTaxHistory: filterTaxHistory(updatedHistory, taxHistoryFilter),
        taxFormData: { taxableIncome: '', deductions: '', remarks: '' }
      })
      wx.showToast({ title: '申报成功！', icon: 'success' })
    }, 1500)
  },

  resetTaxWizard() {
    this.setData({
      taxCurrentStep: 1,
      selectedTaxpayerType: null,
      selectedTaxPeriod: null,
      selectedTaxCategory: null,
      selectDeclareType: null,
      taxFormData: { taxableIncome: '', deductions: '', remarks: '' },
      taxPreview: null
    })
    this.updateWizardProgressText()
  },

  updateWizardProgressText() {
    const stepNames = ['选择纳税人类型', '选择周期与税种', '填写报税数据', '预览确认', '提交完成']
    const step = this.data.taxCurrentStep
    const text = `步骤 ${step}/5：${stepNames[step - 1] || ''}`
    this.setData({ wizardProgressText: text })
  },

  deleteTaxRecord(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该报税记录吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          const { taxHistory, taxHistoryFilter } = this.data
          const updated = taxHistory.filter(h => h.id !== id)
          this.setData({
            taxHistory: updated,
            filteredTaxHistory: filterTaxHistory(updated, taxHistoryFilter),
            selectedHistoryItem: null
          })
          wx.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  },

  taxCalcInputChange(e) {
    const field = e.currentTarget.dataset.field
    const val = e.detail.value
    this.setData({ [`taxCalcInput.${field}`]: val })
  },

  calculateTax() {
    const { income, deductions, taxRate } = this.data.taxCalcInput
    if (!income || !taxRate) {
      wx.showToast({ title: '请填写收入金额和税率', icon: 'none' })
      return
    }
    const i = parseFloat(income)
    const d = parseFloat(deductions) || 0
    const r = parseFloat(taxRate)
    const taxable = Math.max(0, i - d)
    const tax = taxable * r / 100
    this.setData({
      taxCalcResult: {
        income: i.toFixed(2),
        deductions: d.toFixed(2),
        taxableAmount: taxable.toFixed(2),
        taxRate: r.toFixed(1) + '%',
        taxDue: tax.toFixed(2)
      }
    })
  },

  clearTaxCalc() {
    this.setData({ taxCalcInput: { income: '', deductions: '', taxRate: '' }, taxCalcResult: null })
  },

  onTaxHistoryFilter(e) {
    const filter = e.currentTarget.dataset.filter
    const filtered = filterTaxHistory(this.data.taxHistory, filter)
    this.setData({ taxHistoryFilter: filter, filteredTaxHistory: filtered })
  },

  showTaxDetail(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.taxHistory.find(h => h.id === id)
    if (!item) return
    this.setData({ selectedHistoryItem: item })
  },

  closeTaxDetail() {
    this.setData({ selectedHistoryItem: null })
  },

  /* ==================== 代理商 ==================== */

  switchAgentTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ agentCurrentTab: tab })
  },

  agentFormInput(e) {
    const field = e.currentTarget.dataset.field
    const val = e.detail.value
    this.setData({ [`agentForm.${field}`]: val })
  },

  submitAgentForm() {
    const { agentForm, agentApplications, agentStatusFilter } = this.data
    if (!agentForm.company || !agentForm.contact || !agentForm.phone) {
      wx.showToast({ title: '请填写企业名称、联系人和手机号', icon: 'none' })
      return
    }
    wx.showLoading({ title: '提交中...' })
    setTimeout(() => {
      wx.hideLoading()
      const newApp = {
        id: 'a' + Date.now(),
        company: agentForm.company,
        contact: agentForm.contact,
        phone: agentForm.phone,
        region: agentForm.region || '待补充',
        qualification: agentForm.qualification || '待补充',
        status: '待审核',
        applyDate: getToday(),
        remark: agentForm.remark || ''
      }
      const updated = [newApp, ...agentApplications]
      this.setData({
        agentApplications: updated,
        filteredAgents: filterAgents(updated, agentStatusFilter),
        agentForm: { company: '', contact: '', phone: '', region: '', qualification: '', remark: '' },
        agentCurrentTab: 'list'
      })
      wx.showToast({ title: '申请已提交，等待审核', icon: 'success' })
    }, 1000)
  },

  setAgentStatusFilter(e) {
    const filter = e.currentTarget.dataset.filter
    const filtered = filterAgents(this.data.agentApplications, filter)
    this.setData({ agentStatusFilter: filter, filteredAgents: filtered })
  },

  approveAgent(e) {
    const id = e.currentTarget.dataset.id
    const { agentApplications, agentStatusFilter } = this.data
    const updated = agentApplications.map(a => a.id === id ? { ...a, status: '已通过' } : a)
    this.setData({
      agentApplications: updated,
      filteredAgents: filterAgents(updated, agentStatusFilter)
    })
    wx.showToast({ title: '已通过该代理商申请', icon: 'success' })
  },

  rejectAgent(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '驳回申请',
      content: '确认驳回该代理商申请？',
      success: (res) => {
        if (res.confirm) {
          const { agentApplications, agentStatusFilter } = this.data
          const updated = agentApplications.map(a => a.id === id ? { ...a, status: '已驳回' } : a)
          this.setData({
            agentApplications: updated,
            filteredAgents: filterAgents(updated, agentStatusFilter)
          })
          wx.showToast({ title: '已驳回', icon: 'success' })
        }
      }
    })
  },

  showCommissionReport(e) {
    const period = e.currentTarget.dataset.period
    const report = this.data.commissionReports.find(r => r.period === period)
    if (!report) return
    this.setData({ agentSelectedReport: report })
  },

  closeCommissionReport() {
    this.setData({ agentSelectedReport: null })
  },

  showAgentDetail(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.agentApplications.find(a => a.id === id)
    if (!item) return
    this.setData({ agentDetailItem: item })
  },

  closeAgentDetail() {
    this.setData({ agentDetailItem: null })
  },

  confirmApproveAgent(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认通过',
      content: '确定要通过该代理商的入驻申请吗？',
      success: (res) => {
        if (res.confirm) {
          const { agentApplications, agentStatusFilter } = this.data
          const updated = agentApplications.map(a => a.id === id ? { ...a, status: '已通过' } : a)
          this.setData({
            agentApplications: updated,
            filteredAgents: filterAgents(updated, agentStatusFilter)
          })
          wx.showToast({ title: '已通过该代理商申请', icon: 'success' })
        }
      }
    })
  },

  confirmRejectAgent(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认驳回',
      content: '确定要驳回该代理商的入驻申请吗？需要填写驳回理由。',
      success: (res) => {
        if (res.confirm) {
          const { agentApplications, agentStatusFilter } = this.data
          const updated = agentApplications.map(a => a.id === id ? { ...a, status: '已驳回' } : a)
          this.setData({
            agentApplications: updated,
            filteredAgents: filterAgents(updated, agentStatusFilter)
          })
          wx.showToast({ title: '已驳回', icon: 'success' })
        }
      }
    })
  },

  copyCommissionReport() {
    const report = this.data.agentSelectedReport
    if (!report) return
    let text = `分润报表 - ${report.period}\n`
    text += `总佣金：¥${report.totalCommission}\n`
    text += `总订单数：${report.orderCount} 单\n`
    report.details.forEach(d => {
      text += `${d.agent}：¥${d.amount}（${d.orders}单）\n`
    })
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
      }
    })
  },

  /* ==================== 财务管理 ==================== */

  computeFinanceData() {
    const { financeRecords, financeFilterMonth } = this.data
    const filtered = filterFinanceByMonth(financeRecords, financeFilterMonth)
    let overview = getFinanceMonthOverview(financeRecords, financeFilterMonth)
    overview = {
      ...overview,
      totalIncome_str: '¥' + Number(overview.totalIncome).toLocaleString(),
      totalExpense_str: '¥' + Number(overview.totalExpense).toLocaleString(),
      balance_str: (overview.balance >= 0 ? '+' : '') + '¥' + Number(Math.abs(overview.balance)).toLocaleString(),
      balanceClass: overview.balance >= 0 ? 'balance' : 'deficit',
      incomeItems: (overview.incomeItems || []).map(item => ({
        ...item,
        amount_str: '¥' + Number(item.amount).toLocaleString()
      })),
      expenseItems: (overview.expenseItems || []).map(item => ({
        ...item,
        amount_str: '¥' + Number(item.amount).toLocaleString()
      }))
    }
    this.setData({
      filteredFinanceRecords: filtered.map(r => ({
        ...r,
        amount_str: (r.type === 'income' ? '+' : '-') + '¥' + Number(r.amount).toLocaleString()
      })),
      financeOverviewData: {
        month: financeFilterMonth ? financeFilterMonth.replace('-', '年') + '月' : '',
        ...overview
      }
    })
  },

  switchFinanceTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ financeCurrentTab: tab })
  },

  setFinanceType(e) {
    const type = e.currentTarget.dataset.value
    this.setData({ 'financeForm.type': type })
  },

  financeInputChange(e) {
    const field = e.currentTarget.dataset.field
    const val = e.detail.value
    this.setData({ [`financeForm.${field}`]: val })
  },

  toggleFinanceForm() {
    this.setData({ financeShowForm: !this.data.financeShowForm })
  },

  submitFinanceRecord() {
    const { financeForm, financeRecords, financeFilterMonth } = this.data
    if (!financeForm.category || !financeForm.amount) {
      wx.showToast({ title: '请填写分类和金额', icon: 'none' })
      return
    }
    const newRec = {
      id: 'f' + Date.now(),
      type: financeForm.type,
      category: financeForm.category,
      amount: parseFloat(financeForm.amount),
      date: financeForm.date || getToday(),
      note: financeForm.note || '',
      paymentMethod: '手动录入'
    }
    const updated = [newRec, ...financeRecords]
    this.setData({
      financeRecords: updated,
      financeForm: { type: 'income', category: '', amount: '', date: '', note: '' },
      financeShowForm: false
    }, () => this.computeFinanceData())
    wx.showToast({ title: '添加成功', icon: 'success' })
  },

  onFinanceMonthChange(e) {
    const idx = e.detail.value
    const month = this.data.financeMonths[idx]
    this.setData({ financeFilterMonth: month }, () => this.computeFinanceData())
  },

  exportFinanceReport() {
    const { financeOverviewData, financeFilterMonth } = this.data
    const monthLabel = this.data.financeMonthLabels[financeFilterMonth] || financeFilterMonth || '全部'
    let text = '财务报表 - ' + monthLabel + '\n'
    text += '总收入：' + financeOverviewData.totalIncome_str + '\n'
    text += '总支出：' + financeOverviewData.totalExpense_str + '\n'
    text += '结余：' + financeOverviewData.balance_str + '\n\n'
    text += '--- 收入明细 ---\n'
    ;(financeOverviewData.incomeItems || []).forEach(function(i) {
      text += i.category + '：' + i.amount_str + '\n'
    })
    text += '\n--- 支出明细 ---\n'
    ;(financeOverviewData.expenseItems || []).forEach(function(i) {
      text += i.category + '：' + i.amount_str + '\n'
    })
    wx.setClipboardData({
      data: text,
      success: function() {
        wx.showToast({ title: '报表已复制到剪贴板', icon: 'success' })
      }
    })
  },

  completeReminder(e) {
    const id = e.currentTarget.dataset.id
    const { financeReminders, financeCompletedReminders } = this.data
    const completed = financeReminders.find(r => r.id === id)
    if (completed) {
      const updatedPending = financeReminders.filter(r => r.id !== id)
      const updatedCompleted = [...financeCompletedReminders, { ...completed, status: '已完成' }]
      this.setData({
        financeReminders: updatedPending,
        financeCompletedReminders: updatedCompleted
      })
    }
    wx.showToast({ title: '已标记完成', icon: 'success' })
  },

  deleteFinanceRecord(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该收支记录吗？',
      success: (res) => {
        if (res.confirm) {
          const { financeRecords, financeFilterMonth } = this.data
          const updated = financeRecords.filter(r => r.id !== id)
          this.setData({ financeRecords: updated }, () => this.computeFinanceData())
          wx.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  },

  /* ==================== 产品准入 ==================== */

  computeProductData() {
    const products = this.data.products
    const filtered = filterProducts(products, this.data.productStatusFilter)
    const online = products.filter(function(p) { return p.status === '已上架' }).length
    const reviewing = products.filter(function(p) { return p.status === '审核中' }).length
    const draft = products.filter(function(p) { return p.status === '草稿' }).length
    const offline = products.filter(function(p) { return p.status === '已下架' }).length
    this.setData({
      filteredProducts: filtered,
      productStats: { online: online, reviewing: reviewing, draft: draft, offline: offline }
    })
  },

  switchProductTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ productCurrentTab: tab })
  },

  productFormInput(e) {
    const field = e.currentTarget.dataset.field
    const val = e.detail.value
    this.setData({ [`productForm.${field}`]: val })
  },

  productFormExtraInput(e) {
    const field = e.currentTarget.dataset.field
    const val = e.detail.value
    this.setData({ [`productFormExtra.${field}`]: val })
  },

  setProductType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ 'productForm.type': type })
  },

  submitProductForm() {
    const { productForm, productFormExtra } = this.data
    if (!productForm.name || !productForm.type || !productForm.partner) {
      wx.showToast({ title: '请填写产品信息', icon: 'none' })
      return
    }
    wx.showLoading({ title: '提交审核...' })
    setTimeout(() => {
      wx.hideLoading()
      const newProduct = {
        id: 'p' + Date.now(),
        name: productForm.name,
        type: productForm.type,
        rateRange: productForm.rateRange || '待定',
        partner: productForm.partner,
        contactPerson: productFormExtra.contactPerson || '',
        termRange: productFormExtra.termRange || '',
        targetCustomer: productFormExtra.targetCustomer || '',
        status: '审核中',
        applyDate: getToday(),
        desc: productForm.desc || ''
      }
      const newReview = {
        id: 'rv' + Date.now(),
        productName: productForm.name,
        applicant: '当前用户',
        applyDate: getToday(),
        status: '待初审',
        currentStep: '待初审',
        history: [{ step: '提交申请', time: getToday(), operator: '当前用户', comment: '' }]
      }
      const updatedProducts = [newProduct, ...this.data.products]
      const updatedReviews = [newReview, ...this.data.reviewRecords]
      this.setData({
        products: updatedProducts,
        reviewRecords: updatedReviews,
        productForm: { name: '', type: '', rateRange: '', partner: '', desc: '', status: '草稿', contactPerson: '', termRange: '', targetCustomer: '' },
        productFormExtra: { contactPerson: '', termRange: '', targetCustomer: '' },
        productCurrentTab: 'list'
      }, () => this.computeProductData())
      wx.showToast({ title: '提交成功，等待审核', icon: 'success' })
    }, 1000)
  },

  setProductStatusFilter(e) {
    const filter = e.currentTarget.dataset.filter
    const filtered = filterProducts(this.data.products, filter)
    this.setData({ productStatusFilter: filter, filteredProducts: filtered })
  },

  showProductDetail(e) {
    const id = e.currentTarget.dataset.id
    const product = this.data.products.find(function(p) { return p.id === id })
    if (!product) return
    this.setData({ productDetailItem: product })
  },

  closeProductDetail() {
    this.setData({ productDetailItem: null })
  },

  toggleProductAuth(e) {
    const { productId, agentId } = e.currentTarget.dataset
    const agents = this.data.agentProductAuth.map(a => {
      if (a.id === agentId) {
        const hasProduct = a.authorizedProducts.includes(productId)
        return { ...a, authorizedProducts: hasProduct ? a.authorizedProducts.filter(p => p !== productId) : [...a.authorizedProducts, productId] }
      }
      return a
    })
    this.setData({ agentProductAuth: agents })
    wx.showToast({ title: '已更新授权', icon: 'success' })
  },

  showReviewDetail(e) {
    const id = e.currentTarget.dataset.id
    const review = this.data.reviewRecords.find(r => r.id === id)
    if (!review) return
    this.setData({ selectedReview: review })
  },

  closeReviewDetail() {
    this.setData({ selectedReview: null })
  },

  /* ==================== 模板中心 ==================== */

  filterTemplateList() {
    const { allTemplates, templateCurrentCategory, templateSearchKeyword, templateFavorites } = this.data
    let filtered = allTemplates
    if (templateCurrentCategory === 'favorites') {
      filtered = filtered.filter(function(t) { return templateFavorites.indexOf(t.id) !== -1 })
    } else if (templateCurrentCategory !== 'all') {
      filtered = filtered.filter(function(t) { return t.category === templateCurrentCategory })
    }
    if (templateSearchKeyword) {
      var kw = templateSearchKeyword.toLowerCase()
      filtered = filtered.filter(function(t) {
        return t.title.toLowerCase().indexOf(kw) !== -1 || t.desc.toLowerCase().indexOf(kw) !== -1
      })
    }
    return filtered
  },

  switchTemplateCategory(e) {
    const cat = e.currentTarget.dataset.category
    if (!cat) return
    this.setData({ templateCurrentCategory: cat }, function() {
      this.setData({ filteredTemplates: this.filterTemplateList() })
    })
  },

  onTemplateSearchInput(e) {
    const val = e.detail.value
    this.setData({ templateSearchKeyword: val }, function() {
      this.setData({ filteredTemplates: this.filterTemplateList() })
    })
  },

  previewTemplate(e) {
    const id = e.currentTarget.dataset.id
    const tpl = this.data.allTemplates.find(t => t.id === id)
    if (!tpl) return
    this.setData({ templatePreview: tpl })
  },

  closeTemplatePreview() {
    this.setData({ templatePreview: null })
  },

  toggleFavorite(e) {
    const id = e.currentTarget.dataset.id
    let { templateFavorites } = this.data
    if (templateFavorites.includes(id)) {
      templateFavorites = templateFavorites.filter(fid => fid !== id)
    } else {
      templateFavorites.push(id)
    }
    this.setData({ templateFavorites })
    wx.setStorageSync('oa_template_favorites', templateFavorites)
    wx.showToast({
      title: templateFavorites.includes(id) ? '已收藏' : '已取消收藏',
      icon: 'success'
    })
    // 刷新模板列表（更新收藏数量）
    this.setData({ filteredTemplates: this.filterTemplateList() })
  },

  copyTemplateContent(e) {
    const id = e.currentTarget.dataset.id
    const tpl = this.data.allTemplates.find(t => t.id === id)
    if (!tpl) return
    wx.setClipboardData({
      data: tpl.content,
      success: function() {
        wx.showToast({ title: '✓ 复制成功', icon: 'none' })
      }
    })
  },

  gotoPage(e) {
    const url = e.currentTarget.dataset.url
    const mode = e.currentTarget.dataset.mode
    if (mode === 'tab') {
      wx.switchTab({ url })
    } else if (mode === 'tabIndex') {
      const idx = parseInt(url)
      this.setData({ currentTab: idx })
      wx.pageScrollTo({ scrollTop: 0, duration: 200 })
    } else {
      wx.navigateTo({ url })
    }
  },

  handleFinanceAlarmTap() {
    this.setData({ currentTab: 3, financeCurrentTab: 'reminders' })
    wx.pageScrollTo({ scrollTop: 0, duration: 200 })
  },

  noop() {},

  /* ==================== 账号类型与权限 ==================== */

  /** 应用账号类型过滤 */
  applyAccountType() {
    const type = wx.getStorageSync('userAccountType') || 'staff'
    const profile = ACCOUNT_PROFILES[type] || ACCOUNT_PROFILES.staff
    this.setData({
      userAccountType: type,
      currentAccountProfile: profile
    })
    this.filterByAccountType(type)
  },

  /** 根据角色过滤分润、代理商、业绩数据 */
  filterByAccountType(type) {
    const allReports = mockAgentData.commissionReports
    const allPerformance = mockAgentData.performanceData
    const allAgents = mockAgentData.applications
    const profile = ACCOUNT_PROFILES[type] || ACCOUNT_PROFILES.staff

    let filteredReports, filteredPerformance, filteredAgentList

    if (type === 'admin') {
      // 管理员查看全部
      filteredReports = allReports
      filteredPerformance = allPerformance
      filteredAgentList = allAgents
    } else if (type === 'agent') {
      // 代理商只查看自己相关的分润记录
      const agentName = profile.agentName
      filteredReports = allReports.map(r => {
        const myDetails = r.details.filter(d => d.agent === agentName || d.agent.includes(agentName))
        const totalComm = myDetails.reduce((s, d) => s + parseFloat(String(d.amount).replace(/,/g, '')), 0)
        return {
          ...r,
          details: myDetails,
          totalCommission: totalComm.toFixed(2),
          orderCount: myDetails.reduce((s, d) => s + d.orders, 0)
        }
      })
      filteredPerformance = allPerformance.filter(p => p.agent === agentName || p.agent.includes(agentName))
      filteredAgentList = allAgents.filter(a => a.company.includes(agentName))
    } else {
      // 业务员只查看自己相关的业绩
      filteredReports = allReports.map(r => ({
        ...r,
        details: [],
        totalCommission: '0.00',
        orderCount: 0
      }))
      filteredPerformance = allPerformance.filter(p => p.agent === '快捷' || p.agent === '安信')
      filteredAgentList = []
    }

    this.setData({
      filteredCommissionReports: filteredReports,
      filteredPerformanceReports: filteredPerformance,
      filteredAgents: filteredAgentList.length ? filteredAgentList : this.data.filteredAgents,
      commissionReports: filteredReports,
      performanceData: filteredPerformance,
      totalAgentFormatted: (function() {
        const total = filteredPerformance.reduce((s, i) => s + i.amount, 0)
        return total >= 10000 ? (total / 10000).toFixed(1) + '万' : String(total)
      })(),
      totalAgentAmount: filteredPerformance.reduce((s, i) => s + i.amount, 0),
      maxPerformanceAmount: filteredPerformance.length
        ? Math.max(...filteredPerformance.map(d => d.amount))
        : 0,
      latestOrderCount: filteredReports.length ? filteredReports[0].orderCount : 0
    })
  },

  /** 切换账号类型（调试用） */
  switchAccountType(e) {
    const type = e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.type
    if (type) {
      // 直接从调试面板按钮切换
      this.setAccountType(type)
      return
    }
    // ActionSheet方式
    const types = ['admin', 'agent', 'staff']
    const labels = { admin: '管理员', agent: '代理商', staff: '业务员' }
    const current = this.data.userAccountType
    wx.showActionSheet({
      itemList: types.map(t => `${labels[t]}${t === current ? ' ✓' : ''}`),
      success: (res) => {
        if (res.tapIndex !== undefined) {
          this.setAccountType(types[res.tapIndex])
        }
      }
    })
  },

  /** 设置账号类型 */
  setAccountType(type) {
    const labels = { admin: '管理员', agent: '代理商', staff: '业务员' }
    wx.setStorageSync('userAccountType', type)
    this.applyAccountType()
    wx.showToast({ title: `已切换为${labels[type]}`, icon: 'none' })
  },

  /** 显示调试面板 */
  toggleDebugPanel() {
    this.setData({ showDebugPanel: !this.data.showDebugPanel })
  },

  /** 长按标题切换角色（快捷调试） */
  onTitleLongPress() {
    this.switchAccountType()
  },

  approveReview(e) {
    const id = e.currentTarget.dataset.id
    const reviews = this.data.reviewRecords.map(r => {
      if (r.id === id) {
        let newStatus = ''
        let newStep = ''
        if (r.status === '待初审') { newStatus = '初审通过'; newStep = '待终审' }
        else if (r.status === '初审通过') { newStatus = '终审通过'; newStep = '已完成' }
        else return r
        return { ...r, status: newStatus, currentStep: newStep, history: [...r.history, { step: newStatus, time: getToday(), operator: '当前用户', comment: '审核通过' }] }
      }
      return r
    })
    this.setData({ reviewRecords: reviews })
    wx.showToast({ title: '审核通过', icon: 'success' })
  },

  rejectReview(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认驳回',
      content: '确定要驳回该审核申请吗？',
      success: (res) => {
        if (res.confirm) {
          const reviews = this.data.reviewRecords.map(r => {
            if (r.id === id) {
              let newStatus = ''
              let newStep = ''
              if (r.currentStep === '待初审') { newStatus = '初审驳回'; newStep = '已驳回' }
              else if (r.currentStep === '待终审') { newStatus = '终审驳回'; newStep = '已驳回' }
              else return r
              return { ...r, status: newStatus, currentStep: newStep, history: [...r.history, { step: newStatus, time: getToday(), operator: '当前用户', comment: '审核驳回' }] }
            }
            return r
          })
          this.setData({ reviewRecords: reviews })
          wx.showToast({ title: '已驳回', icon: 'success' })
        }
      }
    })
  }
})
