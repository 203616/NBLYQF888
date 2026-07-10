<template>
  <div class="commission-rules">
    <div class="page-header">
      <div class="header-main">
        <span class="page-icon">💰</span>
        <div>
          <h2>分润规则</h2>
          <p>按产品类型配置分润比例，不同角色查看对应报表</p>
        </div>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="page-card">
      <el-tab-pane label="分润规则配置" name="rules">
        <!-- 分润规则列表 -->
        <div class="section-header">
          <h3>分润比例配置</h3>
          <el-button type="primary" size="small" @click="openAddRule">+ 新增规则</el-button>
        </div>

        <el-table :data="rules" v-loading="loading" stripe highlight-current-row empty-text="暂无分润规则，请新增">
          <el-table-column prop="product_type" label="产品类型" min-width="140" />
          <el-table-column prop="role_type" label="角色类型" min-width="130">
            <template #default="{ row }">
              <el-tag :type="roleTagType(row.role_type)" size="small">{{ roleLabel(row.role_type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="commission_rate" label="分润比例 (%)" width="140">
            <template #default="{ row }">
              <span class="rate-value">{{ row.commission_rate }}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="fixed_amount" label="固定金额 (元)" width="140">
            <template #default="{ row }">{{ row.fixed_amount || '-' }}</template>
          </el-table-column>
          <el-table-column prop="min_amount" label="最低金额" width="120">
            <template #default="{ row }">{{ row.min_amount || '-' }}</template>
          </el-table-column>
          <el-table-column prop="max_amount" label="最高金额" width="120">
            <template #default="{ row }">{{ row.max_amount || '-' }}</template>
          </el-table-column>
          <el-table-column prop="description" label="说明" min-width="160" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">{{ row.status === 'active' ? '启用' : '停用' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="160">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="openEditRule(row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="分润报表" name="reports">
        <div class="section-header">
          <h3>分润记录</h3>
          <el-select v-model="reportRoleFilter" placeholder="角色筛选" clearable style="width:160px" @change="loadReports">
            <el-option label="全部" value="" />
            <el-option label="管理员" value="admin" />
            <el-option label="代理商" value="agent" />
            <el-option label="业务员" value="salesman" />
          </el-select>
        </div>

        <!-- 汇总卡片 -->
        <div class="summary-cards" v-if="reportSummary.length">
          <div class="summary-card" v-for="s in reportSummary" :key="s.role_type">
            <div class="card-label">{{ roleLabel(s.role_type) }}</div>
            <div class="card-value">{{ s.total_commission.toFixed(2) }} 元</div>
            <div class="card-sub">{{ s.count }} 笔 / 总额 {{ s.total_amount.toFixed(2) }} 元</div>
          </div>
        </div>

        <el-table :data="reportList" v-loading="reportLoading" stripe highlight-current-row empty-text="暂无分润记录">
          <el-table-column prop="id" label="ID" width="70" />
          <el-table-column prop="application_id" label="申请ID" width="100" />
          <el-table-column prop="product_type" label="产品类型" min-width="120" />
          <el-table-column prop="role_type" label="角色" width="100">
            <template #default="{ row }">
              <el-tag :type="roleTagType(row.role_type)" size="small">{{ roleLabel(row.role_type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="account_name" label="账户" min-width="120" />
          <el-table-column prop="amount" label="金额" width="120">
            <template #default="{ row }">{{ row.amount }} 元</template>
          </el-table-column>
          <el-table-column prop="commission" label="分润" width="120">
            <template #default="{ row }"><span class="rate-value">{{ row.commission }} 元</span></template>
          </el-table-column>
          <el-table-column prop="rate" label="比例" width="80">
            <template #default="{ row }">{{ row.rate }}%</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'settled' ? 'success' : 'warning'" size="small">{{ row.status === 'settled' ? '已结算' : '待结算' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="时间" min-width="160" />
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增/编辑规则弹窗 -->
    <el-dialog v-model="ruleDialogVisible" :title="isEditing ? '编辑分润规则' : '新增分润规则'" width="560px">
      <el-form label-position="top">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="产品类型" required>
              <el-select v-model="ruleForm.product_type" placeholder="请选择产品类型" style="width:100%">
                <el-option label="车贷" value="car_loan" />
                <el-option label="经营贷" value="business_loan" />
                <el-option label="抵押贷" value="mortgage_loan" />
                <el-option label="消费贷" value="consumer_loan" />
                <el-option label="融资租赁" value="finance_lease" />
                <el-option label="延保" value="warranty" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色类型" required>
              <el-select v-model="ruleForm.role_type" placeholder="请选择角色" style="width:100%">
                <el-option label="管理员" value="admin" />
                <el-option label="代理商" value="agent" />
                <el-option label="业务员" value="salesman" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="分润比例 (%)" required>
              <el-input-number v-model="ruleForm.commission_rate" :min="0" :max="100" :precision="2" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="固定金额 (元)">
              <el-input-number v-model="ruleForm.fixed_amount" :min="0" :precision="2" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="开启状态">
              <el-switch v-model="ruleForm.status" active-value="active" inactive-value="disabled" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="最低金额">
              <el-input-number v-model="ruleForm.min_amount" :min="0" :precision="2" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最高金额">
              <el-input-number v-model="ruleForm.max_amount" :min="0" :precision="2" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="说明">
          <el-input v-model="ruleForm.description" type="textarea" :rows="2" placeholder="规则说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveRule">{{ isEditing ? '保存修改' : '创建规则' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCommissionRules, saveCommissionRule, deleteCommissionRule, getCommissionReports } from '../api/resources'

const activeTab = ref('rules')
const loading = ref(false)
const saving = ref(false)
const rules = ref([])
const ruleDialogVisible = ref(false)
const isEditing = ref(false)
const ruleForm = ref(initRuleForm())

const reportLoading = ref(false)
const reportList = ref([])
const reportSummary = ref([])
const reportRoleFilter = ref('')

function initRuleForm() {
  return {
    product_type: '',
    role_type: '',
    commission_rate: 0,
    fixed_amount: 0,
    min_amount: 0,
    max_amount: null,
    description: '',
    status: 'active'
  }
}

function roleLabel(type) {
  const map = { admin: '管理员', agent: '代理商', salesman: '业务员' }
  return map[type] || type
}

function roleTagType(type) {
  const map = { admin: 'danger', agent: 'warning', salesman: 'primary' }
  return map[type] || ''
}

async function loadRules() {
  loading.value = true
  try {
    const data = await getCommissionRules()
    rules.value = data.list || []
  } catch (e) {
    ElMessage.error('加载分润规则失败')
  } finally {
    loading.value = false
  }
}

async function loadReports() {
  reportLoading.value = true
  try {
    const data = await getCommissionReports({ role_type: reportRoleFilter.value || undefined })
    reportList.value = data.list || []
    reportSummary.value = data.summary || []
  } catch (e) {
    ElMessage.error('加载分润报表失败')
  } finally {
    reportLoading.value = false
  }
}

function openAddRule() {
  isEditing.value = false
  ruleForm.value = initRuleForm()
  ruleDialogVisible.value = true
}

function openEditRule(row) {
  isEditing.value = true
  ruleForm.value = { ...row }
  ruleDialogVisible.value = true
}

async function saveRule() {
  if (!ruleForm.value.product_type || !ruleForm.value.role_type) {
    ElMessage.warning('请选择产品类型和角色类型')
    return
  }
  if (ruleForm.value.commission_rate <= 0) {
    ElMessage.warning('分润比例必须大于0')
    return
  }
  saving.value = true
  try {
    await saveCommissionRule(ruleForm.value)
    ElMessage.success('分润规则已保存')
    ruleDialogVisible.value = false
    loadRules()
  } catch (e) {
    ElMessage.error(e.data?.message || e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定删除「${row.product_type} / ${roleLabel(row.role_type)}」的分润规则吗？`, '确认删除', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCommissionRule(row.id)
      ElMessage.success('已删除')
      loadRules()
    } catch (e) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  loadRules()
  loadReports()
})
</script>

<style scoped>
.header-main { display: flex; align-items: flex-start; gap: 16px }
.page-icon { font-size: 36px; line-height: 1; margin-top: 4px }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px }
.section-header h3 { margin: 0; font-size: 15px; color: var(--el-text-color-primary) }
.summary-cards { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap }
.summary-card { background: #fff; border: 1px solid var(--el-border-color); border-radius: 12px; padding: 16px 24px; min-width: 180px; flex: 1 }
.card-label { font-size: 13px; color: var(--el-text-color-secondary); margin-bottom: 4px }
.card-value { font-size: 22px; font-weight: 600; color: var(--el-color-primary) }
.card-sub { font-size: 12px; color: var(--el-text-color-secondary); margin-top: 4px }
.rate-value { color: var(--el-color-success); font-weight: 600 }
</style>
