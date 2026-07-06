<template>
  <div class="resource-list">
    <div class="page-header">
      <div class="header-main">
        <span class="resource-icon">{{ config.icon }}</span>
        <div>
          <h2>{{ title }}</h2>
          <p>{{ config.description }}</p>
        </div>
      </div>
    </div>

    <div class="stat-chips">
      <div class="chip">
        <strong>{{ filteredRows.length }}</strong>
        <span>当前记录</span>
      </div>
      <div class="chip">
        <strong>{{ activeCount }}</strong>
        <span>有效/启用</span>
      </div>
      <div class="chip">
        <strong>{{ resource }}</strong>
        <span>资源标识</span>
      </div>
    </div>

    <div class="page-card toolbar">
      <el-input
        v-model="keyword"
        :placeholder="config.searchPlaceholder"
        clearable
        style="width: 280px"
        @keyup.enter="applyFilter"
        @clear="applyFilter"
      />
      <el-button type="primary" @click="applyFilter">查询</el-button>
      <el-button @click="resetFilter">重置</el-button>
      <el-button :loading="loading" @click="loadData">刷新</el-button>
      <template v-if="resource === 'financeCirclePosts'">
        <el-radio-group v-model="reviewFilter" @change="applyFilter">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="pending">待审核</el-radio-button>
          <el-radio-button label="approved">已通过</el-radio-button>
          <el-radio-button label="rejected">已驳回</el-radio-button>
        </el-radio-group>
      </template>
    </div>

    <el-alert
      v-if="resource === 'financeCirclePosts' && moderationRules"
      class="moderation-hint"
      type="info"
      :closable="false"
      show-icon
      title="自动审核规则"
    >
      <template #default>
        <span v-if="moderationRules.enabled">
          纯文字 ≤ {{ moderationRules.maxTextLengthForAutoApprove }} 字自动通过；
          含图片转人工；
          敏感词 {{ (moderationRules.blockedKeywords || []).length }} 个
          （配置见 <router-link to="/social/finance-moderation">融圈审核规则</router-link>）
        </span>
        <span v-else>自动审核已关闭，全部转人工</span>
      </template>
    </el-alert>

    <div class="page-card table-wrap">
      <el-table
        :data="pagedRows"
        v-loading="loading"
        stripe
        highlight-current-row
        :empty-text="emptyText"
        @row-click="openEdit"
      >
        <el-table-column
          v-for="col in displayColumns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth || 140"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <el-tag v-if="col.prop === 'status'" :type="statusType(row.status)" size="small" effect="plain">
              {{ row.status || '-' }}
            </el-tag>
            <el-tag v-else-if="col.prop === 'is_verified'" :type="row.is_verified ? 'success' : 'info'" size="small">
              {{ row.is_verified ? '已实名' : '未实名' }}
            </el-tag>
            <el-tag v-else-if="col.prop === 'review_status'" :type="statusType(row.review_status)" size="small" effect="plain">
              {{ reviewStatusLabel(row.review_status) }}
            </el-tag>
            <div v-else-if="col.prop === 'images' && resource === 'financeCirclePosts'" class="thumb-row" @click.stop>
              <el-image
                v-for="(img, idx) in imageList(row).slice(0, 3)"
                :key="idx"
                :src="resolveImageUrl(img)"
                :preview-src-list="imageList(row).map(resolveImageUrl)"
                :initial-index="idx"
                fit="cover"
                class="table-thumb"
                preview-teleported
              />
              <span v-if="!imageList(row).length" class="muted">-</span>
            </div>
            <span v-else-if="col.prop === 'images'">{{ formatImages(row.images) }}</span>
            <a v-else-if="col.prop === 'url' && row.url" :href="row.url" target="_blank" class="link-cell" @click.stop>查看链接</a>
            <span v-else>{{ formatCell(row[col.prop]) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" :width="actionColumnWidth">
          <template #default="{ row }">
            <template v-if="resource === 'warrantyClaims'">
              <el-button link type="warning" @click.stop="updateClaimStatus(row, 'processing')">受理</el-button>
              <el-button link type="success" @click.stop="updateClaimStatus(row, 'done')">完成</el-button>
              <el-button link type="danger" @click.stop="updateClaimStatus(row, 'rejected')">驳回</el-button>
              <el-button link type="primary" @click.stop="openEdit(row)">详情</el-button>
            </template>
            <template v-else-if="resource === 'financeCirclePosts'">
              <el-button link type="success" @click.stop="updateReviewStatus(row, 'approved')">通过</el-button>
              <el-button link type="danger" @click.stop="updateReviewStatus(row, 'rejected')">驳回</el-button>
              <el-button link type="primary" @click.stop="openEdit(row)">详情</el-button>
            </template>
            <el-button v-else link type="primary" @click.stop="openEdit(row)">查看/编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-footer" v-if="filteredRows.length > pageSize">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="filteredRows.length"
          :page-size="pageSize"
          v-model:current-page="currentPage"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="`${title} · 详情`" width="680px" class="resource-dialog">
      <div v-if="resource === 'financeCirclePosts' && detailImages.length" class="image-preview-panel">
        <h4 class="preview-title">上传图片（{{ detailImages.length }}）</h4>
        <div class="preview-grid">
          <el-image
            v-for="(img, idx) in detailImages"
            :key="idx"
            :src="resolveImageUrl(img)"
            :preview-src-list="detailImages.map(resolveImageUrl)"
            :initial-index="idx"
            fit="cover"
            class="preview-img"
            preview-teleported
          />
        </div>
      </div>
      <el-descriptions :column="2" border class="preview-desc">
        <el-descriptions-item v-for="col in displayColumns" :key="col.prop" :label="col.label" :span="col.prop === 'content' || col.prop === 'value' ? 2 : 1">
          <template v-if="col.prop === 'review_status'">{{ reviewStatusLabel(editForm[col.prop]) }}</template>
          <template v-else-if="col.prop === 'images'">{{ formatImages(editForm[col.prop]) }}</template>
          <template v-else>{{ formatCell(editForm[col.prop]) }}</template>
        </el-descriptions-item>
      </el-descriptions>
      <template v-if="resource === 'financeCirclePosts' && editForm.review_status === 'pending'">
        <el-divider />
        <div class="review-actions">
          <el-button type="success" @click="updateReviewStatus(editForm, 'approved')">通过</el-button>
          <el-button type="danger" @click="updateReviewStatus(editForm, 'rejected')">驳回</el-button>
        </div>
      </template>
      <el-divider />
      <el-form label-position="top">
        <el-form-item v-for="column in editableColumns" :key="column" :label="columnLabel(column)">
          <el-input v-model="editForm[column]" type="textarea" :autosize="{ minRows: 1, maxRows: 6 }" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存更改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { listResource, updateResource, getFinanceModerationRules } from '../api/resources'
import { getResourceConfig, inferColumns } from '../config/resourceMeta'

const route = useRoute()
const rows = ref([])
const filteredRows = ref([])
const loading = ref(false)
const saving = ref(false)
const keyword = ref('')
const dialogVisible = ref(false)
const editForm = ref({})
const currentPage = ref(1)
const pageSize = 15
const reviewFilter = ref('all')
const moderationRules = ref(null)

const resource = computed(() => route.meta.resource)
const title = computed(() => route.meta.title)
const config = computed(() => getResourceConfig(resource.value))

const displayColumns = computed(() => {
  const defined = config.value.columns || []
  if (defined.length) return defined
  return inferColumns(rows.value)
})

const editableColumns = computed(() => {
  const cols = displayColumns.value.map(c => c.prop)
  return cols.filter(key => !['id', 'created_at', 'updated_at'].includes(key))
})

const activeCount = computed(() =>
  rows.value.filter(r => {
    const s = String(r.status || '').toLowerCase()
    return !s || s === 'active' || s === 'enabled' || s === 'published' || s === '1' || s === 'true'
  }).length
)

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredRows.value.slice(start, start + pageSize)
})

const emptyText = computed(() => `暂无${title.value}数据，接口 /admin/${resource.value}`)

const detailImages = computed(() => imageList(editForm.value))

const actionColumnWidth = computed(() => {
  if (resource.value === 'warrantyClaims') return 280
  if (resource.value === 'financeCirclePosts') return 220
  return 120
})

function columnLabel(prop) {
  const col = displayColumns.value.find(c => c.prop === prop)
  return col?.label || prop
}

function formatCell(val) {
  if (val === null || val === undefined || val === '') return '-'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

function formatImages(val) {
  if (!val) return '-'
  try {
    const arr = typeof val === 'string' ? JSON.parse(val) : val
    if (!Array.isArray(arr) || !arr.length) return '-'
    return `${arr.length} 张`
  } catch {
    return String(val).slice(0, 40)
  }
}

function imageList(row) {
  if (row?.image_urls?.length) return row.image_urls
  if (!row?.images) return []
  try {
    const arr = typeof row.images === 'string' ? JSON.parse(row.images) : row.images
    return Array.isArray(arr) ? arr.filter(Boolean) : []
  } catch {
    return []
  }
}

function resolveImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/uploads/')) return url
  return url
}

function reviewStatusLabel(status) {
  const map = { pending: '待审核', approved: '已通过', rejected: '已驳回' }
  return map[status] || status || '已通过'
}

function statusType(status) {
  const s = String(status || '').toLowerCase()
  if (['active', 'enabled', 'published', 'approved', 'done'].includes(s)) return 'success'
  if (['pending', 'auditing', 'processing'].includes(s)) return 'warning'
  if (['disabled', 'rejected', 'archived'].includes(s)) return 'info'
  return ''
}

function applyFilter() {
  const q = keyword.value.trim().toLowerCase()
  let list = [...rows.value]
  if (resource.value === 'financeCirclePosts' && reviewFilter.value !== 'all') {
    list = list.filter(row => String(row.review_status || 'approved') === reviewFilter.value)
  }
  if (!q) {
    filteredRows.value = list
  } else {
    filteredRows.value = list.filter(row =>
      Object.values(row).some(v => String(v || '').toLowerCase().includes(q))
    )
  }
  currentPage.value = 1
}

function resetFilter() {
  keyword.value = ''
  reviewFilter.value = 'all'
  applyFilter()
}

async function loadData() {
  loading.value = true
  try {
    rows.value = await listResource(resource.value)
    applyFilter()
  } finally {
    loading.value = false
  }
}

async function loadModerationRules() {
  if (resource.value !== 'financeCirclePosts') {
    moderationRules.value = null
    return
  }
  try {
    const data = await getFinanceModerationRules()
    moderationRules.value = data.rules || data
  } catch {
    moderationRules.value = null
  }
}

function openEdit(row) {
  editForm.value = { ...row }
  dialogVisible.value = true
}

async function save() {
  if (!editForm.value.id) {
    dialogVisible.value = false
    return
  }
  saving.value = true
  try {
    await updateResource(resource.value, editForm.value.id, editForm.value)
    ElMessage.success('已保存')
    dialogVisible.value = false
    loadData()
  } finally {
    saving.value = false
  }
}

async function updateClaimStatus(row, status) {
  const labels = { processing: '受理中', done: '已完成', rejected: '已驳回' }
  try {
    await updateResource('warrantyClaims', row.id, { status, handler: '管理员', remark: `状态更新为${labels[status] || status}` })
    ElMessage.success(`已标记为${labels[status] || status}`)
    loadData()
  } catch {
    ElMessage.error('更新失败')
  }
}

async function updateReviewStatus(row, review_status) {
  const labels = { approved: '已通过', rejected: '已驳回' }
  try {
    await updateResource('financeCirclePosts', row.id, {
      review_status,
      review_note: review_status === 'rejected' ? '内容不符合社区规范' : '审核通过'
    })
    ElMessage.success(`已${labels[review_status] || review_status}`)
    dialogVisible.value = false
    loadData()
  } catch {
    ElMessage.error('审核失败')
  }
}

onMounted(() => {
  loadData()
  loadModerationRules()
})
watch(() => route.fullPath, () => {
  keyword.value = ''
  reviewFilter.value = 'all'
  currentPage.value = 1
  loadData()
  loadModerationRules()
})
</script>

<style scoped>
.header-main {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.resource-icon {
  font-size: 36px;
  line-height: 1;
  margin-top: 4px;
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
  min-width: 100px;
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

.toolbar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 16px;
}

.table-footer {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.link-cell {
  color: var(--brand-primary);
  text-decoration: none;
}

.preview-desc {
  margin-bottom: 8px;
}

.resource-dialog :deep(.el-dialog__body) {
  max-height: 60vh;
  overflow-y: auto;
}

.moderation-hint {
  margin-bottom: 16px;
}

.image-preview-panel {
  margin-bottom: 16px;
}

.preview-title {
  margin: 0 0 10px;
  font-size: 14px;
  color: var(--brand-muted);
}

.preview-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preview-img {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  border: 1px solid var(--brand-border);
}

.table-thumb {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  margin-right: 4px;
}

.thumb-row {
  display: flex;
  align-items: center;
}

.review-actions {
  display: flex;
  gap: 12px;
}

.muted {
  color: var(--brand-muted);
}
</style>
