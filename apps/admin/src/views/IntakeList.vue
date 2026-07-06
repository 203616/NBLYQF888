<template>
  <div class="intake-list">
    <div class="page-header">
      <h2>进件管理</h2>
      <p>查看各产品线进件材料、审核状态，支持导出 PDF（只读模式）</p>
    </div>

    <div class="page-card toolbar">
      <el-input v-model="query.q" placeholder="搜索进件编号 / 产品名" clearable style="width: 260px" @keyup.enter="load">
        <template #prefix><span>🔍</span></template>
      </el-input>
      <el-select v-model="query.status" placeholder="状态筛选" clearable style="width: 150px" @change="load">
        <el-option label="草稿" value="draft" />
        <el-option label="审核中" value="auditing" />
        <el-option label="已通过" value="approved" />
        <el-option label="已放款" value="disbursed" />
        <el-option label="已归档" value="archived" />
      </el-select>
      <el-select v-model="query.productType" placeholder="产品类型" clearable style="width: 150px" @change="load">
        <el-option label="新车" value="newCar" />
        <el-option label="二手车" value="usedCar" />
        <el-option label="车抵" value="mortgage" />
        <el-option label="经营贷" value="business" />
        <el-option label="个人消费贷" value="personal" />
        <el-option label="延保" value="warranty" />
        <el-option label="抵押贷" value="property" />
        <el-option label="融资租赁" value="lease" />
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button @click="resetQuery">重置</el-button>
    </div>

    <div class="stat-chips">
      <div class="chip" v-for="item in summaryChips" :key="item.label">
        <strong>{{ item.count }}</strong>
        <span>{{ item.label }}</span>
      </div>
    </div>

    <div class="page-card table-wrap">
      <el-table :data="rows" v-loading="loading" stripe highlight-current-row>
        <el-table-column prop="application_no" label="进件编号" min-width="170">
          <template #default="{ row }">
            <span class="mono">{{ row.application_no }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="product_name" label="产品" min-width="150" show-overflow-tooltip />
        <el-table-column prop="product_type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ typeLabel(row.product_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.progress || 0" :stroke-width="8" :show-text="false" />
            <span class="progress-text">{{ row.progress || 0 }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" min-width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="goDetail(row.id)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="!loading && !rows.length" class="empty-tip">暂无进件数据，小程序提交后将自动同步</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { listIntake } from '../api/intake'

const router = useRouter()
const loading = ref(false)
const rows = ref([])
const query = reactive({ q: '', status: '', productType: '' })

const statusMap = {
  draft: '草稿', auditing: '审核中', approved: '已通过', disbursed: '已放款', archived: '已归档'
}
const typeMap = {
  newCar: '新车', usedCar: '二手车', mortgage: '车抵', business: '经营贷',
  personal: '个人贷', warranty: '延保', property: '抵押贷', lease: '租赁'
}

const summaryChips = computed(() => {
  const all = rows.value
  return [
    { label: '全部', count: all.length },
    { label: '审核中', count: all.filter(r => r.status === 'auditing').length },
    { label: '已通过', count: all.filter(r => r.status === 'approved').length },
    { label: '延保', count: all.filter(r => r.product_type === 'warranty').length }
  ]
})

function statusLabel(s) { return statusMap[s] || s }
function typeLabel(s) { return typeMap[s] || s }
function statusType(s) {
  if (s === 'auditing') return 'warning'
  if (s === 'approved' || s === 'disbursed') return 'success'
  if (s === 'archived') return 'info'
  return ''
}

async function load() {
  loading.value = true
  try {
    rows.value = await listIntake(query)
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  query.q = ''
  query.status = ''
  query.productType = ''
  load()
}

function goDetail(id) {
  router.push(`/intake/detail/${id}`)
}

onMounted(load)
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 16px;
}

.stat-chips {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.chip {
  background: #fff;
  border: 1px solid var(--brand-border);
  border-radius: 12px;
  padding: 12px 20px;
  text-align: center;
  min-width: 90px;
}

.chip strong {
  display: block;
  font-size: 22px;
  color: var(--brand-primary);
}

.chip span {
  font-size: 12px;
  color: var(--brand-muted);
}

.mono {
  font-family: ui-monospace, monospace;
  font-size: 13px;
}

.progress-text {
  font-size: 12px;
  color: var(--brand-muted);
  margin-left: 8px;
}

.empty-tip {
  text-align: center;
  padding: 40px;
  color: var(--brand-muted);
}

.table-wrap :deep(.el-progress) {
  display: inline-block;
  width: 60px;
  vertical-align: middle;
}
</style>
