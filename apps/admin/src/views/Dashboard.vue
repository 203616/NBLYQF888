<template>
  <div class="dashboard">
    <div class="page-header">
      <h2>运营数据概览</h2>
      <p>实时掌握进件、线索、需求与内容运营核心指标</p>
    </div>

    <el-row :gutter="16" class="metric-row">
      <el-col v-for="item in cards" :key="item.key" :xs="12" :sm="8" :md="6" :lg="4">
        <div class="metric-card">
          <span class="metric-label">{{ item.title }}</span>
          <strong class="metric-value">{{ data[item.key] ?? 0 }}</strong>
          <span class="metric-icon">{{ item.icon }}</span>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="panel-row">
      <el-col :span="14">
        <div class="page-card">
          <h3 class="section-title">运营待办</h3>
          <el-timeline>
            <el-timeline-item v-for="item in todos" :key="item.title" :timestamp="item.time" :type="item.type">
              <strong>{{ item.title }}</strong>
              <p class="todo-desc">{{ item.desc }}</p>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-col>
      <el-col :span="10">
        <div class="page-card quick-panel">
          <h3 class="section-title">快捷入口</h3>
          <div class="quick-grid">
            <router-link v-for="item in quickLinks" :key="item.path" :to="item.path" class="quick-link">
              <span class="quick-icon">{{ item.icon }}</span>
              <span>{{ item.title }}</span>
            </router-link>
          </div>
        </div>
        <div class="page-card tip-panel">
          <h3 class="section-title">系统提示</h3>
          <template v-if="deployAlerts.length">
            <el-alert
              v-for="(alert, idx) in deployAlerts"
              :key="idx"
              :title="alert.title"
              :description="alert.desc"
              :type="alert.type"
              :closable="false"
              show-icon
              class="mt-12"
            />
            <router-link
              v-if="data.pendingFinancePosts > 0"
              to="/social/finance-posts"
              class="integration-link"
            >前往融圈审核 →</router-link>
            <router-link to="/system/deploy" class="integration-link">前往发布部署 →</router-link>
          </template>
          <el-alert title="进件模块为只读查看模式" type="info" :closable="false" show-icon>
            审核、放款流程由机构侧推进，后台支持查看详情与导出 PDF。
          </el-alert>
          <el-alert
            :title="integrationAlerts.ocr"
            :type="integrations?.ocr?.configured ? 'success' : 'warning'"
            :closable="false"
            show-icon
            class="mt-12"
          />
          <el-alert
            :title="integrationAlerts.subscribe"
            :type="integrations?.subscribeTemplates?.configured ? 'success' : 'warning'"
            :closable="false"
            show-icon
            class="mt-12"
          />
          <router-link to="/system/integrations" class="integration-link">前往集成联调 →</router-link>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { getDashboard, getIntegrations, getDeployStatus, getDeployHistory } from '../api/resources'

const data = reactive({})
const integrations = ref(null)
const deployStatus = ref(null)
const deployHistory = ref([])
const cards = [
  { key: 'todayDemands', title: '今日需求', icon: '💡' },
  { key: 'clues', title: '汽车线索', icon: '🚗' },
  { key: 'intakeApplications', title: '进件总数', icon: '📋' },
  { key: 'intakeAuditing', title: '审核中进件', icon: '⏳' },
  { key: 'applications', title: '融资申请', icon: '💰' },
  { key: 'pendingReports', title: '待审举报', icon: '🛡️' },
  { key: 'pendingFinancePosts', title: '待审融圈', icon: '💬' }
]

const todos = [
  { time: '今日', type: 'primary', title: '处理新增融资需求', desc: '分配专员跟进易融圈与线索转化' },
  { time: '今日', type: 'warning', title: '进件材料查看', desc: '核对新同步进件完整性与 OCR 识别结果' },
  { time: '本周', type: 'success', title: '内容运营复核', desc: '检查轮播图、文章与曝光案例发布状态' },
  { time: '持续', type: 'info', title: '系统配置维护', desc: '维护产品利率、材料清单与订阅消息模板' }
]

const quickLinks = [
  { path: '/intake', title: '进件管理', icon: '📋' },
  { path: '/system/deploy', title: '发布部署', icon: '🚀' },
  { path: '/system/integrations', title: '集成联调', icon: '🔗' },
  { path: '/clues', title: '汽车线索', icon: '🚗' },
  { path: '/products', title: '产品管理', icon: '📦' }
]

const integrationAlerts = computed(() => ({
  ocr: integrations.value?.ocr?.configured
    ? `OCR：${integrations.value.ocr.mode} 模式已就绪`
    : 'OCR：使用 Mock 模式，请配置 ALIYUN_ACCESS_KEY',
  subscribe: integrations.value?.subscribeTemplates?.configured
    ? '订阅消息：模板 ID 已配置'
    : '订阅消息：请在 .env 配置 WECHAT_TEMPLATE_INTAKE_*'
}))

const deployAlerts = computed(() => {
  const alerts = []
  if (data.pendingFinancePosts > 0) {
    alerts.push({
      type: 'warning',
      title: `待审核融圈动态 ${data.pendingFinancePosts} 条`,
      desc: '请在融圈内容管理中审核通过后才会展示',
      link: '/social/finance-posts'
    })
  }
  const d = deployStatus.value
  if (d) {
    if (!d.miniprogram?.uploadReady) {
      alerts.push({ type: 'warning', title: '小程序上传密钥未配置', desc: '请配置 WECHAT_UPLOAD_PRIVATE_KEY*' })
    }
    if (d.cdn?.useCdnImages && !d.cdn?.oss?.configured) {
      alerts.push({ type: 'warning', title: 'CDN 已启用但 OSS 未配置', desc: '静态图可能无法从 CDN 加载' })
    }
    if (!d.api?.configSynced) {
      alerts.push({ type: 'info', title: '生产配置未同步', desc: '请运行 pnpm sync:prod' })
    }
    if (d.miniprogram?.previewQrcodeExists) {
      alerts.push({ type: 'success', title: '体验版预览码已生成', desc: `Robot #${d.miniprogram?.robot || 1}` })
    }
  }
  const lastFail = deployHistory.value.find(item => String(item.title || '').includes('失败'))
  if (lastFail) {
    alerts.push({ type: 'error', title: lastFail.title, desc: String(lastFail.content || '').slice(0, 120) })
  }
  return alerts.slice(0, 4)
})

onMounted(async () => {
  Object.assign(data, await getDashboard())
  try {
    integrations.value = await getIntegrations()
  } catch (e) {
    integrations.value = null
  }
  try {
    deployStatus.value = await getDeployStatus()
    deployHistory.value = await getDeployHistory()
  } catch {
    deployStatus.value = null
    deployHistory.value = []
  }
})
</script>

<style scoped>
.metric-row {
  margin-bottom: 20px;
}

.metric-row .el-col {
  margin-bottom: 16px;
}

.panel-row .page-card {
  margin-bottom: 16px;
}

.todo-desc {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--brand-muted);
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 12px;
  background: #f7faf8;
  color: var(--brand-primary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.quick-link:hover {
  background: #e6f2ec;
}

.quick-icon {
  font-size: 20px;
}

.mt-12 {
  margin-top: 12px;
}

.integration-link {
  display: inline-block;
  margin-top: 12px;
  color: var(--brand-primary);
  font-size: 13px;
  text-decoration: none;
}
</style>
