/** 后台资源列表 — 列定义与展示配置 */
export const resourceConfig = {
  products: {
    description: '管理小程序展示的金融产品信息、利率区间与材料清单',
    icon: '📦',
    searchPlaceholder: '搜索产品名称',
    columns: [
      { prop: 'id', label: 'ID', width: 70 },
      { prop: 'name', label: '产品名称', minWidth: 160 },
      { prop: 'category', label: '分类', width: 100 },
      { prop: 'rate', label: '利率', width: 120 },
      { prop: 'amount', label: '额度', width: 120 },
      { prop: 'status', label: '状态', width: 90 },
      { prop: 'updated_at', label: '更新时间', minWidth: 160 }
    ]
  },
  articles: {
    description: '资讯文章、避坑指南与合规内容发布管理',
    icon: '📝',
    searchPlaceholder: '搜索标题',
    columns: [
      { prop: 'id', label: 'ID', width: 70 },
      { prop: 'title', label: '标题', minWidth: 200 },
      { prop: 'category', label: '分类', width: 100 },
      { prop: 'author', label: '作者', width: 100 },
      { prop: 'status', label: '状态', width: 90 },
      { prop: 'created_at', label: '创建时间', minWidth: 160 }
    ]
  },
  banners: {
    description: '首页与频道轮播图配置',
    icon: '🖼️',
    searchPlaceholder: '搜索标题',
    columns: [
      { prop: 'id', label: 'ID', width: 70 },
      { prop: 'title', label: '标题', minWidth: 160 },
      { prop: 'link', label: '跳转链接', minWidth: 180 },
      { prop: 'sort', label: '排序', width: 80 },
      { prop: 'status', label: '状态', width: 90 }
    ]
  },
  clues: {
    description: '汽车线索收集、分配与跟进状态',
    icon: '🚗',
    searchPlaceholder: '搜索姓名/手机',
    columns: [
      { prop: 'id', label: 'ID', width: 70 },
      { prop: 'name', label: '姓名', width: 100 },
      { prop: 'phone', label: '手机', width: 130 },
      { prop: 'carModel', label: '意向车型', minWidth: 140 },
      { prop: 'city', label: '城市', width: 100 },
      { prop: 'status', label: '状态', width: 90 },
      { prop: 'created_at', label: '创建时间', minWidth: 160 }
    ]
  },
  demands: {
    description: '易融圈融资需求发布与撮合',
    icon: '🤝',
    searchPlaceholder: '搜索需求标题',
    columns: [
      { prop: 'id', label: 'ID', width: 70 },
      { prop: 'title', label: '需求标题', minWidth: 180 },
      { prop: 'amount', label: '金额', width: 120 },
      { prop: 'purpose', label: '用途', width: 100 },
      { prop: 'city', label: '城市', width: 100 },
      { prop: 'status', label: '状态', width: 90 },
      { prop: 'created_at', label: '发布时间', minWidth: 160 }
    ]
  },
  applications: {
    description: '用户提交的融资申请记录',
    icon: '💰',
    searchPlaceholder: '搜索申请人',
    columns: [
      { prop: 'id', label: 'ID', width: 70 },
      { prop: 'user_name', label: '申请人', width: 100 },
      { prop: 'product_name', label: '产品', minWidth: 140 },
      { prop: 'amount', label: '申请额度', width: 120 },
      { prop: 'status', label: '状态', width: 90 },
      { prop: 'created_at', label: '申请时间', minWidth: 160 }
    ]
  },
  users: {
    description: '小程序注册用户与实名状态',
    icon: '👤',
    searchPlaceholder: '搜索昵称/手机',
    columns: [
      { prop: 'id', label: 'ID', width: 70 },
      { prop: 'nickname', label: '昵称', width: 120 },
      { prop: 'phone', label: '手机', width: 130 },
      { prop: 'is_verified', label: '实名', width: 80 },
      { prop: 'created_at', label: '注册时间', minWidth: 160 }
    ]
  },
  notifications: {
    description: '系统消息与订阅通知记录',
    icon: '🔔',
    searchPlaceholder: '搜索标题',
    columns: [
      { prop: 'id', label: 'ID', width: 70 },
      { prop: 'title', label: '标题', minWidth: 180 },
      { prop: 'type', label: '类型', width: 100 },
      { prop: 'user_id', label: '用户ID', width: 90 },
      { prop: 'created_at', label: '时间', minWidth: 160 }
    ]
  },
  exposures: {
    description: '曝光案例与风险提示内容',
    icon: '📢',
    searchPlaceholder: '搜索标题',
    columns: [
      { prop: 'id', label: 'ID', width: 70 },
      { prop: 'title', label: '标题', minWidth: 180 },
      { prop: 'status', label: '状态', width: 90 },
      { prop: 'created_at', label: '发布时间', minWidth: 160 }
    ]
  },
  reports: {
    description: '用户举报审核与处置',
    icon: '⚠️',
    searchPlaceholder: '搜索举报内容',
    columns: [
      { prop: 'id', label: 'ID', width: 70 },
      { prop: 'target_type', label: '对象类型', width: 100 },
      { prop: 'reason', label: '举报原因', minWidth: 160 },
      { prop: 'status', label: '状态', width: 90 },
      { prop: 'created_at', label: '举报时间', minWidth: 160 }
    ]
  },
  sources: {
    description: '公开数据来源与引用说明',
    icon: '📁',
    searchPlaceholder: '搜索来源名称',
    columns: [
      { prop: 'id', label: 'ID', width: 70 },
      { prop: 'name', label: '来源名称', minWidth: 180 },
      { prop: 'url', label: '链接', minWidth: 200 },
      { prop: 'updated_at', label: '更新时间', minWidth: 160 }
    ]
  },
  serviceSessions: {
    description: '智能客服会话记录',
    icon: '💬',
    searchPlaceholder: '搜索用户',
    columns: [
      { prop: 'id', label: 'ID', width: 70 },
      { prop: 'user_id', label: '用户', width: 90 },
      { prop: 'last_message', label: '最后消息', minWidth: 200 },
      { prop: 'status', label: '状态', width: 90 },
      { prop: 'updated_at', label: '更新时间', minWidth: 160 }
    ]
  },
  settings: {
    description: '系统全局配置项',
    icon: '⚙️',
    searchPlaceholder: '搜索配置键',
    columns: [
      { prop: 'id', label: 'ID', width: 70 },
      { prop: 'key', label: '配置键', minWidth: 160 },
      { prop: 'value', label: '配置值', minWidth: 200 },
      { prop: 'updated_at', label: '更新时间', minWidth: 160 }
    ]
  },
  warrantyApplications: {
    description: '延保进件申请记录与合同编号',
    icon: '🛡️',
    searchPlaceholder: '搜索手机号',
    columns: [
      { prop: 'id', label: 'ID', width: 70 },
      { prop: 'phone', label: '手机', width: 130 },
      { prop: 'plan_id', label: '套餐', width: 100 },
      { prop: 'contract_no', label: '合同编号', minWidth: 160 },
      { prop: 'status', label: '状态', width: 90 },
      { prop: 'created_at', label: '申请时间', minWidth: 160 }
    ]
  },
  warrantyClaims: {
    description: '延保理赔申请与处理进度',
    icon: '📋',
    searchPlaceholder: '搜索手机号/车牌',
    columns: [
      { prop: 'id', label: 'ID', width: 70 },
      { prop: 'phone', label: '手机', width: 130 },
      { prop: 'plate_no', label: '车牌', width: 120 },
      { prop: 'fault_desc', label: '故障描述', minWidth: 180 },
      { prop: 'status', label: '状态', width: 100 },
      { prop: 'handler', label: '处理人', width: 100 },
      { prop: 'remark', label: '备注', minWidth: 120 },
      { prop: 'created_at', label: '提交时间', minWidth: 160 }
    ]
  },
  vehicleValuations: {
    description: '车辆估值提交记录',
    icon: '📊',
    searchPlaceholder: '搜索手机号',
    columns: [
      { prop: 'id', label: 'ID', width: 70 },
      { prop: 'phone', label: '手机', width: 130 },
      { prop: 'brand', label: '品牌', width: 100 },
      { prop: 'model', label: '车型', minWidth: 120 },
      { prop: 'estimate', label: '估值', width: 100 },
      { prop: 'created_at', label: '提交时间', minWidth: 160 }
    ]
  },
  salesStaff: {
    description: '延保/汽车金融业务员管理',
    icon: '👔',
    searchPlaceholder: '搜索姓名',
    columns: [
      { prop: 'id', label: 'ID', width: 70 },
      { prop: 'name', label: '姓名', width: 100 },
      { prop: 'phone', label: '手机', width: 130 },
      { prop: 'region', label: '区域', width: 100 },
      { prop: 'department', label: '部门', width: 120 },
      { prop: 'status', label: '状态', width: 90 }
    ]
  },
  financeCirclePosts: {
    description: '易融圈动态审核（含用户上传图片）',
    icon: '💬',
    searchPlaceholder: '搜索用户/内容/审核状态',
    columns: [
      { prop: 'id', label: 'ID', width: 70 },
      { prop: 'user_name', label: '用户', width: 120 },
      { prop: 'content', label: '内容', minWidth: 180 },
      { prop: 'images', label: '图片', minWidth: 120 },
      { prop: 'review_status', label: '审核', width: 100 },
      { prop: 'review_note', label: '审核说明', minWidth: 140 },
      { prop: 'likes', label: '点赞', width: 80 },
      { prop: 'created_at', label: '发布时间', minWidth: 160 }
    ]
  }
}

export function getResourceConfig(resource) {
  return resourceConfig[resource] || {
    description: '资源数据列表管理',
    icon: '📄',
    searchPlaceholder: '搜索',
    columns: []
  }
}

export function inferColumns(rows) {
  if (!rows.length) return []
  const keys = new Set()
  rows.slice(0, 5).forEach(row => Object.keys(row).forEach(k => keys.add(k)))
  return Array.from(keys).slice(0, 10).map(prop => ({
    prop,
    label: prop,
    minWidth: 140
  }))
}
