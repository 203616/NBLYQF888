/** 各进件系统共享模块定义 */

const formModules = {
  autoFinance: [
    {
      id: 'credit', title: '01 征信查询', desc: '大数据查询与征信授权（姓名、电话、身份证影像）',
      icon: '/subpackages/intake/images/intake/basic.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=credit',
      guide: ['请上传身份证正反面清晰照片', '勾选并签署征信与大数据查询授权书', '查询结果仅供机构审批参考'],
      checklist: ['姓名', '电话', '身份证影像', '授权书'],
      fields: [
        { key: 'realName', label: '姓名', type: 'text', required: true },
        { key: 'mobile', label: '电话', type: 'number', required: true },
        { key: 'idCardFront', label: '身份证正面', type: 'image', required: true, hint: '四角完整、无反光' },
        { key: 'idCardBack', label: '身份证反面', type: 'image', required: true, hint: '四角完整、无反光' },
        { key: 'bigDataAuth', label: '大数据查询授权', type: 'switch', required: true },
        { key: 'creditAuth', label: '征信查询授权', type: 'switch', required: true },
        { key: 'authSigned', label: '已签署授权书', type: 'picker', options: ['是', '否'], required: true }
      ]
    },
    {
      id: 'basic', title: '02 基本信息', desc: '申请城市、资金用途、期望额度与期限',
      icon: '/subpackages/intake/images/intake/basic.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=basic',
      guide: ['请如实填写申请城市与资金用途', '期望额度与期限为初步意向', '新车/二手车/车抵请选择对应用途'],
      checklist: ['申请城市', '资金用途', '期望额度'],
      fields: [
        { key: 'applyCity', label: '申请城市', type: 'text', required: true, placeholder: '宁波市鄞州区', hint: '以实际办理城市为准' },
        { key: 'applyChannel', label: '申请渠道', type: 'picker', options: ['亮叶企服小程序', '线下门店', '合作车商', '客户经理推荐'] },
        { key: 'loanPurpose', label: '资金用途', type: 'picker', options: ['购车消费', '车辆抵押周转', '置换升级'], required: true },
        { key: 'expectedAmount', label: '期望额度', type: 'text', required: true, placeholder: '如：20万', hint: '初步意向，以机构审批为准' },
        { key: 'expectedTerm', label: '期望期限', type: 'picker', options: ['12期', '24期', '36期', '48期', '60期'] },
        { key: 'urgency', label: '办理紧迫度', type: 'picker', options: ['一周内', '半月内', '一个月内', '仅了解'] },
        { key: 'hasHouse', label: '是否有房产', type: 'picker', options: ['有', '无'] },
        { key: 'hasOtherLoan', label: '是否有其他贷款', type: 'picker', options: ['无', '有-月供5000以下', '有-月供5000以上'] },
        { key: 'remark', label: '补充说明', type: 'textarea', placeholder: '可填写车商名称、意向车型、特殊需求等' }
      ]
    },
    {
      id: 'personal', title: '03 个人信息', desc: '身份信息、联系方式、婚姻学历与住址',
      icon: '/subpackages/intake/images/intake/personal.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=personal',
      guide: ['支持身份证OCR自动识别填入', '手机号用于接收审核与放款通知'],
      checklist: ['真实姓名', '身份证号', '手机号码'],
      fields: [
        { key: 'realName', label: '真实姓名', type: 'text', required: true, hint: '须与身份证一致' },
        { key: 'idCard', label: '身份证号', type: 'idcard', required: true, hint: '支持上传身份证OCR自动识别' },
        { key: 'gender', label: '性别', type: 'picker', options: ['男', '女'] },
        { key: 'birthDate', label: '出生日期', type: 'date' },
        { key: 'mobile', label: '手机号码', type: 'number', required: true, hint: '用于接收审核与放款通知' },
        { key: 'email', label: '电子邮箱', type: 'text', placeholder: '选填' },
        { key: 'maritalStatus', label: '婚姻状况', type: 'picker', options: ['未婚', '已婚', '离异', '丧偶'] },
        { key: 'education', label: '最高学历', type: 'picker', options: ['高中及以下', '大专', '本科', '硕士及以上'] },
        { key: 'householdType', label: '户口性质', type: 'picker', options: ['城镇户口', '农村户口'] },
        { key: 'address', label: '常住地址', type: 'textarea', required: true, placeholder: '省市区+详细地址' },
        { key: 'residenceYears', label: '本地居住年限', type: 'text', placeholder: '如：3年' }
      ]
    },
    {
      id: 'vehicle', title: '04 车辆信息', desc: '品牌车型、车架号、购置价与车商信息',
      icon: '/subpackages/intake/images/intake/vehicle.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=vehicle',
      guide: ['新车需购车发票，二手车需行驶证与交易合同', 'VIN码17位可在行驶证查看'],
      checklist: ['车辆品牌', '车型', '购置/评估价'],
      fields: [
        { key: 'vehicleType', label: '车辆类型', type: 'picker', options: ['新能源乘用车', '燃油乘用车', '商用车', '皮卡/越野'], required: true },
        { key: 'brand', label: '车辆品牌', type: 'text', required: true, placeholder: '如：比亚迪' },
        { key: 'model', label: '车型', type: 'text', required: true, placeholder: '如：汉EV 尊贵型' },
        { key: 'color', label: '车身颜色', type: 'text' },
        { key: 'year', label: '上牌/出厂年份', type: 'text', placeholder: '如：2024' },
        { key: 'vin', label: '车架号VIN', type: 'text', placeholder: '17位，可在行驶证查看', hint: '新车可后补' },
        { key: 'engineNo', label: '发动机号', type: 'text' },
        { key: 'plateNo', label: '车牌号码', type: 'text', placeholder: '二手车/车抵必填' },
        { key: 'mileage', label: '行驶里程', type: 'text', placeholder: '如：3.2万公里' },
        { key: 'purchasePrice', label: '购置/评估价', type: 'text', required: true, hint: '单位：元' },
        { key: 'invoiceAmount', label: '发票金额', type: 'text', placeholder: '新车购车发票价' },
        { key: 'dealerName', label: '车商/门店', type: 'text', placeholder: '选填' },
        { key: 'insuranceExpiry', label: '保险到期日', type: 'date' }
      ]
    },
    {
      id: 'finance', title: '05 融资信息', desc: '首付、贷款金额、期限与还款方式',
      icon: '/subpackages/intake/images/intake/finance.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=finance',
      guide: ['利率以机构审核定价为准', '首付+贷款额应接近车辆成交价'],
      checklist: ['首付金额', '贷款金额', '贷款期限'],
      fields: [
        { key: 'downPayment', label: '首付金额', type: 'text', required: true, hint: '单位：元' },
        { key: 'loanAmount', label: '贷款金额', type: 'text', required: true, hint: '首付+贷款≈车辆成交价' },
        { key: 'loanTerm', label: '贷款期限', type: 'picker', options: ['12', '24', '36', '48', '60'], suffix: '期' },
        { key: 'repaymentMethod', label: '还款方式', type: 'picker', options: ['等额本息', '等额本金', '气球贷'] },
        { key: 'rateType', label: '利率类型', type: 'picker', options: ['固定利率', '浮动利率', '机构审核定价'] },
        { key: 'monthlyPayment', label: '期望月供', type: 'text', placeholder: '选填，便于方案匹配' },
        { key: 'insuranceRequired', label: '是否捆绑保险', type: 'switch', hint: '部分机构要求购买指定险种' },
        { key: 'gpsRequired', label: '是否安装GPS', type: 'switch', hint: '车抵贷通常需要' },
        { key: 'subsidyAmount', label: '补贴/优惠金额', type: 'text', placeholder: '政府或厂家补贴' }
      ]
    },
    {
      id: 'work', title: '工作信息', desc: '单位名称、行业岗位、工龄',
      icon: '/subpackages/intake/images/intake/work.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=work',
      guide: ['请填写真实工作单位信息', '国企/事业单位可提供工号'],
      checklist: ['工作单位', '职位', '工作年限'],
      fields: [
        { key: 'employmentType', label: '就业类型', type: 'picker', options: ['受雇全职', '受雇兼职', '个体经营', '企业主', '自由职业'], required: true },
        { key: 'companyName', label: '工作单位', type: 'text', required: true },
        { key: 'industry', label: '所属行业', type: 'picker', options: ['制造业', '信息技术', '金融', '批发零售', '建筑', '教育', '医疗', '其他'] },
        { key: 'position', label: '职位', type: 'text', required: true },
        { key: 'workYears', label: '工作年限', type: 'text', required: true, placeholder: '如：5年' },
        { key: 'companyScale', label: '单位规模', type: 'picker', options: ['50人以下', '50-200人', '200-1000人', '1000人以上'] },
        { key: 'companyAddress', label: '单位地址', type: 'textarea' },
        { key: 'companyPhone', label: '单位电话', type: 'text' }
      ]
    },
    {
      id: 'income', title: '收入信息', desc: '月收入、负债与流水情况',
      icon: '/subpackages/intake/images/intake/income.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=income',
      guide: ['流水需覆盖近6个月', '负债月供影响审批额度'],
      checklist: ['月收入', '流水月数'],
      fields: [
        { key: 'monthlyIncome', label: '月收入', type: 'text', required: true, hint: '税前收入，单位：元' },
        { key: 'otherIncome', label: '其他收入', type: 'text', placeholder: '租金、分红等' },
        { key: 'familyMonthlyExpense', label: '家庭月支出', type: 'text', placeholder: '选填' },
        { key: 'existingLoans', label: '现有负债月供', type: 'text', placeholder: '含房贷、车贷、信用卡等' },
        { key: 'bankFlowMonths', label: '银行流水月数', type: 'picker', options: ['3', '6', '12'], required: true },
        { key: 'incomeProofType', label: '收入证明类型', type: 'picker', options: ['工资流水', '纳税记录', '经营流水', '公积金'] },
        { key: 'providentFund', label: '公积金月缴', type: 'text', placeholder: '选填' }
      ]
    },
    {
      id: 'uploads', title: '资料上传', desc: '身份证、流水、收入证明、车辆资料',
      icon: '/subpackages/intake/images/intake/upload.webp', type: 'upload',
      path: '/subpackages/intake/pages/upload/upload',
      guide: ['必传：身份证正反面、银行流水、征信授权书', '车辆资料按产品类型补充']
    },
    {
      id: 'contacts', title: '紧急联系人', desc: '紧急联系人与关系',
      icon: '/subpackages/intake/images/intake/contacts.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=contacts',
      fields: [
        { key: 'emergencyName', label: '紧急联系人', type: 'text', required: true },
        { key: 'emergencyPhone', label: '联系人电话', type: 'number', required: true },
        { key: 'emergencyRelation', label: '与申请人关系', type: 'picker', options: ['配偶', '父母', '子女', '兄弟姐妹', '同事', '朋友'], required: true },
        { key: 'emergencyAddress', label: '联系人地址', type: 'text', placeholder: '选填' },
        { key: 'secondContactName', label: '第二联系人', type: 'text' },
        { key: 'secondContactPhone', label: '第二联系人电话', type: 'number' }
      ]
    }
  ],
  business: [
    {
      id: 'basic', title: '企业基本信息', desc: '企业名称、经营地址、申请额度',
      icon: '/subpackages/intake/images/intake/basic.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=basic',
      guide: ['请填写真实经营主体信息', '额度为初步意向以机构审批为准'],
      checklist: ['经营城市', '资金用途', '期望额度'],
      fields: [
        { key: 'applyCity', label: '经营城市', type: 'text', required: true },
        { key: 'applyChannel', label: '获客渠道', type: 'picker', options: ['亮叶企服', '线下门店', '老客户转介', '其他'] },
        { key: 'loanPurpose', label: '资金用途', type: 'picker', options: ['经营周转', '设备购置', '备货采购', '装修升级', '其他合规用途'], required: true },
        { key: 'expectedAmount', label: '期望额度', type: 'text', required: true, placeholder: '如：50万' },
        { key: 'expectedTerm', label: '期望期限', type: 'picker', options: ['12期', '24期', '36期', '48期'] },
        { key: 'urgency', label: '用款紧迫度', type: 'picker', options: ['一周内', '半月内', '一个月内'] },
        { key: 'remark', label: '经营说明', type: 'textarea', placeholder: '简述主营业务与用款计划' }
      ]
    },
    {
      id: 'personal', title: '法人/实控人信息', desc: '法定代表人身份信息',
      icon: '/subpackages/intake/images/intake/personal.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=personal',
      fields: [
        { key: 'realName', label: '法人姓名', type: 'text', required: true },
        { key: 'idCard', label: '身份证号', type: 'idcard', required: true },
        { key: 'mobile', label: '联系电话', type: 'number', required: true }
      ]
    },
    {
      id: 'work', title: '企业经营信息', desc: '营业执照、行业、经营年限',
      icon: '/subpackages/intake/images/intake/work.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=work',
      guide: ['请与营业执照信息保持一致'],
      checklist: ['企业名称', '信用代码', '经营年限'],
      fields: [
        { key: 'companyName', label: '企业名称', type: 'text', required: true },
        { key: 'businessLicense', label: '统一社会信用代码', type: 'text', required: true },
        { key: 'industry', label: '所属行业', type: 'picker', options: ['制造业', '批发零售', '餐饮服务', '信息技术', '建筑工程', '物流运输', '其他'] },
        { key: 'workYears', label: '经营年限', type: 'text', required: true, placeholder: '如：3年' },
        { key: 'companyScale', label: '员工人数', type: 'picker', options: ['10人以下', '10-50人', '50-200人', '200人以上'] },
        { key: 'companyAddress', label: '经营地址', type: 'textarea', required: true },
        { key: 'companyPhone', label: '企业电话', type: 'text' },
        { key: 'position', label: '申请人职务', type: 'picker', options: ['法人', '股东', '财务负责人', '其他'] }
      ]
    },
    {
      id: 'income', title: '经营收入信息', desc: '纳税、流水、年营业额',
      icon: '/subpackages/intake/images/intake/income.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=income',
      fields: [
        { key: 'monthlyIncome', label: '月均营业额', type: 'text', required: true },
        { key: 'taxAnnual', label: '年纳税额', type: 'text' },
        { key: 'bankFlowMonths', label: '对公流水月数', type: 'picker', options: ['6', '12'], required: true }
      ]
    },
    {
      id: 'finance', title: '融资方案', desc: '额度、期限、还款方式',
      icon: '/subpackages/intake/images/intake/finance.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=finance',
      fields: [
        { key: 'loanAmount', label: '申请额度', type: 'text', required: true },
        { key: 'loanTerm', label: '期限', type: 'picker', options: ['12', '24', '36'], suffix: '期' },
        { key: 'repaymentMethod', label: '还款方式', type: 'picker', options: ['等额本息', '先息后本'] }
      ]
    },
    {
      id: 'uploads', title: '资料上传', desc: '执照、流水、纳税、征信授权',
      icon: '/subpackages/intake/images/intake/upload.webp', type: 'upload',
      path: '/subpackages/intake/pages/upload/upload'
    },
    {
      id: 'contacts', title: '紧急联系人', desc: '企业联系人信息',
      icon: '/subpackages/intake/images/intake/contacts.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=contacts',
      fields: [
        { key: 'emergencyName', label: '联系人', type: 'text', required: true },
        { key: 'emergencyPhone', label: '电话', type: 'number', required: true }
      ]
    }
  ],
  personal: [
    {
      id: 'basic', title: '申请基本信息', desc: '城市、消费用途、额度与期限',
      icon: '/subpackages/intake/images/intake/basic.webp', type: 'form', path: '/subpackages/intake/pages/form/form?section=basic',
      guide: ['消费用途须合规真实', '额度为初步意向'],
      fields: [
        { key: 'applyCity', label: '申请城市', type: 'text', required: true },
        { key: 'loanPurpose', label: '消费用途', type: 'picker', options: ['装修消费', '教育支出', '医疗支出', '旅游消费', '其他合规消费'], required: true },
        { key: 'expectedAmount', label: '期望额度', type: 'text', required: true, placeholder: '如：10万' },
        { key: 'expectedTerm', label: '期望期限', type: 'picker', options: ['12期', '24期', '36期'] },
        { key: 'urgency', label: '用款时间', type: 'picker', options: ['一周内', '半月内', '一个月内'] }
      ]
    },
    {
      id: 'personal', title: '个人信息', desc: '身份信息与联系方式',
      icon: '/subpackages/intake/images/intake/personal.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=personal',
      fields: [
        { key: 'realName', label: '姓名', type: 'text', required: true },
        { key: 'idCard', label: '身份证号', type: 'idcard', required: true },
        { key: 'mobile', label: '手机', type: 'number', required: true },
        { key: 'maritalStatus', label: '婚姻状况', type: 'picker', options: ['未婚', '已婚', '离异'] },
        { key: 'education', label: '学历', type: 'picker', options: ['高中及以下', '大专', '本科', '硕士及以上'] },
        { key: 'address', label: '住址', type: 'textarea', required: true }
      ]
    },
    {
      id: 'work', title: '工作信息', desc: '单位与职业信息',
      icon: '/subpackages/intake/images/intake/work.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=work',
      fields: [
        { key: 'employmentType', label: '就业类型', type: 'picker', options: ['受雇全职', '个体经营', '自由职业'] },
        { key: 'companyName', label: '工作单位', type: 'text', required: true },
        { key: 'position', label: '职位', type: 'text', required: true },
        { key: 'workYears', label: '工作年限', type: 'text', required: true }
      ]
    },
    {
      id: 'income', title: '收入信息', icon: '/subpackages/intake/images/intake/income.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=income',
      fields: [
        { key: 'monthlyIncome', label: '月收入', type: 'text', required: true },
        { key: 'providentFund', label: '公积金月缴', type: 'text' },
        { key: 'existingLoans', label: '现有负债月供', type: 'text' },
        { key: 'bankFlowMonths', label: '流水月数', type: 'picker', options: ['6', '12'], required: true },
        { key: 'incomeProofType', label: '收入证明', type: 'picker', options: ['工资流水', '纳税记录', '公积金'] }
      ]
    },
    {
      id: 'finance', title: '贷款方案', icon: '/subpackages/intake/images/intake/finance.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=finance',
      fields: [
        { key: 'loanAmount', label: '申请额度', type: 'text', required: true },
        { key: 'loanTerm', label: '期限', type: 'picker', options: ['12', '24', '36'], suffix: '期' },
        { key: 'repaymentMethod', label: '还款方式', type: 'picker', options: ['等额本息', '等额本金'] }
      ]
    },
    { id: 'uploads', title: '资料上传', desc: '身份证、流水、收入证明、征信授权', icon: '/subpackages/intake/images/intake/upload.webp', type: 'upload', path: '/subpackages/intake/pages/upload/upload' },
    {
      id: 'contacts', title: '紧急联系人', icon: '/subpackages/intake/images/intake/contacts.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=contacts',
      fields: [
        { key: 'emergencyName', label: '联系人', type: 'text', required: true },
        { key: 'emergencyPhone', label: '电话', type: 'number', required: true },
        { key: 'emergencyRelation', label: '关系', type: 'picker', options: ['配偶', '父母', '子女', '朋友'] }
      ]
    }
  ],
  warranty: [
    {
      id: 'basic', title: '延保申请信息', desc: '服务城市、套餐类型与预算',
      icon: '/subpackages/intake/images/intake/basic.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=basic',
      guide: ['请先确认车辆是否符合延保条件', '套餐价格以检测评估后为准'],
      checklist: ['服务城市', '套餐类型', '预算范围'],
      fields: [
        { key: 'applyCity', label: '服务城市', type: 'text', required: true, placeholder: '宁波市' },
        { key: 'loanPurpose', label: '套餐类型', type: 'picker', options: ['基础保障', '全面保障', '待顾问推荐'], required: true },
        { key: 'expectedAmount', label: '预算范围', type: 'picker', options: ['899-1500元', '1500-2500元', '2500元以上', '待评估'] },
        { key: 'expectedTerm', label: '保障期限', type: 'picker', options: ['1年', '2年', '3年'] },
        { key: 'urgency', label: '期望生效时间', type: 'picker', options: ['尽快', '一个月内', '仅了解'] },
        { key: 'remark', label: '特殊需求', type: 'textarea', placeholder: '如异地用车、高里程等特殊说明' }
      ]
    },
    {
      id: 'personal', title: '车主信息', desc: '车主身份与联系方式',
      icon: '/subpackages/intake/images/intake/personal.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=personal',
      guide: ['车主须与行驶证登记一致'],
      fields: [
        { key: 'realName', label: '车主姓名', type: 'text', required: true },
        { key: 'idCard', label: '身份证号', type: 'idcard', hint: '选填，签约时需要' },
        { key: 'mobile', label: '联系电话', type: 'number', required: true },
        { key: 'address', label: '联系地址', type: 'textarea', placeholder: '选填' }
      ]
    },
    {
      id: 'vehicle', title: '车辆信息', desc: '品牌车型、里程与车况',
      icon: '/subpackages/intake/images/intake/vehicle.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=vehicle',
      guide: ['请如实填写里程与上牌时间', '高里程车辆可能需要额外检测'],
      checklist: ['品牌', '车型', '里程', '上牌年份'],
      fields: [
        { key: 'brand', label: '品牌', type: 'text', required: true },
        { key: 'model', label: '车型', type: 'text', required: true },
        { key: 'year', label: '上牌年份', type: 'text', required: true, placeholder: '如：2021' },
        { key: 'mileage', label: '当前里程', type: 'text', required: true, placeholder: '如：5.6万公里' },
        { key: 'vin', label: '车架号VIN', type: 'text', placeholder: '17位' },
        { key: 'plateNo', label: '车牌号码', type: 'text' },
        { key: 'vehicleType', label: '燃料类型', type: 'picker', options: ['燃油', '混动', '纯电', '柴油'] },
        { key: 'purchasePrice', label: '购车价格', type: 'text', placeholder: '选填' },
        { key: 'insuranceExpiry', label: '原厂质保到期', type: 'date', hint: '便于判断延保衔接时间' }
      ]
    },
    {
      id: 'finance', title: '套餐与支付', desc: '保障范围意向与支付方式',
      icon: '/subpackages/intake/images/intake/finance.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=finance',
      fields: [
        { key: 'loanAmount', label: '意向套餐价', type: 'text', placeholder: '如：1699元' },
        { key: 'loanTerm', label: '保障年限', type: 'picker', options: ['1', '2', '3'], suffix: '年' },
        { key: 'repaymentMethod', label: '支付方式', type: 'picker', options: ['一次性付清', '分期支付'] },
        { key: 'insuranceRequired', label: '是否需要道路救援', type: 'switch' },
        { key: 'remark', label: '保障偏好', type: 'textarea', placeholder: '如重点关注发动机/变速箱保障' }
      ]
    },
    { id: 'uploads', title: '资料上传', desc: '行驶证、购车发票、现有质保记录、车辆照片', icon: '/subpackages/intake/images/intake/upload.webp', type: 'upload', path: '/subpackages/intake/pages/upload/upload',
      guide: ['必传：行驶证正副页', '建议上传：仪表盘里程照片、发动机舱照片'] }
  ],
  property: [
    {
      id: 'basic', title: '抵押申请信息', desc: '房产城市、用途与期望额度',
      icon: '/subpackages/intake/images/intake/basic.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=basic',
      guide: ['房产须产权清晰无重大纠纷', '评估价以专业机构报告为准'],
      fields: [
        { key: 'applyCity', label: '房产所在城市', type: 'text', required: true },
        { key: 'loanPurpose', label: '资金用途', type: 'picker', options: ['经营周转', '设备购置', '备货采购', '其他合规用途'], required: true },
        { key: 'expectedAmount', label: '期望额度', type: 'text', required: true, placeholder: '如：100万' },
        { key: 'expectedTerm', label: '期望期限', type: 'picker', options: ['12期', '24期', '36期', '60期'] },
        { key: 'remark', label: '房产简述', type: 'textarea', placeholder: '地址、面积、评估价意向等' }
      ]
    },
    {
      id: 'personal', title: '产权人信息', icon: '/subpackages/intake/images/intake/personal.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=personal',
      fields: [
        { key: 'realName', label: '产权人姓名', type: 'text', required: true },
        { key: 'idCard', label: '身份证号', type: 'idcard', required: true },
        { key: 'mobile', label: '手机', type: 'number', required: true },
        { key: 'maritalStatus', label: '婚姻状况', type: 'picker', options: ['未婚', '已婚', '离异'] },
        { key: 'address', label: '联系地址', type: 'textarea' }
      ]
    },
    {
      id: 'work', title: '经营主体信息', icon: '/subpackages/intake/images/intake/work.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=work',
      fields: [
        { key: 'companyName', label: '企业/个体名称', type: 'text' },
        { key: 'businessLicense', label: '信用代码', type: 'text' },
        { key: 'industry', label: '经营行业', type: 'picker', options: ['制造业', '批发零售', '餐饮', '其他'] },
        { key: 'workYears', label: '经营年限', type: 'text' }
      ]
    },
    {
      id: 'finance', title: '融资方案', icon: '/subpackages/intake/images/intake/finance.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=finance',
      fields: [
        { key: 'loanAmount', label: '申请额度', type: 'text', required: true },
        { key: 'loanTerm', label: '期限', type: 'picker', options: ['12', '24', '36', '60'], suffix: '期' },
        { key: 'repaymentMethod', label: '还款方式', type: 'picker', options: ['等额本息', '先息后本'] }
      ]
    },
    { id: 'uploads', title: '资料上传', desc: '房产证、评估报告、流水、征信授权', icon: '/subpackages/intake/images/intake/upload.webp', type: 'upload', path: '/subpackages/intake/pages/upload/upload' }
  ],
  lease: [
    {
      id: 'basic', title: '租赁需求信息', desc: '城市、租赁物类型与设备价值',
      icon: '/subpackages/intake/images/intake/basic.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=basic',
      guide: ['请明确租赁物用途与交付时间'],
      fields: [
        { key: 'applyCity', label: '城市', type: 'text', required: true },
        { key: 'loanPurpose', label: '租赁物类型', type: 'picker', options: ['生产设备', '运营车辆', '商用设备', '工程机械', '其他'], required: true },
        { key: 'expectedAmount', label: '设备价值', type: 'text', required: true, placeholder: '如：80万' },
        { key: 'expectedTerm', label: '租赁期限', type: 'picker', options: ['12期', '24期', '36期', '48期'] },
        { key: 'urgency', label: '期望交付时间', type: 'picker', options: ['一个月内', '三个月内', '仅了解'] },
        { key: 'remark', label: '设备描述', type: 'textarea', placeholder: '品牌型号、数量、用途等' }
      ]
    },
    {
      id: 'work', title: '企业信息', desc: '承租企业资质',
      icon: '/subpackages/intake/images/intake/work.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=work',
      fields: [
        { key: 'companyName', label: '企业名称', type: 'text', required: true },
        { key: 'businessLicense', label: '信用代码', type: 'text', required: true },
        { key: 'industry', label: '所属行业', type: 'picker', options: ['制造业', '物流', '建筑', '农业', '其他'] },
        { key: 'workYears', label: '成立年限', type: 'text', required: true },
        { key: 'companyAddress', label: '注册地址', type: 'textarea' },
        { key: 'position', label: '联系人职务', type: 'text', required: true }
      ]
    },
    {
      id: 'personal', title: '联系人信息', icon: '/subpackages/intake/images/intake/personal.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=personal',
      fields: [
        { key: 'realName', label: '联系人姓名', type: 'text', required: true },
        { key: 'mobile', label: '联系电话', type: 'number', required: true },
        { key: 'email', label: '邮箱', type: 'text' }
      ]
    },
    {
      id: 'finance', title: '租赁方案', icon: '/subpackages/intake/images/intake/finance.webp', type: 'form',
      path: '/subpackages/intake/pages/form/form?section=finance',
      fields: [
        { key: 'downPayment', label: '首付/保证金', type: 'text', placeholder: '如：20%' },
        { key: 'loanAmount', label: '融资金额', type: 'text', required: true },
        { key: 'loanTerm', label: '租期', type: 'picker', options: ['12', '24', '36', '48'], suffix: '期' },
        { key: 'repaymentMethod', label: '还款方式', type: 'picker', options: ['等额租金', '先息后本', '到期买断'] },
        { key: 'gpsRequired', label: '是否需要GPS监控', type: 'switch' }
      ]
    },
    { id: 'uploads', title: '资料上传', desc: '营业执照、流水、设备报价单', icon: '/subpackages/intake/images/intake/upload.webp', type: 'upload', path: '/subpackages/intake/pages/upload/upload' }
  ]
}

function viewStatusModule(id, title, desc, icon) {
  return {
    id,
    title,
    desc,
    icon,
    type: 'status-view',
    viewOnly: true,
    path: `/subpackages/intake/pages/status/status?section=${id}`
  }
}

const contractModule = {
  id: 'contract',
  title: '合同查看',
  desc: '电子合同预览、条款说明与签署状态',
  icon: '/subpackages/intake/images/intake/finance.webp',
  type: 'contract-view',
  viewOnly: true,
  path: '/subpackages/intake/pages/contract/contract'
}

module.exports = { formModules, viewStatusModule, contractModule }
