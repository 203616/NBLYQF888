<template>
  <div>
    <h2 style="margin-bottom:20px;font-size:18px;color:var(--brand-primary)">角色权限管理</h2>

    <el-card shadow="never">
      <div style="margin-bottom:16px">
        <el-button type="primary" @click="showAdd = true">新建角色</el-button>
      </div>

      <el-table :data="roles" stripe size="small" row-key="id">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="角色名称" width="160" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="系统角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_system ? 'danger' : 'info'" size="small">{{ row.is_system ? '系统' : '自定义' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="权限数" width="80">
          <template #default="{ row }">
            {{ (row.permissions || []).length }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="editRole(row)">编辑权限</el-button>
            <el-popconfirm title="确定删除此角色？" @confirm="deleteRole(row)">
              <template #reference>
                <el-button type="danger" link size="small" :disabled="row.is_system">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新建/编辑角色弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '新建角色'" width="700px">
      <el-form :model="form" label-position="top">
        <el-form-item label="角色名称" required>
          <el-input v-model="form.name" placeholder="例如：运营主管" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="权限分配">
          <el-checkbox :indeterminate="!allPermChecked && form.permissions.length > 0" :model-value="allPermChecked" @change="toggleAllPerms">全选/取消</el-checkbox>
          <div v-for="group in permissionGroups" :key="group.group" style="margin-top:12px">
            <div style="font-weight:600;font-size:13px;color:#666;margin-bottom:6px">{{ group.group }}</div>
            <el-checkbox-group v-model="form.permissions">
              <el-checkbox v-for="p in group.items" :key="p.code" :label="p.code" style="width:160px;margin-right:0;margin-bottom:4px">
                {{ p.name }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveRole">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listResource } from '../api/resources'
import request from '../api/request'

const roles = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const form = ref({ name: '', description: '', permissions: [] })
const editId = ref(null)

// 完整权限列表（和后端一致）
const ALL_PERMISSIONS = [
  { code: 'dashboard:view', name: '查看数据概览', group: '数据中心' },
  { code: 'regions:view', name: '查看地区看板', group: '数据中心' },
  { code: 'products:list', name: '查看产品列表', group: '产品管理' },
  { code: 'products:edit', name: '编辑产品', group: '产品管理' },
  { code: 'articles:list', name: '查看内容列表', group: '内容中心' },
  { code: 'articles:edit', name: '编辑内容', group: '内容中心' },
  { code: 'banners:list', name: '查看轮播图', group: '轮播图管理' },
  { code: 'banners:edit', name: '编辑轮播图', group: '轮播图管理' },
  { code: 'exposures:list', name: '查看曝光案例', group: '曝光案例' },
  { code: 'exposures:edit', name: '编辑曝光案例', group: '曝光案例' },
  { code: 'reports:list', name: '查看举报', group: '举报审核' },
  { code: 'reports:edit', name: '处理举报', group: '举报审核' },
  { code: 'sources:list', name: '查看数据来源', group: '数据来源' },
  { code: 'serviceSessions:list', name: '查看客服会话', group: '客服会话' },
  { code: 'notifications:list', name: '查看消息', group: '消息管理' },
  { code: 'notifications:edit', name: '发送消息', group: '消息管理' },
  { code: 'demands:list', name: '查看需求', group: '需求管理' },
  { code: 'demands:edit', name: '编辑需求', group: '需求管理' },
  { code: 'clues:list', name: '查看线索', group: '汽车线索' },
  { code: 'clues:edit', name: '编辑线索', group: '汽车线索' },
  { code: 'intake:list', name: '查看进件', group: '进件管理' },
  { code: 'intake:edit', name: '编辑进件', group: '进件管理' },
  { code: 'warrantyApplications:list', name: '查看延保申请', group: '延保' },
  { code: 'warrantyApplications:edit', name: '编辑延保申请', group: '延保' },
  { code: 'warrantyClaims:list', name: '查看延保理赔', group: '延保理赔' },
  { code: 'warrantyClaims:edit', name: '处理延保理赔', group: '延保理赔' },
  { code: 'vehicleValuations:list', name: '查看估值记录', group: '估值' },
  { code: 'salesStaff:list', name: '查看业务员', group: '业务员' },
  { code: 'salesStaff:edit', name: '编辑业务员', group: '业务员' },
  { code: 'applications:list', name: '查看融资申请', group: '融资申请' },
  { code: 'applications:edit', name: '编辑融资申请', group: '融资申请' },
  { code: 'users:list', name: '查看用户', group: '用户管理' },
  { code: 'users:edit', name: '编辑用户', group: '用户管理' },
  { code: 'financeCirclePosts:list', name: '查看融圈动态', group: '融圈审核' },
  { code: 'financeCirclePosts:edit', name: '审核融圈动态', group: '融圈审核' },
  { code: 'settings:list', name: '查看系统设置', group: '系统设置' },
  { code: 'settings:edit', name: '编辑系统设置', group: '系统设置' },
  { code: 'auditLogs:list', name: '查看审计日志', group: '审计日志' },
  { code: 'systemStatus:view', name: '查看系统状态', group: '系统状态' },
  { code: 'integrations:view', name: '查看集成配置', group: '集成' },
  { code: 'deploy:manage', name: '发布管理', group: '发布部署' },
  { code: 'export:data', name: '导出数据', group: '导出' },
  { code: 'adminUsers:list', name: '查看管理员', group: '管理员' },
  { code: 'adminUsers:edit', name: '编辑管理员', group: '管理员' },
  { code: 'roles:manage', name: '角色权限管理', group: '角色管理' },
]

const permissionGroups = computed(() => {
  const map = {}
  for (const p of ALL_PERMISSIONS) {
    if (!map[p.group]) map[p.group] = { group: p.group, items: [] }
    map[p.group].items.push(p)
  }
  return Object.values(map)
})

const allPermChecked = computed(() => form.value.permissions.length === ALL_PERMISSIONS.length)

function toggleAllPerms(checked) {
  form.value.permissions = checked ? ALL_PERMISSIONS.map(p => p.code) : []
}

onMounted(() => loadRoles())

async function loadRoles() {
  const data = await request.get('/admin/roles')
  roles.value = data.data || []
}

function editRole(row) {
  isEdit.value = true
  editId.value = row.id
  form.value = {
    name: row.name,
    description: row.description || '',
    permissions: row.permissions || []
  }
  dialogVisible.value = true
}

function showAdd() {
  isEdit.value = false
  editId.value = null
  form.value = { name: '', description: '', permissions: [] }
  dialogVisible.value = true
}

async function saveRole() {
  if (!form.value.name) return ElMessage.warning('请输入角色名称')
  saving.value = true
  try {
    if (isEdit.value) {
      await request.patch(`/admin/roles/${editId.value}`, form.value)
      ElMessage.success('角色已更新')
    } else {
      await request.post('/admin/roles', form.value)
      ElMessage.success('角色已创建')
    }
    dialogVisible.value = false
    loadRoles()
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    saving.value = false
  }
}

async function deleteRole(row) {
  try {
    await request.delete(`/admin/roles/${row.id}`)
    ElMessage.success('角色已删除')
    loadRoles()
  } catch (e) {
    ElMessage.error(e.message)
  }
}
</script>
