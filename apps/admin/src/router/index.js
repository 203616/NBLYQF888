import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import Dashboard from '../views/Dashboard.vue'
import ResourceList from '../views/ResourceList.vue'
import RegionDashboard from '../views/RegionDashboard.vue'
import IntakeList from '../views/IntakeList.vue'
import IntakeDetail from '../views/IntakeDetail.vue'
import SystemIntegrations from '../views/SystemIntegrations.vue'
import SystemDeploy from '../views/SystemDeploy.vue'
import SystemReleaseChecklist from '../views/SystemReleaseChecklist.vue'
import FinanceModeration from '../views/FinanceModeration.vue'
import AuditLogs from '../views/AuditLogs.vue'
import SystemStatus from '../views/SystemStatus.vue'
import RoleManage from '../views/RoleManage.vue'
import AdminUsers from '../views/AdminUsers.vue'
import SystemSettings from '../views/SystemSettings.vue'
import ChatSessions from '../views/ChatSessions.vue'

/** 扁平菜单（兼容旧引用） */
export const menus = [
  { path: '/dashboard', title: '数据概览', icon: '📊', resource: '', group: 'data' },
  { path: '/analytics/regions', title: '地区看板', icon: '🗺️', resource: '', group: 'data' },
  { path: '/operations/sources', title: '数据来源', icon: '📁', resource: 'sources', group: 'ops' },
  { path: '/service/sessions', title: '客服会话', icon: '💬', resource: 'chatSessions', group: 'ops' },
  { path: '/ai/analysis', title: 'AI 分析', icon: '🧠', resource: '', group: 'ops' },
  { path: '/notifications', title: '消息管理', icon: '🔔', resource: 'notifications', group: 'ops' },
  { path: '/operations/banners', title: '轮播图管理', icon: '🖼️', resource: 'banners', group: 'ops' },
  { path: '/products', title: '产品管理', icon: '📦', resource: 'products', group: 'ops' },
  { path: '/content/articles', title: '内容中心', icon: '📝', resource: 'articles', group: 'ops' },
  { path: '/exposure/list', title: '曝光案例', icon: '📢', resource: 'exposures', group: 'ops' },
  { path: '/exposure/reports', title: '举报审核', icon: '⚠️', resource: 'reports', group: 'ops' },
  { path: '/demands', title: '易融圈需求', icon: '🤝', resource: 'demands', group: 'business' },
  { path: '/clues', title: '汽车线索', icon: '🚗', resource: 'clues', group: 'business' },
  { path: '/intake', title: '进件管理', icon: '📋', resource: '', group: 'business' },
  { path: '/operations/warranty', title: '延保申请', icon: '🛡️', resource: 'warrantyApplications', group: 'business' },
  { path: '/operations/warranty-claims', title: '延保理赔', icon: '📋', resource: 'warrantyClaims', group: 'business' },
  { path: '/operations/valuations', title: '估值记录', icon: '📊', resource: 'vehicleValuations', group: 'business' },
  { path: '/operations/staff', title: '业务员管理', icon: '👔', resource: 'salesStaff', group: 'business' },
  { path: '/applications', title: '融资申请', icon: '💰', resource: 'applications', group: 'business' },
  { path: '/users', title: '用户管理', icon: '👤', resource: 'users', group: 'business' },
  { path: '/social/finance-posts', title: '融圈动态审核', icon: '💬', resource: 'financeCirclePosts', group: 'business' },
  { path: '/social/finance-moderation', title: '融圈审核规则', icon: '🛡️', resource: '', group: 'business' },
  { path: '/system/settings', title: '系统设置', icon: '⚙️', resource: '', group: 'system' },
  { path: '/system/integrations', title: '集成联调', icon: '🔗', resource: '', group: 'system' },
  { path: '/system/deploy', title: '发布部署', icon: '🚀', resource: '', group: 'system' },
  { path: '/system/release-checklist', title: '正式版清单', icon: '✅', resource: '', group: 'system' },
  { path: '/system/audit-logs', title: '审计日志', icon: '📋', resource: '', group: 'system' },
  { path: '/system/status', title: '系统状态', icon: '📊', resource: '', group: 'system' },
  { path: '/system/roles', title: '角色权限', icon: '🔐', resource: '', group: 'system' },
  { path: '/system/admin-users', title: '管理员', icon: '👥', resource: '', group: 'system' }
]

/** 侧栏分组大纲 */
export const menuGroups = [
  { id: 'data', title: '数据中心', icon: '📊' },
  { id: 'ops', title: '内容与运营', icon: '📝' },
  { id: 'business', title: '业务管理', icon: '💼' },
  { id: 'system', title: '系统发布', icon: '⚙️' }
]

/** 迭代批次时间线（A–P） */
export const releaseTimeline = [
  { batch: 'A', title: '进件与区域', status: 'done' },
  { batch: 'B', title: '延保与融圈', status: 'done' },
  { batch: 'C', title: 'PDF与设备验证', status: 'done' },
  { batch: 'D', title: '包体与图片分包', status: 'done' },
  { batch: 'E', title: 'safe-image', status: 'done' },
  { batch: 'F', title: '生产配置同步', status: 'done' },
  { batch: 'G', title: 'CI 与 OSS', status: 'done' },
  { batch: 'H', title: '发布部署页', status: 'done' },
  { batch: 'I', title: '一键发布 SSE', status: 'done' },
  { batch: 'J', title: '体验版 robot', status: 'done' },
  { batch: 'K', title: '融圈上传', status: 'done' },
  { batch: 'L', title: 'OSS 与体验版', status: 'done' },
  { batch: 'M', title: '融圈审核', status: 'done' },
  { batch: 'N', title: '审核预览通知', status: 'done' },
  { batch: 'O', title: '云审核与订阅', status: 'done' },
  { batch: 'P', title: '全栈核查多端', status: 'done' }
]

const routes = [
  { path: '/login', component: Login },
  {
    path: '/',
    component: AdminLayout,
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', component: Dashboard, meta: { title: '数据概览' } },
      { path: 'analytics/regions', component: RegionDashboard, meta: { title: '地区看板' } },
      { path: 'intake', component: IntakeList, meta: { title: '进件管理' } },
      { path: 'intake/detail/:id', component: IntakeDetail, meta: { title: '进件详情' } },
      { path: 'system/integrations', component: SystemIntegrations, meta: { title: '集成联调' } },
      { path: 'system/deploy', component: SystemDeploy, meta: { title: '发布部署' } },
      { path: 'system/release-checklist', component: SystemReleaseChecklist, meta: { title: '正式版清单' } },
      { path: 'social/finance-moderation', component: FinanceModeration, meta: { title: '融圈审核规则' } },
      { path: 'system/audit-logs', component: AuditLogs, meta: { title: '审计日志' } },
      { path: 'system/status', component: SystemStatus, meta: { title: '系统状态' } },
      { path: 'system/roles', component: RoleManage, meta: { title: '角色权限' } },
      { path: 'system/admin-users', component: AdminUsers, meta: { title: '管理员管理' } },
      { path: 'system/settings', component: SystemSettings, meta: { title: '系统设置' } },
      { path: 'service/sessions', component: ChatSessions, meta: { title: '客服会话' } },
      { path: 'ai/analysis', component: ChatSessions, meta: { title: 'AI 分析' } },
      ...menus.filter(item => item.resource && item.resource !== 'chatSessions').map(item => ({
        path: item.path.replace(/^\//, ''),
        component: ResourceList,
        meta: item
      }))
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  if (to.path !== '/login' && !localStorage.getItem('adminToken')) return '/login'
  if (to.path === '/login' && localStorage.getItem('adminToken')) return '/dashboard'
  return true
})

export default router
