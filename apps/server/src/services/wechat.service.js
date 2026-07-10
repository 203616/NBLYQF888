/**
 * 微信服务端 API 集成服务
 * 官方文档: https://developers.weixin.qq.com/miniprogram/dev/server/API/
 */
const https = require('https')
const http = require('http')
const querystring = require('querystring')
const db = require('../db')

// ============================================================
// 工具函数
// ============================================================

let tokenCache = { token: '', expiresAt: 0 }

function getWechatConfig() {
  return {
    appId: process.env.WECHAT_APPID || '',
    secret: process.env.WECHAT_SECRET || '',
    templates: {
      intakeAudit: process.env.WECHAT_TEMPLATE_INTAKE_AUDIT || '',
      intakeDisburse: process.env.WECHAT_TEMPLATE_INTAKE_DISBURSE || '',
      financeReview: process.env.WECHAT_TEMPLATE_FINANCE_REVIEW || ''
    }
  }
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const agent = new https.Agent({ rejectUnauthorized: false })
    https.get(url, { agent }, res => {
      let raw = ''
      res.on('data', c => { raw += c })
      res.on('end', () => {
        try { resolve(JSON.parse(raw)) } catch (e) { reject(new Error('JSON parse error: ' + raw.slice(0, 100))) }
      })
    }).on('error', reject)
  })
}

function httpsPost(url, data, responseType) {
  const body = JSON.stringify(data)
  return new Promise((resolve, reject) => {
    const agent = new https.Agent({ rejectUnauthorized: false })
    const parsed = new URL(url)
    const options = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      agent,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }
    const req = https.request(options, res => {
      // binary response (for QR code images etc.)
      if (responseType === 'buffer') {
        const chunks = []
        res.on('data', c => chunks.push(c))
        res.on('end', () => resolve(Buffer.concat(chunks)))
        return
      }
      let raw = ''
      res.on('data', c => { raw += c })
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw)
          if (parsed.errcode && parsed.errcode !== 0) {
            reject(new Error(`WeChat API error ${parsed.errcode}: ${parsed.errmsg}`))
          } else {
            resolve(parsed)
          }
        } catch (e) {
          resolve(raw) // non-JSON response (e.g., image buffer as text fallback)
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function httpsPostBuffer(url, data) {
  return httpsPost(url, data, 'buffer')
}

// ============================================================
// 1. 接口调用凭证
// 官方: /cgi-bin/token 和 /cgi-bin/stable_token
// ============================================================

/**
 * 获取全局唯一后台接口调用凭据（Access Token）
 * 官方: GET /cgi-bin/token
 */
async function getAccessToken() {
  const { appId, secret } = getWechatConfig()
  if (!appId || !secret) return null
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) return tokenCache.token

  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${secret}`
  const res = await httpsGet(url)
  if (res.errcode) throw new Error(`[WeChat] getAccessToken failed: ${res.errmsg || JSON.stringify(res)}`)
  if (!res.access_token) throw new Error(res.errmsg || '获取微信 access_token 失败')
  tokenCache = { token: res.access_token, expiresAt: Date.now() + (res.expires_in - 300) * 1000 }
  return res.access_token
}

/**
 * 获取稳定版接口调用凭据
 * 官方: POST /cgi-bin/stable_token
 * 与 getAccessToken 互相隔离，互不影响
 */
async function getStableToken(forceRefresh = false) {
  const { appId, secret } = getWechatConfig()
  if (!appId || !secret) return null
  const url = 'https://api.weixin.qq.com/cgi-bin/stable_token'
  const res = await httpsPost(url, {
    grant_type: 'client_credential',
    appid: appId,
    secret: secret,
    force_refresh: forceRefresh
  })
  return res.access_token || null
}

/**
 * 查询 API 调用额度
 * 官方: GET /cgi-bin/openapi/quota/get
 */
async function getApiQuota(path) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/cgi-bin/openapi/quota/get?access_token=${token}&cgi_path=${encodeURIComponent(path)}`
  return httpsGet(url)
}

/**
 * 查询 rid 信息（调试用）
 * 官方: GET /cgi-bin/openapi/rid/get
 */
async function getRidInfo(rid) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/cgi-bin/openapi/rid/get?access_token=${token}&rid=${rid}`
  return httpsGet(url)
}

// ============================================================
// 2. 小程序登录
// 官方: /sns/jscode2session, /wxa/checksession
// ============================================================

/**
 * 登录凭证校验（code 换取 openid / session_key）
 * 官方: GET /sns/jscode2session
 * @param {string} code - wx.login() 获取的临时 code
 * @returns {Promise<{openid, session_key, unionid?}>}
 */
async function jscode2session(code) {
  const { appId, secret } = getWechatConfig()
  if (!appId || !secret) return null
  if (!code) throw new Error('code is required')
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${encodeURIComponent(code)}&grant_type=authorization_code`
  const res = await httpsGet(url)
  if (res.errcode) throw new Error(`[WeChat] jscode2session failed: ${res.errmsg || JSON.stringify(res)}`)
  return { openid: res.openid, sessionKey: res.session_key, unionid: res.unionid || '' }
}

/**
 * 检验登录态（校验服务器保存的 session_key 是否有效）
 * 官方: POST /wxa/checksession
 */
async function checkSession(openid, sessionKey) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/wxa/checksession?access_token=${token}&openid=${openid}&session_key=${encodeURIComponent(sessionKey)}&sig_method=hmac_sha256`
  return httpsGet(url)
}

/**
 * 重置登录态
 * 官方: POST /wxa/resetusersessionkey
 */
async function resetUserSessionKey(openid) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/wxa/resetusersessionkey?access_token=${token}&openid=${openid}`
  return httpsPost(url, {})
}

// ============================================================
// 3. 用户信息 - 手机号
// 官方: /wxa/business/getuserphonenumber
// ============================================================

/**
 * 获取用户手机号
 * 官方: POST /wxa/business/getuserphonenumber
 * @param {string} code - 通过 wx.getPhoneNumber() 获取的 code
 * @returns {Promise<{phoneNumber, purePhoneNumber, countryCode}>}
 */
async function getPhoneNumber(code) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${token}`
  const res = await httpsPost(url, { code })
  if (res.errcode) throw new Error(`[WeChat] getPhoneNumber failed: ${res.errmsg || JSON.stringify(res)}`)
  return res.phone_info || null
}

/**
 * 获取用户 encryptKey（网络层加密）
 * 官方: POST /wxa/business/getuserencryptkey
 */
async function getUserEncryptKey(openid, sessionKey) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/wxa/business/getuserencryptkey?access_token=${token}&openid=${openid}&session_key=${encodeURIComponent(sessionKey)}&sig_method=hmac_sha256`
  return httpsGet(url)
}

/**
 * 支付后获取 UnionId
 * 官方: GET /wxa/getpaidunionid
 */
async function getPaidUnionid(openid, transactionId) {
  const token = await getAccessToken()
  if (!token) return null
  let url = `https://api.weixin.qq.com/wxa/getpaidunionid?access_token=${token}&openid=${openid}`
  if (transactionId) url += `&transaction_id=${transactionId}`
  return httpsGet(url)
}

/**
 * 检查加密信息是否由微信生成（手机号加密数据）
 * 官方: POST /wxa/business/checkencryptedmsg
 */
async function checkEncryptedMsg(encryptedMsgHash) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/wxa/business/checkencryptedmsg?access_token=${token}`
  return httpsPost(url, { encrypted_msg_hash: encryptedMsgHash })
}

// ============================================================
// 4. 小程序码与小程序链接
// 官方: /wxa/getwxacode, /wxa/getwxacodeunlimit, /wxa/generate_urllink
// ============================================================

/**
 * 获取小程序码（适用于码数量较少的业务场景）
 * 官方: POST /wxa/getwxacode
 * @returns {Promise<Buffer>} PNG 图片的 Buffer
 */
async function getWxaCode(path, width = 430, autoColor = true) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/wxa/getwxacode?access_token=${token}`
  const buffer = await httpsPostBuffer(url, {
    path,
    width,
    auto_color: autoColor,
    check_path: false
  })
  return buffer
}

/**
 * 获取不限制的小程序码（适用于码数量极多的业务场景）
 * 官方: POST /wxa/getwxacodeunlimit
 * @returns {Promise<Buffer>} PNG 图片的 Buffer
 */
async function getWxaCodeUnlimited(scene, page, width = 430) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${token}`
  const buffer = await httpsPostBuffer(url, {
    scene,
    page,
    width,
    check_path: false,
    env_version: process.env.NODE_ENV === 'production' ? 'release' : 'trial'
  })
  return buffer
}

/**
 * 获取小程序二维码
 * 官方: POST /cgi-bin/wxaapp/createwxaqrcode
 */
async function createWxaQrcode(path, width = 430) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode?access_token=${token}`
  return httpsPostBuffer(url, { path, width })
}

/**
 * 获取加密 URL Scheme（拉起小程序）
 * 官方: POST /wxa/generatescheme
 */
async function generateScheme(path, query = '') {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/wxa/generatescheme?access_token=${token}`
  const res = await httpsPost(url, {
    jump_wxa: {
      path,
      query
    },
    expire_type: 1,
    expire_interval: 30
  })
  return res.openlink || res.scheme || null
}

/**
 * 获取加密 URL Link（短信、邮件、网页等拉起小程序）
 * 官方: POST /wxa/generate_urllink
 */
async function generateUrlLink(path, query = '', expireInterval = 30) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/wxa/generate_urllink?access_token=${token}`
  const res = await httpsPost(url, {
    path,
    query,
    expire_type: 1,
    expire_interval: expireInterval,
    env_version: process.env.NODE_ENV === 'production' ? 'release' : 'trial'
  })
  return res.url_link || null
}

/**
 * 获取 Short Link（微信内拉起小程序）
 * 官方: POST /wxa/genwxashortlink
 */
async function generateShortLink(pageUrl, pageTitle = '亮叶企服') {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/wxa/genwxashortlink?access_token=${token}`
  const res = await httpsPost(url, {
    page_url: pageUrl,
    page_title: pageTitle,
    is_permanent: false
  })
  return res.link || null
}

/**
 * 查询 scheme 码
 * 官方: POST /wxa/queryscheme
 */
async function queryScheme(scheme) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/wxa/queryscheme?access_token=${token}`
  return httpsPost(url, { scheme })
}

/**
 * 查询加密 URL Link
 * 官方: POST /wxa/query_urllink
 */
async function queryUrlLink(urlLink) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/wxa/query_urllink?access_token=${token}`
  return httpsPost(url, { url_link: urlLink })
}

// ============================================================
// 5. 小程序安全 - 内容安全
// 官方: /wxa/msg_sec_check, /wxa/media_check_async
// ============================================================

/**
 * 文本内容安全识别
 * 官方: POST /wxa/msg_sec_check
 * @param {string} content - 需要检测的文本内容（建议不超过 500KB）
 * @returns {Promise<{errcode, errmsg, result?: {suggest, label}}>}
 */
async function msgSecCheck(content) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/wxa/msg_sec_check?access_token=${token}`
  const res = await httpsPost(url, { content: String(content).slice(0, 500000) })
  return {
    pass: res.errcode === 0,
    suggest: res.result?.suggest || 'pass',
    label: res.result?.label || 100,
    errcode: res.errcode,
    errmsg: res.errmsg || ''
  }
}

/**
 * 多媒体内容安全识别（异步）
 * 官方: POST /wxa/media_check_async
 * @param {string} mediaUrl - 媒体文件 URL
 * @param {string} mediaType - 媒体类型: image / audio / video
 */
async function mediaCheckAsync(mediaUrl, mediaType = 'image') {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/wxa/media_check_async?access_token=${token}`
  return httpsPost(url, {
    media_url: mediaUrl,
    media_type: mediaType,
    version: 2,
    scene: 2 // 场景: 2 = 评论
  })
}

/**
 * 获取用户安全等级
 * 官方: POST /wxa/getuserriskrank
 */
async function getUserRiskRank(openid, appid, scene = 1, mobile = '') {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/wxa/getuserriskrank?access_token=${token}`
  const params = { openid, appid, scene }
  if (mobile) params.mobile_no = mobile
  return httpsPost(url, params)
}

// ============================================================
// 6. 客服消息
// 官方: /cgi-bin/message/custom/send, /customservice/kfaccount
// ============================================================

/**
 * 发送客服消息
 * 官方: POST /cgi-bin/message/custom/send
 */
async function sendCustomMessage(openid, msgType, content) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${token}`
  const payload = { touser: openid, msgtype: msgType }

  switch (msgType) {
    case 'text':
      payload.text = { content: String(content).slice(0, 2048) }
      break
    case 'image':
      payload.image = { media_id: content }
      break
    case 'link':
      payload.link = content
      break
    case 'miniprogrampage':
      payload.miniprogrampage = content
      break
    default:
      throw new Error(`Unsupported msgType: ${msgType}`)
  }
  return httpsPost(url, payload)
}

/**
 * 客服输入状态
 * 官方: POST /cgi-bin/message/custom/business/typing
 */
async function setTypingStatus(openid, command = 'Typing') {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/cgi-bin/message/custom/business/typing?access_token=${token}`
  return httpsPost(url, { touser: openid, command })
}

/**
 * 添加客服账号
 * 官方: POST /customservice/kfaccount/add
 */
async function addKfAccount(account, nickname, password) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/customservice/kfaccount/add?access_token=${token}`
  return httpsPost(url, { kf_account: account, nickname, password })
}

/**
 * 获取所有客服账号
 * 官方: GET /cgi-bin/customservice/getkflist
 */
async function getKfList() {
  const token = await getAccessToken()
  if (!token) return null
  return httpsGet(`https://api.weixin.qq.com/cgi-bin/customservice/getkflist?access_token=${token}`)
}

// ============================================================
// 7. 订阅消息
// 官方: /cgi-bin/message/subscribe/send, /wxaapi/newtmpl
// ============================================================

/**
 * 发送订阅消息
 * 官方: POST /cgi-bin/message/subscribe/send
 */
async function sendSubscribeMessage({ openid, templateId, page, data, miniprogramState }) {
  if (!openid || !templateId) return { skipped: true, reason: 'missing openid or templateId' }
  const token = await getAccessToken()
  if (!token) return { skipped: true, reason: 'wechat not configured' }

  const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${token}`
  const payload = {
    touser: openid,
    template_id: templateId,
    page: page || 'pages/home/home',
    miniprogram_state: miniprogramState || (process.env.NODE_ENV === 'production' ? 'formal' : 'trial'),
    lang: 'zh_CN',
    data
  }
  const res = await httpsPost(url, payload)
  // errcode 0 = success, 43101 = user refused, 40003 = invalid openid
  return { success: res.errcode === 0, errcode: res.errcode, errmsg: res.errmsg || '' }
}

/**
 * 获取小程序类目
 * 官方: GET /wxaapi/newtmpl/getcategory
 */
async function getSubscribeCategory() {
  const token = await getAccessToken()
  if (!token) return null
  return httpsGet(`https://api.weixin.qq.com/wxaapi/newtmpl/getcategory?access_token=${token}`)
}

/**
 * 获取类目下的公共模板
 * 官方: GET /wxaapi/newtmpl/getpubtemplatetitles
 */
async function getPubTemplateTitles(ids, start = 0, limit = 30) {
  const token = await getAccessToken()
  if (!token) return null
  const idsStr = Array.isArray(ids) ? ids.join(',') : ids
  return httpsGet(`https://api.weixin.qq.com/wxaapi/newtmpl/getpubtemplatetitles?access_token=${token}&ids=${idsStr}&start=${start}&limit=${limit}`)
}

/**
 * 选用模板到私有模板库
 * 官方: POST /wxaapi/newtmpl/addtemplate
 */
async function addTemplate(tid, kidList, sceneDesc = '') {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/wxaapi/newtmpl/addtemplate?access_token=${token}`
  return httpsPost(url, { tid, kidList, sceneDesc })
}

/**
 * 获取已有模板列表
 * 官方: GET /wxaapi/newtmpl/gettemplate
 */
async function getTemplateList() {
  const token = await getAccessToken()
  if (!token) return null
  return httpsGet(`https://api.weixin.qq.com/wxaapi/newtmpl/gettemplate?access_token=${token}`)
}

/**
 * 删除模板
 * 官方: POST /wxaapi/newtmpl/deltemplate
 */
async function deleteTemplate(priTmplId) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/wxaapi/newtmpl/deltemplate?access_token=${token}`
  return httpsPost(url, { priTmplId })
}

// ============================================================
// 8. 消息相关 - 动态消息
// 官方: /cgi-bin/message/wxopen/activityid/create
// ============================================================

/**
 * 创建 activity_id（动态消息/私密消息）
 * 官方: POST /cgi-bin/message/wxopen/activityid/create
 */
async function createActivityId(openid = '') {
  const token = await getAccessToken()
  if (!token) return null
  let url = `https://api.weixin.qq.com/cgi-bin/message/wxopen/activityid/create?access_token=${token}`
  if (openid) url += `&openid=${openid}`
  const res = await httpsGet(url.startsWith('http') ? url : url)
  return { activityId: res.activity_id, expiration: res.expiration_interval || 86400 }
}

/**
 * 修改动态消息
 * 官方: POST /cgi-bin/message/wxopen/updatablemsg/send
 */
async function updateDynamicMessage(activityId, targetState, templateInfo) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/cgi-bin/message/wxopen/updatablemsg/send?access_token=${token}`
  return httpsPost(url, {
    activity_id: activityId,
    target_state: targetState,
    template_info: templateInfo
  })
}

// ============================================================
// 9. 小程序客服管理 / 微信客服绑定
// 官方: /customservice/work/*
// ============================================================

/**
 * 查询微信客服绑定情况
 * 官方: GET /customservice/work/get
 */
async function getWorkBindStatus() {
  const token = await getAccessToken()
  if (!token) return null
  return httpsGet(`https://api.weixin.qq.com/customservice/work/get?access_token=${token}`)
}

/**
 * 绑定微信客服
 * 官方: POST /customservice/work/bind
 */
async function bindWorkKf(kfOpenid) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/customservice/work/bind?access_token=${token}`
  return httpsPost(url, { kf_openid: kfOpenid })
}

/**
 * 解除绑定微信客服
 * 官方: POST /customservice/work/unbind
 */
async function unbindWorkKf(kfOpenid) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/customservice/work/unbind?access_token=${token}`
  return httpsPost(url, { kf_openid: kfOpenid })
}

// ============================================================
// 10. 上传临时素材
// 官方: /cgi-bin/media/upload, /cgi-bin/media/get
// ============================================================

/**
 * 新增临时素材
 * 官方: POST /cgi-bin/media/upload
 * Node.js 端需要 multipart/form-data 上传，这里用 URL 简化
 * 实际使用建议用 form-data 库
 */
async function uploadTempMedia(type, fileUrl) {
  const token = await getAccessToken()
  if (!token) return null
  // 简易实现：从远程 URL 下载后上传，或直接用 wx.uploadFile 从客户端上传
  const postUrl = `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${token}&type=${type}`
  // 实际生产环境应使用 form-data 库构造 multipart 请求
  // 这里返回上传 URL，客户端使用 wx.uploadFile 上传
  return { uploadUrl: postUrl, note: '请使用 wx.uploadFile 上传' }
}

/**
 * 获取临时素材
 * 官方: GET /cgi-bin/media/get
 */
async function getTempMedia(mediaId) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/cgi-bin/media/get?access_token=${token}&media_id=${mediaId}`
  // 返回 Buffer
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.headers['content-type']?.includes('application/json')) {
        let raw = ''
        res.on('data', c => raw += c)
        res.on('end', () => {
          try {
            const j = JSON.parse(raw)
            reject(new Error(j.errmsg || 'get media failed'))
          } catch (e) { reject(new Error(raw.slice(0, 100))) }
        })
        return
      }
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks)))
    }).on('error', reject)
  })
}

// ============================================================
// 11. 运维中心
// 官方: /wxa/getwxadevinfo, /wxaapi/log/*
// ============================================================

/**
 * 查询域名配置
 * 官方: GET /wxa/getwxadevinfo
 */
async function getDomainConfig() {
  const token = await getAccessToken()
  if (!token) return null
  return httpsGet(`https://api.weixin.qq.com/wxa/getwxadevinfo?access_token=${token}`)
}

/**
 * 获取性能数据
 * 官方: GET /wxaapi/log/get_performance
 */
async function getPerformanceData(costTimeType = 0, time = '') {
  const token = await getAccessToken()
  if (!token) return null
  let url = `https://api.weixin.qq.com/wxaapi/log/get_performance?access_token=${token}&costtime_type=${costTimeType}`
  if (time) url += `&time=${time}`
  return httpsGet(url)
}

/**
 * 查询 JS 错误详情
 * 官方: GET /wxaapi/log/jserr_detail
 */
async function getJsErrorDetail(date, start, limit, errType = 1) {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/wxaapi/log/jserr_detail?access_token=${token}` +
    `&date=${date}&start=${start}&limit=${limit}&errType=${errType}`
  return httpsGet(url)
}

/**
 * 获取用户反馈列表
 * 官方: GET /wxaapi/feedback/list
 */
async function getFeedbackList(page = 1, pageSize = 20) {
  const token = await getAccessToken()
  if (!token) return null
  return httpsGet(`https://api.weixin.qq.com/wxaapi/feedback/list?access_token=${token}&page=${page}&page_size=${pageSize}`)
}

// ============================================================
// 12. 其他工具函数
// ============================================================

/**
 * 获取微信 API 服务器 IP 地址
 * 官方: GET /cgi-bin/get_api_domain_ip
 */
async function getApiDomainIp() {
  const token = await getAccessToken()
  if (!token) return null
  return httpsGet(`https://api.weixin.qq.com/cgi-bin/get_api_domain_ip?access_token=${token}`)
}

/**
 * 获取微信推送服务器 IP
 * 官方: GET /cgi-bin/getcallbackip
 */
async function getCallbackIp() {
  const token = await getAccessToken()
  if (!token) return null
  return httpsGet(`https://api.weixin.qq.com/cgi-bin/getcallbackip?access_token=${token}`)
}

/**
 * 网络检测
 * 官方: POST /cgi-bin/callback/check
 */
async function checkNetwork(action = 'all', checkOperator = 'DEFAULT') {
  const token = await getAccessToken()
  if (!token) return null
  const url = `https://api.weixin.qq.com/cgi-bin/callback/check?access_token=${token}`
  return httpsPost(url, { action, check_operator: checkOperator })
}

// ============================================================
// 业务集成函数（已有项目保留）
// ============================================================

function notifyIntakeStatus(application, eventType) {
  const payload = application.payload || {}
  const personal = payload.personal || {}
  const userId = application.user_id
  if (!userId) return Promise.resolve({ skipped: true })

  const user = db.prepare('SELECT openid, phone FROM users WHERE id = ?').get(userId)
  if (!user || !user.openid) return Promise.resolve({ skipped: true, reason: 'no openid' })

  const { templates } = getWechatConfig()
  const templateId = templates[eventType === 'audit' ? 'intakeAudit' : 'intakeDisburse']
  if (!templateId) return Promise.resolve({ skipped: true, reason: 'no template' })

  const statusText = {
    auditing: '审核中', approved: '审核通过',
    disbursed: '已放款', archived: '已归档'
  }

  return sendSubscribeMessage({
    openid: user.openid,
    templateId,
    page: `subpackages/intake/pages/status/status?section=${eventType === 'disburse' ? 'disburse' : 'audit'}`,
    data: {
      thing1: { value: (application.product_name || '进件申请').slice(0, 20) },
      phrase2: { value: statusText[application.status] || application.status },
      name3: { value: (personal.realName || '客户').slice(0, 20) },
      character_string4: { value: application.application_no.slice(0, 32) }
    }
  }).then(res => {
    if (userId) {
      db.prepare('INSERT INTO notifications (user_id, title, content, type, link) VALUES (?, ?, ?, ?, ?)').run(
        userId, '进件进度更新',
        `您的进件 ${application.application_no} 状态已更新为：${statusText[application.status] || application.status}`,
        'intake', '/subpackages/intake/pages/status/status?section=audit'
      )
    }
    return res
  })
}

function findUserOpenidByPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.length < 11) return null
  const user = db.prepare('SELECT openid FROM users WHERE phone = ?').get(digits)
    || db.prepare('SELECT openid FROM users WHERE phone LIKE ?').get(`%${digits.slice(-11)}%`)
  return user?.openid || null
}

async function notifyFinanceReviewSubscribe({ authorPhone, postId, reviewStatus, reviewNote = '', contentPreview = '' }) {
  const { templates } = getWechatConfig()
  const templateId = templates.financeReview
  if (!templateId) return { skipped: true, reason: 'no template' }
  const openid = findUserOpenidByPhone(authorPhone)
  if (!openid) return { skipped: true, reason: 'no openid' }

  const approved = reviewStatus === 'approved'
  return sendSubscribeMessage({
    openid, templateId,
    page: 'pages/financeCircle/financeCircle',
    data: {
      thing1: { value: String(contentPreview || '融圈动态').slice(0, 20) },
      phrase2: { value: approved ? '审核通过' : '未通过' },
      thing3: { value: String(reviewNote || (approved ? '已展示' : '请修改后重试')).slice(0, 20) },
      time4: { value: new Date().toISOString().slice(0, 16).replace('T', ' ') }
    }
  }).then(res => ({ ...res, postId }))
}

/**
 * 获取微信集成状态（供管理后台显示）
 */
function getWechatServiceStatus() {
  const { appId, secret, templates } = getWechatConfig()
  const hasAppId = !!appId
  const hasSecret = !!secret
  const hasAuditTemplate = !!templates.intakeAudit
  const hasDisburseTemplate = !!templates.intakeDisburse
  const hasFinanceTemplate = !!templates.financeReview

  return {
    appId: appId ? `${appId.slice(0, 6)}****${appId.slice(-4)}` : '',
    secretConfigured: hasSecret,
    configured: hasAppId && hasSecret,
    tokenCached: !!tokenCache.token,
    tokenExpiresAt: tokenCache.expiresAt,
    subscribe: {
      intakeAudit: hasAuditTemplate,
      intakeDisburse: hasDisburseTemplate,
      financeReview: hasFinanceTemplate
    },
    apis: {
      jscode2session: hasAppId && hasSecret,
      getPhoneNumber: hasAppId && hasSecret,
      msgSecCheck: hasAppId && hasSecret,
      getWxaCode: hasAppId && hasSecret,
      generateUrlLink: hasAppId && hasSecret,
      sendCustomMessage: hasAppId && hasSecret
    }
  }
}

module.exports = {
  // 1. 凭证
  getAccessToken,
  getStableToken,
  getApiQuota,
  getRidInfo,
  // 2. 登录
  jscode2session,
  checkSession,
  resetUserSessionKey,
  // 3. 用户信息
  getPhoneNumber,
  getUserEncryptKey,
  getPaidUnionid,
  checkEncryptedMsg,
  // 4. 小程序码与链接
  getWxaCode,
  getWxaCodeUnlimited,
  createWxaQrcode,
  generateScheme,
  generateUrlLink,
  generateShortLink,
  queryScheme,
  queryUrlLink,
  // 5. 内容安全
  msgSecCheck,
  mediaCheckAsync,
  getUserRiskRank,
  // 6. 客服
  sendCustomMessage,
  setTypingStatus,
  addKfAccount,
  getKfList,
  // 7. 订阅消息
  sendSubscribeMessage,
  getSubscribeCategory,
  getPubTemplateTitles,
  addTemplate,
  getTemplateList,
  deleteTemplate,
  // 8. 动态消息
  createActivityId,
  updateDynamicMessage,
  // 9. 客服绑定
  getWorkBindStatus,
  bindWorkKf,
  unbindWorkKf,
  // 10. 临时素材
  uploadTempMedia,
  getTempMedia,
  // 11. 运维
  getDomainConfig,
  getPerformanceData,
  getJsErrorDetail,
  getFeedbackList,
  // 12. 其他
  getApiDomainIp,
  getCallbackIp,
  checkNetwork,
  // 业务集成
  notifyIntakeStatus,
  findUserOpenidByPhone,
  notifyFinanceReviewSubscribe,
  getWechatServiceStatus
}
