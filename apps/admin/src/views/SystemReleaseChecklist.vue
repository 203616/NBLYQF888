<template>
  <div class="release-page">
    <div class="page-header">
      <h2>正式版发布检查清单</h2>
      <p>提交微信审核前的完整校验项（与 verify:production 等价扩展）</p>
    </div>

    <div class="toolbar page-card">
      <el-button type="primary" :loading="loading" @click="load">重新检测</el-button>
      <el-tag v-if="data?.summary" :type="data.summary.ready ? 'success' : 'danger'" size="large">
        {{ data.summary.ready ? '可提交审核' : '存在阻塞项' }}
      </el-tag>
      <span v-if="data?.summary" class="summary-text">
        {{ data.summary.passed }} 通过 · {{ data.summary.warned }} 警告 · {{ data.summary.failed }} 失败
      </span>
    </div>

    <div class="page-card" v-if="data?.checks?.length">
      <el-table :data="data.checks" stripe>
        <el-table-column prop="label" label="检查项" min-width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="detail" label="说明" min-width="260" show-overflow-tooltip />
        <el-table-column prop="cmd" label="命令/文档" min-width="200" show-overflow-tooltip />
      </el-table>
    </div>

    <div class="page-card hints">
      <h3 class="section-title">发布流程</h3>
      <ol>
        <li>体验版完整走查（进件、易融圈、客服、PDF）</li>
        <li>本页全部无「失败」项</li>
        <li>pnpm upload:mp 上传 → mp.weixin.qq.com 提交审核</li>
        <li>正式版 API 环境切 production，关闭开发联调面板</li>
      </ol>
      <router-link to="/system/deploy" class="link">前往发布部署 →</router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getReleaseChecklist } from '../api/resources'

const loading = ref(false)
const data = ref(null)

function statusType(status) {
  if (status === 'ok') return 'success'
  if (status === 'warn') return 'warning'
  return 'danger'
}

function statusLabel(status) {
  return { ok: '通过', warn: '警告', fail: '失败' }[status] || status
}

async function load() {
  loading.value = true
  try {
    data.value = await getReleaseChecklist()
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.summary-text {
  font-size: 14px;
  color: #666;
}

.section-title {
  margin: 0 0 12px;
}

.hints ol {
  margin: 0 0 16px;
  padding-left: 20px;
  line-height: 1.9;
  color: #444;
}

.link {
  color: var(--brand-primary);
  text-decoration: none;
}
</style>
