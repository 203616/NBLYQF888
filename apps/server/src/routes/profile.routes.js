const express = require('express')
const { ok } = require('../utils/response')

const router = express.Router()

router.get('/oa', (req, res) => {
  ok(res, {
    stats: [
      { name: '待办事项', count: 6 },
      { name: '方案跟进', count: 4 },
      { name: '材料待补', count: 2 }
    ],
    tasks: [
      { id: 1, title: '跟进新能源车融资申请', type: '客户回访', priority: '高', status: '待处理', due: '今日 16:00', desc: '确认首付比例、征信授权和车辆发票信息。' },
      { id: 2, title: '审核房抵经营贷材料', type: '材料审核', priority: '中', status: '进行中', due: '明日 10:00', desc: '核对房产证、经营流水和抵押物估值报告。' }
    ],
    meetings: [
      { id: 1, title: '汽车金融晨会', time: '周二 09:30', place: '线上会议', host: '运营中心' }
    ]
  })
})

router.get('/documents', (req, res) => {
  ok(res, [
    { id: 'identity', name: '身份资料', desc: '身份证、营业执照、法人信息', status: '已归档', count: 6, progress: 100 },
    { id: 'income', name: '经营流水', desc: '银行流水、开票、纳税记录', status: '待补充', count: 3, progress: 60 },
    { id: 'contracts', name: '合同档案', desc: '融资合同、购车合同、服务协议', status: '审核中', count: 4, progress: 80 },
    { id: 'videos', name: '验证视频', desc: '面签、车辆、经营场所视频', status: '未上传', count: 1, progress: 20 }
  ])
})

router.get('/settings', (req, res) => {
  ok(res, [
    { id: 'account', title: '账号安全', desc: '登录密码、手机号、设备管理', enabled: true },
    { id: 'privacy', title: '隐私授权', desc: '位置、相册、用户资料授权状态', enabled: true },
    { id: 'notice', title: '消息通知', desc: '审批、需求、系统公告提醒', enabled: true },
    { id: 'service', title: '客服与协议', desc: '客服电话、隐私政策、服务协议', enabled: true }
  ])
})

module.exports = router
