const { get, post } = require('../utils/request')

const { getConfig } = require('../utils/config')

const mock = require('./mock')



function normalizeDemand(item) {

  if (!item) return item

  const tags = item.tags

  return {

    ...item,

    tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),

    createdAt: item.createdAt || item.created_at,

    city: item.city || '',
    linkedApplicationNo: item.linkedApplicationNo || item.linked_application_no || ''

  }

}



function buildSteps(demand) {
  return [
    { title: '需求发布', desc: '系统已记录金额、期限与联系方式', done: true },
    { title: '资质初筛', desc: '根据主体类型、用途与地区进行初步筛选', done: demand.progress >= 25 },
    { title: '方案匹配', desc: '根据用途、主体资质和期限匹配机构', done: demand.progress >= 40 },
    { title: '专员沟通', desc: '确认材料清单与预计办理节奏', done: demand.progress >= 70 },
    { title: '完成反馈', desc: '生成正式方案并留存服务记录', done: demand.progress >= 100 }
  ]
}

function buildMaterials(demand) {
  const base = ['身份证明', '联系方式', '用途说明']
  if (demand.type === 'funding') {
    if ((demand.tags || []).includes('房产抵押')) return [...base, '房产证', '婚姻证明', '经营流水', '纳税记录']
    if ((demand.tags || []).includes('餐饮')) return [...base, '营业执照', '租赁合同', '近6个月流水']
    return [...base, '营业执照', '近6-12个月流水', '纳税或开票记录']
  }
  return [...base, '机构资质证明', '产品说明书', '合规披露文件']
}



function getDemandList(params = {}) {

  if (getConfig().useMockFallback) {

    let list = mock.demands.map(normalizeDemand)

    if (params.type && params.type !== 'all') {

      list = list.filter(d => d.type === params.type)

    }

    if (params.city) {

      list = list.filter(d => (d.city || '').includes(params.city))

    }

    return Promise.resolve(list)

  }

  return get('/demands', params).then(rows => (rows || []).map(normalizeDemand))

}



function getMyDemands() {

  const phone = wx.getStorageSync('userPhone') || ''

  if (getConfig().useMockFallback) {

    const mine = mock.demands.filter(d => {

      if (!phone) return false

      return String(d.contact || '').includes(phone.slice(0, 3))

    })

    return Promise.resolve((mine.length ? mine : mock.demands.slice(0, 2)).map(normalizeDemand))

  }

  return get('/demands/mine', { phone }, { showError: false })

    .then(rows => (rows || []).map(normalizeDemand))

    .catch(() => [])

}



function getDemandDetail(id) {

  if (getConfig().useMockFallback) {

    const demand = normalizeDemand(mock.demands.find(item => String(item.id) === String(id)) || mock.demands[0])

    return Promise.resolve({

      ...demand,

      steps: buildSteps(demand),

      materials: buildMaterials(demand),

      recommendedProducts: mock.products.slice(0, 3),

      complianceNote: '亮叶企服仅提供信息咨询与居间撮合，具体审批、额度、费用以持牌机构审核及正式合同为准。'

    })

  }

  return get(`/demands/${id}`).then(normalizeDemand)

}



function submitDemand(data) {

  if (getConfig().useMockFallback) {

    return Promise.resolve(normalizeDemand({

      id: Date.now(),

      status: '初审中',

      progress: 20,

      createdAt: new Date().toISOString().slice(0, 10),

      ...data

    }))

  }

  return post('/demands', data).then(res => {

    const row = normalizeDemand(res)

    if (data.contact) wx.setStorageSync('userPhone', String(data.contact).replace(/\D/g, '').slice(0, 11))

    return row

  })

}



module.exports = {

  getDemandList,

  getMyDemands,

  getDemandDetail,

  submitDemand

}

