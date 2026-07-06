<template>
  <div class="integrations-page">
    <div class="page-header">
      <h2>集成联调</h2>
      <p>阿里云 OCR、微信订阅消息与智能客服配置状态（只读检测）</p>
    </div>

    <div class="toolbar page-card">
      <el-button type="primary" :loading="loading" @click="load">重新检测</el-button>
      <el-button @click="openDoc">查看配置文档</el-button>
    </div>

    <el-row :gutter="16" v-if="data">
      <el-col :xs="24" :md="8" v-for="card in cards" :key="card.key">
        <div class="page-card status-card" :class="card.ok ? 'ok' : 'warn'">
          <div class="card-head">
            <span class="card-icon">{{ card.icon }}</span>
            <el-tag :type="card.ok ? 'success' : 'warning'" size="small">{{ card.ok ? '已就绪' : '待配置' }}</el-tag>
          </div>
          <h3>{{ card.title }}</h3>
          <p class="card-desc">{{ card.desc }}</p>
          <ul class="detail-list">
            <li v-for="line in card.lines" :key="line">{{ line }}</li>
          </ul>
        </div>
      </el-col>
    </el-row>

    <div class="page-card checklist" v-if="data">
      <h3 class="section-title">联调步骤</h3>
      <el-steps :active="activeStep" finish-status="success" align-center>
        <el-step title="配置 .env" description="密钥与模板 ID" />
        <el-step title="重启服务" description="pnpm dev:server" />
        <el-step title="小程序联调" description="development 模式" />
        <el-step title="验证进件" description="上传 + OCR + 订阅" />
      </el-steps>
      <el-alert class="mt-16" :title="wechatTokenMessage" :type="wechatTokenOk ? 'success' : 'warning'" show-icon :closable="false" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getIntegrations } from '../api/resources'

const loading = ref(false)
const data = ref(null)

const wechatTokenOk = computed(() => data.value?.wechatToken?.ok)
const wechatTokenMessage = computed(() => data.value?.wechatToken?.message || '-')

const activeStep = computed(() => {
  if (!data.value) return 0
  let step = 1
  if (data.value.ocr?.configured || data.value.wechat?.configured) step = 2
  if (data.value.subscribeTemplates?.configured && wechatTokenOk.value) step = 3
  if (data.value.ocr?.configured && data.value.subscribeTemplates?.configured && wechatTokenOk.value) step = 4
  return step
})

const cards = computed(() => {
  if (!data.value) return []
  const d = data.value
  return [
    {
      key: 'ocr',
      icon: '🔍',
      title: '阿里云 OCR',
      ok: d.ocr?.configured,
      desc: d.ocr?.hint,
      lines: [
        `模式：${d.ocr?.mode || '-'}`,
        `AccessKey：${d.ocr?.accessKeyId || '未配置'}`,
        `端点：${d.ocr?.endpoint || '-'}`
      ]
    },
    {
      key: 'wechat',
      icon: '💬',
      title: '微信开放平台',
      ok: d.wechat?.configured && wechatTokenOk.value,
      desc: d.wechat?.hint,
      lines: [
        `AppID：${d.wechat?.appId || '-'}`,
        `Secret：${d.wechat?.secretConfigured ? '已配置' : '未配置'}`,
        `Token：${wechatTokenMessage.value}`
      ]
    },
    {
      key: 'contentSecurity',
      icon: '🛡️',
      title: '阿里云内容安全',
      ok: d.contentSecurity?.configured,
      desc: d.contentSecurity?.hint,
      lines: [
        `模式：${d.contentSecurity?.mode || '-'}`,
        `端点：${d.contentSecurity?.endpoint || '-'}`,
        `区域：${d.contentSecurity?.region || '-'}`
      ]
    },
    {
      key: 'subscribe',
      icon: '🔔',
      title: '订阅消息',
      ok: d.subscribeTemplates?.configured || d.subscribeTemplates?.financeConfigured,
      desc: d.subscribeTemplates?.hint,
      lines: [
        `进件审核：${maskId(d.subscribeTemplates?.intakeAudit)}`,
        `进件放款：${maskId(d.subscribeTemplates?.intakeDisburse)}`,
        `融圈审核：${maskId(d.subscribeTemplates?.financeReview)}`
      ]
    }
  ]
})

function maskId(id) {
  if (!id) return '未配置'
  if (id.length <= 12) return id
  return `${id.slice(0, 6)}...${id.slice(-4)}`
}

function openDoc() {
  alert('配置说明见项目 deploy/aliyun-ocr-setup.md 与根目录 .env.example')
}

async function load() {
  loading.value = true
  try {
    data.value = await getIntegrations()
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.status-card {
  margin-bottom: 16px;
  min-height: 220px;
}

.status-card.ok {
  border-top: 3px solid #52c41a;
}

.status-card.warn {
  border-top: 3px solid #faad14;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-icon {
  font-size: 28px;
}

.status-card h3 {
  margin: 0 0 8px;
  color: var(--brand-primary);
}

.card-desc {
  font-size: 13px;
  color: var(--brand-muted);
  margin: 0 0 12px;
  line-height: 1.5;
}

.detail-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  color: #555;
  line-height: 1.8;
}

.checklist .section-title {
  margin-bottom: 20px;
}

.mt-16 {
  margin-top: 16px;
}
</style>
