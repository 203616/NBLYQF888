const { esig } = require('../config')

const API_URL = esig.apiUrl
const APP_KEY = esig.appKey
const APP_SECRET = esig.appSecret
const APP_CODE = esig.appCode

function isConfigured() {
  return !!(API_URL && APP_KEY && APP_SECRET && APP_CODE)
}

/**
 * 创建电子签章任务
 * @param {Object} params - { title, signerName, signerPhone, docUrl, docName }
 * @returns {Promise<Object>}
 */
async function createSignatureTask(params) {
  if (!isConfigured()) {
    return { ok: false, message: '电子签章未配置' }
  }

  const body = {
    title: params.title || '贷款文件签署',
    signerName: params.signerName || '',
    signerPhone: params.signerPhone || '',
    docUrl: params.docUrl || '',
    docName: params.docName || '签署文件.pdf'
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `APPCODE ${APP_CODE}`,
        'X-Ca-Key': APP_KEY,
        'X-Ca-Secret': APP_SECRET
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000)
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      return { ok: false, message: `API 返回 ${response.status}: ${errText.slice(0, 200)}` }
    }

    const data = await response.json()
    return { ok: true, data }
  } catch (err) {
    return { ok: false, message: `请求失败: ${err.message}` }
  }
}

/**
 * 查询电子签章任务详情
 * @param {string} taskId
 * @returns {Promise<Object>}
 */
async function querySignatureTask(taskId) {
  if (!isConfigured()) {
    return { ok: false, message: '电子签章未配置' }
  }

  try {
    const response = await fetch(`${API_URL}?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        Authorization: `APPCODE ${APP_CODE}`,
        'X-Ca-Key': APP_KEY,
        'X-Ca-Secret': APP_SECRET
      },
      signal: AbortSignal.timeout(15000)
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      return { ok: false, message: `查询失败: ${response.status} ${errText.slice(0, 200)}` }
    }

    const data = await response.json()
    return { ok: true, data }
  } catch (err) {
    return { ok: false, message: `查询请求失败: ${err.message}` }
  }
}

function getStatus() {
  return {
    configured: isConfigured(),
    apiUrl: API_URL,
    appKeyConfigured: !!APP_KEY,
    appSecretConfigured: !!APP_SECRET,
    appCodeConfigured: !!APP_CODE,
    hint: isConfigured() ? '电子签章 API 已配置，可用于合同在线签署' : '请配置 ESIG_APP_KEY / ESIG_APP_SECRET / ESIG_APP_CODE'
  }
}

module.exports = {
  createSignatureTask,
  querySignatureTask,
  getStatus
}
