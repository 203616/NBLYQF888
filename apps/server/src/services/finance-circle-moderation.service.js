const fs = require('fs')
const path = require('path')
const { scanFinanceContent } = require('./aliyun-content-security.service')

const root = path.resolve(__dirname, '../../../..')
const configPath = path.join(root, 'deploy', 'finance-circle-moderation.json')

const DEFAULT_RULES = {
  enabled: true,
  autoApproveTextOnly: true,
  maxTextLengthForAutoApprove: 200,
  reviewPostsWithImages: true,
  blockedKeywords: [],
  blockedKeywordAction: 'reject',
  useAliyunContentSecurity: true,
  aliyunTextBlockAction: 'reject',
  aliyunTextReviewAction: 'pending',
  aliyunImageBlockAction: 'reject',
  aliyunImageReviewAction: 'pending'
}

function normalizeRules(input = {}) {
  const rules = { ...DEFAULT_RULES, ...input }
  rules.blockedKeywords = Array.isArray(rules.blockedKeywords)
    ? [...new Set(rules.blockedKeywords.map(w => String(w || '').trim()).filter(Boolean))]
    : []
  rules.maxTextLengthForAutoApprove = Math.max(20, Number(rules.maxTextLengthForAutoApprove) || 200)
  return rules
}

function loadModerationRules() {
  try {
    if (!fs.existsSync(configPath)) return normalizeRules()
    return normalizeRules(JSON.parse(fs.readFileSync(configPath, 'utf8')))
  } catch {
    return normalizeRules()
  }
}

function saveModerationRules(input = {}) {
  const rules = normalizeRules({ ...loadModerationRules(), ...input })
  fs.writeFileSync(configPath, `${JSON.stringify(rules, null, 2)}\n`, 'utf8')
  return rules
}

function parseImages(images) {
  if (Array.isArray(images)) return images.filter(Boolean)
  if (!images) return []
  try {
    const arr = JSON.parse(images)
    return Array.isArray(arr) ? arr.filter(Boolean) : []
  } catch {
    return []
  }
}

function findBlockedKeyword(content, keywords) {
  const text = String(content || '')
  for (const word of keywords || []) {
    if (word && text.includes(word)) return word
  }
  return null
}

function mapCloudAction(suggestion, blockAction, reviewAction) {
  if (suggestion === 'block') return blockAction === 'pending' ? 'pending' : 'rejected'
  if (suggestion === 'review') return reviewAction === 'reject' ? 'rejected' : 'pending'
  return null
}

function evaluateFinancePostReview({ content, images }) {
  const rules = loadModerationRules()
  const imageList = parseImages(images)
  const text = String(content || '').trim()

  if (!rules.enabled) {
    return { status: 'pending', note: '人工审核', auto: false, rule: 'disabled' }
  }

  const blocked = findBlockedKeyword(text, rules.blockedKeywords)
  if (blocked) {
    const action = rules.blockedKeywordAction === 'pending' ? 'pending' : 'rejected'
    return {
      status: action,
      note: action === 'rejected' ? `命中敏感词「${blocked}」` : `含敏感词「${blocked}」，转人工`,
      auto: true,
      rule: 'blockedKeyword'
    }
  }

  if (imageList.length && rules.reviewPostsWithImages) {
    return { status: 'pending', note: '含图片，待人工审核', auto: true, rule: 'hasImages' }
  }

  if (
    rules.autoApproveTextOnly &&
    !imageList.length &&
    text.length <= (rules.maxTextLengthForAutoApprove || 200)
  ) {
    return { status: 'approved', note: '纯文字自动通过', auto: true, rule: 'textOnly' }
  }

  return { status: 'pending', note: '待人工审核', auto: false, rule: 'default' }
}

async function evaluateFinancePostReviewAsync({ content, images }) {
  const rules = loadModerationRules()
  const imageList = parseImages(images)
  const text = String(content || '').trim()

  if (!rules.enabled) {
    return { status: 'pending', note: '人工审核', auto: false, rule: 'disabled' }
  }

  const blocked = findBlockedKeyword(text, rules.blockedKeywords)
  if (blocked) {
    const action = rules.blockedKeywordAction === 'pending' ? 'pending' : 'rejected'
    return {
      status: action,
      note: action === 'rejected' ? `命中敏感词「${blocked}」` : `含敏感词「${blocked}」，转人工`,
      auto: true,
      rule: 'blockedKeyword'
    }
  }

  if (rules.useAliyunContentSecurity) {
    try {
      const cloud = await scanFinanceContent({ content: text, images: imageList })
      if (!cloud.pass) {
        const isImage = cloud.source === 'image'
        const blockAction = isImage ? rules.aliyunImageBlockAction : rules.aliyunTextBlockAction
        const reviewAction = isImage ? rules.aliyunImageReviewAction : rules.aliyunTextReviewAction
        const status = mapCloudAction(cloud.suggestion, blockAction, reviewAction) || 'pending'
        const labelText = (cloud.labels || []).slice(0, 2).join('、') || cloud.suggestion
        const note = isImage
          ? `阿里云图片检测：${labelText}`
          : `阿里云文本检测：${labelText}`
        return { status, note, auto: true, rule: isImage ? 'aliyunImage' : 'aliyunText', cloud }
      }
    } catch (err) {
      console.warn('aliyun content security failed', err.message)
      return { status: 'pending', note: '云检测异常，转人工审核', auto: true, rule: 'aliyunError' }
    }
  }

  if (imageList.length && rules.reviewPostsWithImages) {
    return { status: 'pending', note: '含图片，待人工审核', auto: true, rule: 'hasImages' }
  }

  if (
    rules.autoApproveTextOnly &&
    !imageList.length &&
    text.length <= (rules.maxTextLengthForAutoApprove || 200)
  ) {
    return { status: 'approved', note: '纯文字自动通过', auto: true, rule: 'textOnly' }
  }

  return { status: 'pending', note: '待人工审核', auto: false, rule: 'default' }
}

module.exports = {
  loadModerationRules,
  saveModerationRules,
  evaluateFinancePostReview,
  evaluateFinancePostReviewAsync,
  configPath
}
