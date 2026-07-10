<template>
  <div class="oa-workbench">
    <div class="page-header">
      <div class="header-main">
        <span class="page-icon">📋</span>
        <div>
          <h2>OA工作台</h2>
          <p>代办任务、审核进度与财务概览</p>
        </div>
      </div>
    </div>

    <div class="stat-chips">
      <div class="chip"><strong>{{ tasks.length }}</strong><span>待办任务</span></div>
      <div class="chip"><strong>{{ financeSummary.auditingIntakes || 0 }}</strong><span>审核中进件</span></div>
      <div class="chip"><strong>{{ financeSummary.approvedIntakes || 0 }}</strong><span>已通过进件</span></div>
      <div class="chip"><strong>{{ financeSummary.pendingCommissions || 0 }}</strong><span>待结算分润</span></div>
    </div>

    <el-row :gutter="20">
      <!-- 左侧：待办任务 -->
      <el-col :span="14">
        <div class="page-card">
          <div class="card-header">
            <h3>📌 待办任务</h3>
            <el-tag v-if="tasks.length" type="danger" size="small" effect="dark">{{ tasks.length }}</el-tag>
          </div>
          <div v-if="!tasks.length" class="empty-state">
            <el-empty description="暂无待办任务" :image-size="80" />
          </div>
          <div v-else class="task-list">
            <div v-for="task in tasks" :key="task.id" class="task-item" :class="'task-' + task.type">
              <div class="task-icon">
                <span v-if="task.type === 'intake'">📋</span>
                <span v-else-if="task.type === 'finance_post'">💬</span>
                <span v-else>📌</span>
              </div>
              <div class="task-body">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-meta">
                  <el-tag :type="statusTag(task.status)" size="small" effect="plain">{{ statusLabel(task.status) }}</el-tag>
                  <span class="task-time">{{ formatTime(task.createdAt) }}</span>
                </div>
              </div>
              <div class="task-actions">
                <el-button v-if="task.type === 'intake'" size="small" type="primary" link @click="goToIntake(task.id)">处理</el-button>
                <el-button v-else-if="task.type === 'finance_post'" size="small" type="warning" link @click="goToFinance(task.id)">审核</el-button>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 右侧：审核进度 + 财务概览 -->
      <el-col :span="10">
        <!-- 审核进度 -->
        <div class="page-card">
          <div class="card-header">
            <h3>⏳ 审核进度</h3>
          </div>
          <div class="progress-list">
            <div class="progress-item">
              <div class="progress-label">
                <span>总进件数</span>
                <strong>{{ financeSummary.totalIntakes || 0 }}</strong>
              </div>
              <el-progress :percentage="intakeProgress" :stroke-width="10" color="#409EFF" />
            </div>
            <div class="progress-item">
              <div class="progress-label">
                <span>审核中</span>
                <strong>{{ financeSummary.auditingIntakes || 0 }}</strong>
              </div>
              <el-progress :percentage="auditProgress" :stroke-width="10" color="#E6A23C" />
            </div>
            <div class="progress-item">
              <div class="progress-label">
                <span>已通过</span>
                <strong>{{ financeSummary.approvedIntakes || 0 }}</strong>
              </div>
              <el-progress :percentage="approvedProgress" :stroke-width="10" color="#67C23A" />
            </div>
          </div>
        </div>

        <!-- 财务概览 -->
        <div class="page-card" style="margin-top:16px">
          <div class="card-header">
            <h3>💰 财务概览</h3>
            <el-tag size="small" effect="plain" type="info">只读</el-tag>
          </div>
          <div class="finance-grid">
            <div class="finance-item">
              <div class="finance-label">待结算分润</div>
              <div class="finance-value warning">{{ financeSummary.pendingCommissions || 0 }} 笔</div>
            </div>
            <div class="finance-item">
              <div class="finance-label">已结算分润</div>
              <div class="finance-value success">{{ financeSummary.settledCommissions || 0 }} 笔</div>
            </div>
            <div class="finance-item">
              <div class="finance-label">总佣金支出</div>
              <div class="finance-value primary">{{ formatAmount(financeSummary.totalCommissions) }} 元</div>
            </div>
            <div class="finance-item">
              <div class="finance-label">更新时间</div>
              <div class="finance-value muted">{{ formatTime(metadata.updatedAt) }}</div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getOAWorkbench } from '../api/resources'
import { useRouter } from 'vue-router'

const router = useRouter()

const tasks = ref([])
const financeSummary = ref({})
const metadata = ref({})
const loading = ref(false)

const intakeProgress = computed(() => {
  const total = financeSummary.value.totalIntakes || 0
  return total > 0 ? 100 : 0
})

const auditProgress = computed(() => {
  const total = financeSummary.value.totalIntakes || 0
  const auditing = financeSummary.value.auditingIntakes || 0
  return total > 0 ? Math.round((auditing / total) * 100) : 0
})

const approvedProgress = computed(() => {
  const total = financeSummary.value.totalIntakes || 0
  const approved = financeSummary.value.approvedIntakes || 0
  return total > 0 ? Math.round((approved / total) * 100) : 0
})

function statusLabel(status) {
  const map = {
    auditing: '审核中',
    draft: '草稿',
    submitted: '已提交',
    approved: '已通过',
    rejected: '已驳回',
    pending: '待审核',
    settled: '已结算'
  }
  return map[status] || status
}

function statusTag(status) {
  const map = {
    auditing: 'warning',
    draft: 'info',
    submitted: 'primary',
    approved: 'success',
    rejected: 'danger',
    pending: 'warning'
  }
  return map[status] || ''
}

function formatTime(val) {
  if (!val) return '-'
  const d = new Date(val)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatAmount(val) {
  if (!val && val !== 0) return '-'
  return Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function goToIntake(id) {
  router.push(`/intake/detail/${id}`)
}

function goToFinance(id) {
  router.push(`/social/finance-posts`)
}

async function loadData() {
  loading.value = true
  try {
    const data = await getOAWorkbench()
    tasks.value = data.tasks || []
    financeSummary.value = data.financeSummary || {}
    metadata.value = data.metadata || {}
  } catch (e) {
    ElMessage.error('加载OA工作台数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => loadData())
</script>

<style scoped>
.header-main { display: flex; align-items: flex-start; gap: 16px }
.page-icon { font-size: 36px; line-height: 1; margin-top: 4px }
.stat-chips { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap }
.chip { background: #fff; border: 1px solid var(--el-border-color); border-radius: 12px; padding: 12px 20px; text-align: center; min-width: 110px }
.chip strong { display: block; font-size: 22px; color: var(--el-color-primary) }
.chip span { font-size: 12px; color: var(--el-text-color-secondary) }
.card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px }
.card-header h3 { margin: 0; font-size: 15px }

/* 待办任务 */
.task-list { display: flex; flex-direction: column; gap: 8px }
.task-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; background: #f8f9fc; transition: background .2s }
.task-item:hover { background: #eef1f7 }
.task-icon { font-size: 22px; line-height: 1; flex-shrink: 0 }
.task-body { flex: 1; min-width: 0 }
.task-title { font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
.task-meta { display: flex; gap: 8px; align-items: center; margin-top: 4px }
.task-time { font-size: 12px; color: var(--el-text-color-secondary) }
.task-actions { flex-shrink: 0 }
.empty-state { padding: 20px 0 }

/* 审核进度 */
.progress-list { display: flex; flex-direction: column; gap: 16px }
.progress-item { }
.progress-label { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px }
.progress-label strong { color: var(--el-text-color-primary) }

/* 财务概览 */
.finance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px }
.finance-item { background: #f8f9fc; border-radius: 8px; padding: 14px }
.finance-label { font-size: 12px; color: var(--el-text-color-secondary); margin-bottom: 4px }
.finance-value { font-size: 16px; font-weight: 600 }
.finance-value.warning { color: var(--el-color-warning) }
.finance-value.success { color: var(--el-color-success) }
.finance-value.primary { color: var(--el-color-primary) }
.finance-value.muted { color: var(--el-text-color-secondary); font-size: 13px; font-weight: 400 }
</style>
