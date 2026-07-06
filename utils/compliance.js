/** 平台合规文案（居间服务，无金融牌照） */
const PLATFORM_NAME = '亮叶企服'
const SERVICE_TYPE = '金融信息咨询与居间撮合服务'

const DISCLAIMERS = {
  short: '本平台仅提供金融信息咨询与居间撮合，不发放贷款，不承诺审批结果。',
  footer: '亮叶企服不具备金融牌照，不从事放贷业务。具体利率、额度、期限以持牌金融机构审核及正式合同为准。',
  login: '登录即表示您已阅读并同意《用户服务协议》和《隐私政策》。',
  intake: '进件系统仅用于材料整理与进度管理，不代表任何机构审批承诺。',
  autoFinance: '汽车金融信息由合作持牌机构提供，平台仅协助材料对接与方案咨询。'
}

const FORBIDDEN_CLAIMS = ['包过', '秒批', '必过', '零门槛放款', '无征信放款', '内部渠道']

function sanitizeDisplayText(text) {
  if (!text) return text
  let result = String(text)
  result = result.replace(/助贷/g, '助融信息')
  result = result.replace(/发放贷款/g, '从事放贷')
  result = result.replace(/平台放款/g, '机构资金到账')
  return result
}

module.exports = {
  PLATFORM_NAME,
  SERVICE_TYPE,
  DISCLAIMERS,
  FORBIDDEN_CLAIMS,
  sanitizeDisplayText
}
