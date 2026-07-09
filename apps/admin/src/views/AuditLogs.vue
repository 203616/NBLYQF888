<template>
  <div>
    <h2 style="margin-bottom:20px;font-size:18px;color:var(--brand-primary)">审计日志</h2>

    <el-card shadow="never">
      <el-form :inline="true" size="small" style="margin-bottom:16px">
        <el-form-item label="操作类型">
          <el-select v-model="filters.action" clearable placeholder="全部" style="width:140px" @change="load">
            <el-option label="全部" value="" />
            <el-option label="创建" value="create" />
            <el-option label="更新" value="update" />
            <el-option label="删除" value="delete" />
            <el-option label="导出" value="export" />
            <el-option label="登录" value="login" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="搜索操作员/资源/详情" clearable style="width:200px" @clear="load" @keyup.enter="load" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="load">查询</el-button>
          <el-button @click="refresh">刷新</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="list" size="small" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="created_at" label="时间" width="170" />
        <el-table-column prop="admin_name" label="操作员" width="120" />
        <el-table-column prop="action" label="操作" width="80">
          <template #default="{ row }">
            <el-tag :type="actionType(row.action)" size="small">{{ row.action }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="resource_type" label="资源类型" width="140" />
        <el-table-column prop="resource_id" label="资源ID" width="80" />
        <el-table-column prop="detail" label="详情" min-width="200" show-overflow-tooltip />
        <el-table-column prop="ip_address" label="IP" width="130" />
      </el-table>

      <div style="margin-top:16px;text-align:right">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="load"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listResource } from '../api/resources'

const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const filters = ref({ action: '', keyword: '' })

onMounted(() => load())

function actionType(action) {
  const map = { create: 'success', update: 'warning', delete: 'danger', export: 'info', login: 'primary' }
  return map[action] || 'info'
}

async function load() {
  try {
    const params = new URLSearchParams({
      page: page.value,
      pageSize: pageSize.value,
      ...(filters.value.action ? { action: filters.value.action } : {}),
      ...(filters.value.keyword ? { keyword: filters.value.keyword } : {})
    })
    const resp = await listResource(`audit-logs?${params.toString()}`)
    list.value = resp.list || []
    total.value = resp.total || 0
  } catch (e) {
    console.error(e)
  }
}

function refresh() {
  page.value = 1
  filters.value = { action: '', keyword: '' }
  load()
}
</script>
