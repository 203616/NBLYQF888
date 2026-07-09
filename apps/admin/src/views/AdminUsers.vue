<template>
  <div>
    <h2 style="margin-bottom:20px;font-size:18px;color:var(--brand-primary)">管理员管理</h2>

    <el-card shadow="never">
      <div style="margin-bottom:16px">
        <el-button type="primary" @click="openAddDialog">新建管理员</el-button>
      </div>

      <el-table :data="admins" stripe size="small">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="username" label="用户名" width="140" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column label="角色" min-width="200">
          <template #default="{ row }">
            <el-tag v-for="rn in (row.roleNames || [])" :key="rn" size="small" style="margin-right:4px">{{ rn }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="last_login_at" label="最后登录" width="170" />
        <el-table-column prop="created_at" label="创建时间" width="170" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="editAdmin(row)">编辑</el-button>
            <el-popconfirm title="确定删除此管理员？" @confirm="deleteAdmin(row)" v-if="row.id !== 1">
              <template #reference>
                <el-button type="danger" link size="small" :disabled="row.id === 1">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新建/编辑管理员弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑管理员' : '新建管理员'" width="500px">
      <el-form :model="form" label-position="top">
        <el-form-item label="用户名" required>
          <el-input v-model="form.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item :label="isEdit ? '新密码（留空不修改）' : '密码'" required>
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="状态" v-if="isEdit">
          <el-switch v-model="form.statusActive" active-value="active" inactive-value="disabled" />
        </el-form-item>
        <el-form-item label="角色分配">
          <el-checkbox-group v-model="form.roleIds">
            <el-checkbox v-for="r in allRoles" :key="r.id" :label="r.id" style="width:180px;margin-bottom:4px">{{ r.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveAdmin">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../api/request'

const admins = ref([])
const allRoles = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const showAddTrigger = ref(false)
const editId = ref(null)
const form = ref({ username: '', password: '', name: '', statusActive: 'active', roleIds: [] })

onMounted(() => { loadAdmins(); loadRoles() })

async function loadAdmins() {
  const data = await request.get('/admin/admin-users')
  admins.value = data.data || []
}

async function loadRoles() {
  const data = await request.get('/admin/roles')
  allRoles.value = data.data || []
}

function editAdmin(row) {
  isEdit.value = true
  editId.value = row.id
  form.value = {
    username: row.username,
    password: '',
    name: row.name,
    statusActive: row.status || 'active',
    roleIds: (row.roleIds || []).map(Number)
  }
  dialogVisible.value = true
}

function openAddDialog() {
  showAddTrigger.value = true
  isEdit.value = false
  editId.value = null
  form.value = { username: '', password: '', name: '', statusActive: 'active', roleIds: [] }
  dialogVisible.value = true
}

async function saveAdmin() {
  if (!form.value.username) return ElMessage.warning('请输入用户名')
  if (!isEdit.value && !form.value.password) return ElMessage.warning('请输入密码')
  saving.value = true
  try {
    const payload = { ...form.value }
    if (!payload.password && isEdit.value) delete payload.password
    delete payload.statusActive
    if (isEdit.value) payload.status = form.value.statusActive
    if (isEdit.value) {
      await request.patch(`/admin/admin-users/${editId.value}`, payload)
      ElMessage.success('管理员已更新')
    } else {
      await request.post('/admin/admin-users', payload)
      ElMessage.success('管理员已创建')
    }
    dialogVisible.value = false
    loadAdmins()
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    saving.value = false
  }
}

async function deleteAdmin(row) {
  try {
    await request.delete(`/admin/admin-users/${row.id}`)
    ElMessage.success('管理员已删除')
    loadAdmins()
  } catch (e) {
    ElMessage.error(e.message)
  }
}
</script>
