<template>
  <div>
    <div class="page-header">
      <h2>系统配置</h2>
      <p>全局配置项管理，按分类展示和编辑</p>
    </div>

    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane v-for="group in groups" :key="group.category" :label="`${group.icon} ${group.title}`" :name="group.category">
        <div class="tab-toolbar">
          <span class="group-desc">{{ group.desc }}</span>
          <el-button type="primary" size="small" :loading="saving" @click="saveGroup(group.category)">保存分组</el-button>
        </div>
        <el-table :data="groupedConfigs[group.category] || []" stripe size="small">
          <el-table-column prop="key" label="配置键" width="200" />
          <el-table-column prop="description" label="说明" min-width="180" />
          <el-table-column label="配置值" min-width="300">
            <template #default="{ row }">
              <el-input v-model="editMap[row.id]" :placeholder="row.value || '（空）'" size="small" clearable />
            </template>
          </el-table-column>
          <el-table-column label="更新时间" width="170">
            <template #default="{ row }">{{ row.updated_at || '-' }}</template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../api/request'

const configs = ref([])
const editMap = ref({})
const saving = ref(false)
const activeTab = ref('general')

const groups = [
  { category: 'general', icon: '⚙️', title: '通用设置', desc: '品牌名称、客服热线、公司信息等' },
  { category: 'email', icon: '📧', title: '邮件服务', desc: 'SMTP 与管理员邮箱配置' },
  { category: 'risk', icon: '🛡️', title: '风控参数', desc: '贷款金额限制、信用分门槛等' },
  { category: 'display', icon: '🎨', title: '显示设置', desc: '轮播间隔、列表每页数量等' },
  { category: 'integration', icon: '🔗', title: '第三方集成', desc: '阿里云、微信等密钥（建议在集成联调页配置）' }
]

const groupedConfigs = computed(() => {
  const map = {}
  for (const g of groups) {
    map[g.category] = []
  }
  for (const c of configs.value) {
    const cat = c.category || 'general'
    if (!map[cat]) map[cat] = []
    map[cat].push(c)
    // 初始化编辑值
    if (editMap.value[c.id] === undefined) {
      editMap.value[c.id] = c.value || ''
    }
  }
  return map
})

async function loadData() {
  try {
    const res = await request.get('/admin/config-settings')
    configs.value = res?.list || []
  } catch (e) {
    ElMessage.warning('加载配置失败: ' + e.message)
  }
}

async function saveGroup(category) {
  saving.value = true
  const items = groupedConfigs.value[category] || []
  let count = 0
  try {
    for (const item of items) {
      const newValue = editMap.value[item.id]
      if (newValue !== item.value) {
        await request.patch(`/admin/config-settings/${item.id}`, { value: newValue })
        count++
      }
    }
    ElMessage.success(`已保存 ${count} 项配置`)
    loadData()
  } catch (e) {
    ElMessage.error('保存失败: ' + e.message)
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.tab-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.group-desc {
  font-size: 13px;
  color: var(--brand-muted);
}
</style>
