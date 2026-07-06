const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')
const { uploadsDir } = require('../config')

function writePdfToDir(prefix, doc) {
  const dir = path.join(uploadsDir, 'pdf')
  fs.mkdirSync(dir, { recursive: true })
  const fileName = `${prefix}-${Date.now()}.pdf`
  const filePath = path.join(dir, fileName)
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)
    doc.end()
    stream.on('finish', () => resolve({ fileName, filePath, url: `/uploads/pdf/${fileName}` }))
    stream.on('error', reject)
  })
}

function renderSection(doc, title, obj) {
  doc.fontSize(14).fillColor('#0F3D2E').text(title)
  doc.fillColor('#333').fontSize(11)
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') doc.text(`${k}: ${v}`)
  })
  doc.moveDown(0.5)
}

function generateIntakePdf(application) {
  const payload = application.payload || {}
  const personal = payload.personal || {}
  const basic = payload.basic || {}
  const vehicle = payload.vehicle || {}
  const finance = payload.finance || {}
  const work = payload.work || {}
  const credit = payload.credit || {}

  const doc = new PDFDocument({ margin: 50 })
  doc.fontSize(20).text('亮叶企服 · 进件材料汇总', { align: 'center' })
  doc.moveDown()
  doc.fontSize(12).text(`进件编号：${application.application_no}`)
  doc.text(`产品：${application.product_name || '-'}`)
  doc.text(`状态：${application.status}  进度：${application.progress}%`)
  doc.text(`生成时间：${new Date().toLocaleString('zh-CN')}`)
  doc.moveDown()

  renderSection(doc, '征信授权', {
    姓名: credit.realName || personal.realName,
    电话: credit.mobile || personal.mobile,
    身份证正面: credit.idCardFront ? '已上传' : '',
    身份证反面: credit.idCardBack ? '已上传' : '',
    大数据查询授权: credit.bigDataAuth ? '已授权' : '未授权',
    征信查询授权: credit.creditAuth ? '已授权' : '未授权',
    授权书签署: credit.authSigned || '否'
  })
  renderSection(doc, '基本信息', basic)
  renderSection(doc, '个人信息', {
    姓名: personal.realName,
    身份证: personal.idCard,
    手机: personal.mobile,
    地址: personal.address
  })
  renderSection(doc, '车辆信息', vehicle)
  renderSection(doc, '融资信息', finance)
  renderSection(doc, '工作信息', work)

  doc.fontSize(10).fillColor('#999').text(
    '本文件由亮叶企服进件系统自动生成，仅供内部审核参考。亮叶企服提供金融信息咨询与居间撮合服务，不承诺审批结果。',
    { align: 'center' }
  )
  return writePdfToDir(`intake-${application.application_no}`, doc)
}

function generateWarrantyPdf(app, contract) {
  const payload = typeof app.payload === 'string' ? JSON.parse(app.payload || '{}') : (app.payload || {})
  const vehicle = typeof app.vehicle_info === 'string' ? JSON.parse(app.vehicle_info || '{}') : (app.vehicle_info || {})
  const owner = typeof app.owner_info === 'string' ? JSON.parse(app.owner_info || '{}') : (app.owner_info || {})
  const contractNo = contract.contractNo || app.contract_no || `WB${String(app.id).padStart(8, '0')}`

  const doc = new PDFDocument({ margin: 50 })
  doc.fontSize(20).text('汽车延保服务合同（预览版）', { align: 'center' })
  doc.moveDown()
  doc.fontSize(12).text(`合同编号：${contractNo}`)
  doc.text(`签署日期：${new Date().toLocaleDateString('zh-CN')}`)
  doc.moveDown()

  renderSection(doc, '一、服务对象', {
    车主: owner.ownerName || payload.ownerName || '-',
    联系电话: app.phone || payload.phone || '-',
    车辆: `${vehicle.brand || payload.brand || ''} ${vehicle.model || payload.model || ''}`.trim(),
    车牌: vehicle.plateNo || payload.plateNo || '-',
    上牌年份: vehicle.year || payload.year || '-'
  })
  renderSection(doc, '二、保障套餐', {
    套餐类型: app.plan_id || payload.planId || 'basic',
    保障说明: '以合作服务商正式合同及免责条款为准'
  })
  renderSection(doc, '三、服务说明', {
    说明1: '延保服务由合作持牌/授权服务商提供，亮叶企服仅提供信息咨询与预约协助',
    说明2: '自然衰减、人为损坏、事故损失等通常不在延保范围内',
    理赔流程: '故障报修 → 客服核实 → 合作网点检修 → 按合同范围处理'
  })

  doc.fontSize(11).fillColor('#333').text('四、合同正文预览', { underline: true })
  doc.moveDown(0.3)
  doc.fontSize(10).text((contract.content || '').slice(0, 2000))
  doc.moveDown()
  doc.fontSize(10).fillColor('#999').text(
    '本预览不构成最终合同，正式签约以双方签署版为准。亮叶企服不收取前置保证金。',
    { align: 'center' }
  )
  return writePdfToDir(`warranty-${contractNo}`, doc)
}

module.exports = { generateIntakePdf, generateWarrantyPdf }
