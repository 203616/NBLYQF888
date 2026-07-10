/**
 * 微信服务端 API 路由
 * 官方文档: https://developers.weixin.qq.com/miniprogram/dev/server/API/
 *
 * 注意事项:
 * - 所有接口在 WECHAT_SECRET 未配置时返回 { configured: false } 提示
 * - token 自动管理（缓存 7200 秒，提前 300 秒刷新）
 */
const express = require('express')
const router = express.Router()
const { ok, fail } = require('../utils/response')
const { requireAdmin } = require('../middleware/auth')
const wx = require('../services/wechat.service')

// ============================================================
// 工具中间件：检查微信是否已配置
// ============================================================
function requireWechat(req, res, next) {
  if (!process.env.WECHAT_APPID || !process.env.WECHAT_SECRET) {
    return fail(res, '微信小程序未配置（请在 .env 中设置 WECHAT_APPID 和 WECHAT_SECRET）', 503)
  }
  next()
}

// ============================================================
// 1. 接口调用凭证
// ============================================================

/**
 * 获取 Access Token（测试用，建议服务端内部使用）
 * GET /api/v1/wechat/token
 */
router.get('/token', requireWechat, async (req, res, next) => {
  try {
    const token = await wx.getAccessToken()
    const stable = await wx.getStableToken()
    ok(res, {
      access_token: token ? token.slice(0, 10) + '...' + token.slice(-10) : null,
      stable_token: stable ? stable.slice(0, 10) + '...' + stable.slice(-10) : null,
      expires_at: Date.now() + 6900000,
      note: '完整 token 仅服务端存储，此处仅展示前后10位用于验证'
    })
  } catch (e) { next(e) }
})

/**
 * 查询 API 调用额度
 * GET /api/v1/wechat/quota?path=xxx
 */
router.get('/quota', requireWechat, async (req, res, next) => {
  try {
    const data = await wx.getApiQuota(req.query.path || '')
    ok(res, data)
  } catch (e) { next(e) }
})

// ============================================================
// 2. 小程序登录
// ============================================================

/**
 * 登录凭证校验（code 换取 openid）
 * POST /api/v1/wechat/code2session
 * Body: { code: string }
 */
router.post('/code2session', requireWechat, async (req, res, next) => {
  try {
    const { code } = req.body
    if (!code) return fail(res, '参数 code 不能为空')
    const result = await wx.jscode2session(code)
    if (!result) return fail(res, '微信登录失败，请检查 WECHAT_APPID 和 WECHAT_SECRET')
    ok(res, {
      openid: result.openid,
      sessionKey: result.sessionKey ? result.sessionKey.slice(0, 6) + '...' : '',
      unionid: result.unionid || ''
    })
  } catch (e) { next(e) }
})

/**
 * 检验登录态
 * POST /api/v1/wechat/check-session
 */
router.post('/check-session', requireWechat, async (req, res, next) => {
  try {
    const { openid, sessionKey } = req.body
    if (!openid) return fail(res, '参数 openid 不能为空')
    const result = await wx.checkSession(openid, sessionKey)
    ok(res, result)
  } catch (e) { next(e) }
})

// ============================================================
// 3. 用户信息 - 手机号
// ============================================================

/**
 * 获取用户手机号
 * POST /api/v1/wechat/get-phone-number
 * Body: { code: string }  -- wx.getPhoneNumber() 返回的 code
 */
router.post('/get-phone-number', requireWechat, async (req, res, next) => {
  try {
    const { code } = req.body
    if (!code) return fail(res, '参数 code 不能为空')
    const phoneInfo = await wx.getPhoneNumber(code)
    if (!phoneInfo) return fail(res, '获取手机号失败', 400)
    ok(res, {
      phoneNumber: phoneInfo.phoneNumber,
      purePhoneNumber: phoneInfo.purePhoneNumber,
      countryCode: phoneInfo.countryCode
    })
  } catch (e) { next(e) }
})

/**
 * 支付后获取 UnionId
 * GET /api/v1/wechat/paid-unionid?openid=xxx&transaction_id=xxx
 */
router.get('/paid-unionid', requireWechat, async (req, res, next) => {
  try {
    const { openid, transaction_id } = req.query
    if (!openid) return fail(res, '参数 openid 不能为空')
    const result = await wx.getPaidUnionid(openid, transaction_id)
    ok(res, result)
  } catch (e) { next(e) }
})

// ============================================================
// 4. 小程序码与链接
// ============================================================

/**
 * 获取小程序码
 * POST /api/v1/wechat/wxacode
 * Body: { path, width? }
 * 返回: PNG 图片（Content-Type: image/png）
 */
router.post('/wxacode', requireWechat, async (req, res, next) => {
  try {
    const { path, width = 430 } = req.body
    if (!path) return fail(res, '参数 path 不能为空')
    const buffer = await wx.getWxaCode(path, width)
    if (!buffer) return fail(res, '生成小程序码失败')
    res.set('Content-Type', 'image/png')
    res.send(buffer)
  } catch (e) { next(e) }
})

/**
 * 获取不限制的小程序码
 * POST /api/v1/wechat/wxacode-unlimit
 * Body: { scene, page?, width? }
 */
router.post('/wxacode-unlimit', requireWechat, async (req, res, next) => {
  try {
    const { scene, page, width = 430 } = req.body
    if (!scene) return fail(res, '参数 scene 不能为空')
    const buffer = await wx.getWxaCodeUnlimited(scene, page, width)
    if (!buffer) return fail(res, '生成小程序码失败')
    res.set('Content-Type', 'image/png')
    res.send(buffer)
  } catch (e) { next(e) }
})

/**
 * 获取 URL Scheme
 * POST /api/v1/wechat/generate-scheme
 * Body: { path, query? }
 */
router.post('/generate-scheme', requireWechat, async (req, res, next) => {
  try {
    const { path, query } = req.body
    if (!path) return fail(res, '参数 path 不能为空')
    const scheme = await wx.generateScheme(path, query)
    ok(res, { scheme, openlink: scheme })
  } catch (e) { next(e) }
})

/**
 * 获取 URL Link
 * POST /api/v1/wechat/generate-urllink
 * Body: { path, query? }
 */
router.post('/generate-urllink', requireWechat, async (req, res, next) => {
  try {
    const { path, query } = req.body
    if (!path) return fail(res, '参数 path 不能为空')
    const urlLink = await wx.generateUrlLink(path, query)
    ok(res, { url_link: urlLink })
  } catch (e) { next(e) }
})

/**
 * 获取 Short Link
 * POST /api/v1/wechat/generate-shortlink
 * Body: { pageUrl, pageTitle? }
 */
router.post('/generate-shortlink', requireWechat, async (req, res, next) => {
  try {
    const { pageUrl, pageTitle } = req.body
    if (!pageUrl) return fail(res, '参数 pageUrl 不能为空')
    const link = await wx.generateShortLink(pageUrl, pageTitle)
    ok(res, { link })
  } catch (e) { next(e) }
})

// ============================================================
// 5. 内容安全
// ============================================================

/**
 * 文本内容安全识别
 * POST /api/v1/wechat/msg-sec-check
 * Body: { content: string }
 */
router.post('/msg-sec-check', requireWechat, async (req, res, next) => {
  try {
    const { content } = req.body
    if (!content) return fail(res, '参数 content 不能为空')
    const result = await wx.msgSecCheck(content)
    ok(res, {
      pass: result.pass,
      suggest: result.suggest,
      label: result.label,
      riskLevel: result.label === 100 ? '正常' :
                result.label < 20000 ? '可疑' :
                result.label < 30000 ? '敏感' : '违规'
    })
  } catch (e) { next(e) }
})

/**
 * 获取用户安全等级
 * POST /api/v1/wechat/user-risk-rank
 */
router.post('/user-risk-rank', requireWechat, async (req, res, next) => {
  try {
    const { openid, mobile } = req.body
    if (!openid) return fail(res, '参数 openid 不能为空')
    const result = await wx.getUserRiskRank(openid, process.env.WECHAT_APPID, 1, mobile)
    ok(res, result)
  } catch (e) { next(e) }
})

// ============================================================
// 6. 客服消息
// ============================================================

/**
 * 发送客服消息
 * POST /api/v1/wechat/send-custom-msg
 * Body: { openid, msgType, content }
 */
router.post('/send-custom-msg', requireWechat, async (req, res, next) => {
  try {
    const { openid, msgType, content } = req.body
    if (!openid || !msgType || !content) return fail(res, '参数不完整（需要 openid, msgType, content）')
    const result = await wx.sendCustomMessage(openid, msgType, content)
    ok(res, { success: !result?.errcode || result.errcode === 0 })
  } catch (e) { next(e) }
})

/**
 * 查询客服账号列表
 * GET /api/v1/wechat/kf-list
 */
router.get('/kf-list', requireWechat, async (req, res, next) => {
  try {
    const list = await wx.getKfList()
    ok(res, list)
  } catch (e) { next(e) }
})

/**
 * 查询微信客服绑定情况
 * GET /api/v1/wechat/work-bind-status
 */
router.get('/work-bind-status', requireWechat, async (req, res, next) => {
  try {
    const status = await wx.getWorkBindStatus()
    ok(res, status)
  } catch (e) { next(e) }
})

// ============================================================
// 7. 订阅消息
// ============================================================

/**
 * 发送订阅消息
 * POST /api/v1/wechat/send-subscribe
 * Body: { openid, templateId, page?, data }
 */
router.post('/send-subscribe', requireWechat, async (req, res, next) => {
  try {
    const { openid, templateId, page, data } = req.body
    if (!openid || !templateId) return fail(res, '参数不完整（需要 openid, templateId）')
    const result = await wx.sendSubscribeMessage({ openid, templateId, page, data })
    ok(res, result)
  } catch (e) { next(e) }
})

/**
 * 获取模板列表
 * GET /api/v1/wechat/templates
 */
router.get('/templates', requireWechat, async (req, res, next) => {
  try {
    const list = await wx.getTemplateList()
    ok(res, list)
  } catch (e) { next(e) }
})

/**
 * 获取类目列表
 * GET /api/v1/wechat/categories
 */
router.get('/categories', requireWechat, async (req, res, next) => {
  try {
    const categories = await wx.getSubscribeCategory()
    ok(res, categories)
  } catch (e) { next(e) }
})

/**
 * 获取类目下的公共模板
 * GET /api/v1/wechat/pub-templates?ids=xxx&start=0&limit=30
 */
router.get('/pub-templates', requireWechat, async (req, res, next) => {
  try {
    const { ids, start, limit } = req.query
    if (!ids) return fail(res, '参数 ids 不能为空（类目ID，逗号分隔）')
    const result = await wx.getPubTemplateTitles(ids, Number(start) || 0, Number(limit) || 30)
    ok(res, result)
  } catch (e) { next(e) }
})

/**
 * 选用模板
 * POST /api/v1/wechat/add-template
 * Body: { tid, kidList, sceneDesc? }
 */
router.post('/add-template', requireWechat, async (req, res, next) => {
  try {
    const { tid, kidList, sceneDesc } = req.body
    if (!tid || !kidList) return fail(res, '参数不完整（需要 tid, kidList）')
    const result = await wx.addTemplate(tid, kidList, sceneDesc)
    ok(res, result)
  } catch (e) { next(e) }
})

// ============================================================
// 8. 运维信息
// ============================================================

/**
 * 查询域名配置
 * GET /api/v1/wechat/domain-config
 */
router.get('/domain-config', requireWechat, async (req, res, next) => {
  try {
    const config = await wx.getDomainConfig()
    ok(res, config)
  } catch (e) { next(e) }
})

/**
 * 获取微信 API 服务器 IP
 * GET /api/v1/wechat/api-ips
 */
router.get('/api-ips', requireWechat, async (req, res, next) => {
  try {
    const ips = await wx.getApiDomainIp()
    ok(res, ips)
  } catch (e) { next(e) }
})

/**
 * 获取微信推送服务器 IP
 * GET /api/v1/wechat/callback-ips
 */
router.get('/callback-ips', requireWechat, async (req, res, next) => {
  try {
    const ips = await wx.getCallbackIp()
    ok(res, ips)
  } catch (e) { next(e) }
})

/**
 * 获取性能数据
 * GET /api/v1/wechat/performance?costtime_type=0&time=xxx
 */
router.get('/performance', requireWechat, async (req, res, next) => {
  try {
    const data = await wx.getPerformanceData(
      Number(req.query.costtime_type) || 0,
      req.query.time || ''
    )
    ok(res, data)
  } catch (e) { next(e) }
})

/**
 * 获取 JS 错误详情
 * GET /api/v1/wechat/js-errors?date=20260709&start=0&limit=20
 */
router.get('/js-errors', requireWechat, async (req, res, next) => {
  try {
    const { date, start, limit } = req.query
    if (!date) return fail(res, '参数 date 不能为空（格式: 20260709）')
    const result = await wx.getJsErrorDetail(date, Number(start) || 0, Number(limit) || 20)
    ok(res, result)
  } catch (e) { next(e) }
})

/**
 * 获取用户反馈列表
 * GET /api/v1/wechat/feedback
 */
router.get('/feedback', requireWechat, async (req, res, next) => {
  try {
    const list = await wx.getFeedbackList(
      Number(req.query.page) || 1,
      Number(req.query.pageSize) || 20
    )
    ok(res, list)
  } catch (e) { next(e) }
})

// ============================================================
// 9. 动态消息
// ============================================================

/**
 * 创建 activity_id
 * POST /api/v1/wechat/activity-id
 */
router.post('/activity-id', requireWechat, async (req, res, next) => {
  try {
    const { openid } = req.body
    const result = await wx.createActivityId(openid)
    ok(res, result)
  } catch (e) { next(e) }
})

// ============================================================
// 10. 状态查询
// ============================================================

/**
 * 微信集成状态总览
 * GET /api/v1/wechat/status
 */
router.get('/status', (req, res) => {
  const status = wx.getWechatServiceStatus()
  ok(res, status)
})

module.exports = router
