<template>
  <div class="system-status">
    <h2 style="margin-bottom:20px;font-size:18px;color:var(--brand-primary)">系统状态监控</h2>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-label">Node.js 版本</div>
          <div class="stat-value">{{ status.nodeVersion }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-label">数据库大小</div>
          <div class="stat-value">{{ formatSize(status.dbSize) }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-label">数据表数量</div>
          <div class="stat-value">{{ status.tableCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-label">运行时间</div>
          <div class="stat-value">{{ formatUptime(status.uptime) }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" style="margin-top:20px">
      <template #header>
        <span>各表记录数</span>
      </template>
      <el-table :data="status.totalRecords || []" size="small" stripe>
        <el-table-column prop="table" label="数据表" width="250" />
        <el-table-column prop="count" label="记录数" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSystemStatus } from '../api/resources'

const status = ref({ nodeVersion: '', dbSize: 0, tableCount: 0, uptime: 0, totalRecords: [] })

onMounted(async () => {
  try {
    const data = await getSystemStatus()
    if (data) status.value = data
  } catch (e) {
    console.error(e)
  }
})

function formatSize(bytes) {
  if (!bytes) return '0 B'
  const kb = bytes / 1024
  if (kb < 1024) return kb.toFixed(1) + ' KB'
  return (kb / 1024).toFixed(2) + ' MB'
}

function formatUptime(sec) {
  if (!sec) return '0s'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  return `${h}h ${m}m ${s}s`
}
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  text-align: center;
  padding: 8px 0;
}
.stat-label {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: var(--brand-primary);
}
</style>
