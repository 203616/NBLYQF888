const { get, post } = require('../utils/request')
const { getConfig } = require('../utils/config')

function submitWarrantyApplication(data) {
  if (getConfig().useMockFallback) {
    return Promise.resolve({ id: Date.now(), status: 'submitted', contractNo: `WB${Date.now()}` })
  }
  return post('/warranty/applications', data)
}

function getWarrantyApplications(phone) {
  if (getConfig().useMockFallback) {
    const list = wx.getStorageSync('warranty_applications') || []
    return Promise.resolve(phone ? list.filter(i => i.phone === phone) : list)
  }
  return get('/warranty/applications', { phone })
}

function getWarrantyContract(appId) {
  if (getConfig().useMockFallback) {
    return Promise.resolve({
      contractNo: `WB${appId || Date.now()}`,
      content: '《汽车延保服务合同》预览\n保障范围以正式签署版为准。'
    })
  }
  return get(`/warranty/applications/${appId}/contract`)
}

function getWarrantyContractPdfUrl(appId) {
  const { useMockFallback, apiBaseUrl } = getConfig()
  if (useMockFallback) return Promise.reject(new Error('请连接服务器后下载 PDF'))
  return get(`/warranty/applications/${appId}/contract.pdf`, {}, { showError: false }).then(res => {
    let url = res.url || ''
    if (url && !/^https?:\/\//i.test(url)) {
      const base = (apiBaseUrl || '').replace(/\/api\/v1\/?$/, '')
      url = `${base}${url.startsWith('/') ? url : `/${url}`}`
    }
    return { ...res, url }
  })
}

function submitWarrantyClaim(data) {
  if (getConfig().useMockFallback) {
    const claims = wx.getStorageSync('warranty_claims') || []
    const row = { id: Date.now(), status: 'submitted', ...data, created_at: new Date().toISOString() }
    claims.unshift(row)
    wx.setStorageSync('warranty_claims', claims)
    return Promise.resolve(row)
  }
  return post('/warranty/claims', data)
}

function getWarrantyClaims(phone) {
  if (getConfig().useMockFallback) {
    const claims = wx.getStorageSync('warranty_claims') || []
    return Promise.resolve(phone ? claims.filter(c => c.phone === phone) : claims)
  }
  return get('/warranty/claims', { phone })
}

function getSalesStaff() {
  if (getConfig().useMockFallback) {
    return Promise.resolve([
      { id: 1, name: '陈顾问', phone: '138****8801', region: '宁波市', department: '延保业务部' },
      { id: 2, name: '周专员', phone: '137****6602', region: '宁波市', department: '延保业务部' }
    ])
  }
  return get('/warranty/staff')
}

module.exports = {
  submitWarrantyApplication,
  getWarrantyApplications,
  getWarrantyContract,
  getWarrantyContractPdfUrl,
  submitWarrantyClaim,
  getWarrantyClaims,
  getSalesStaff
}
