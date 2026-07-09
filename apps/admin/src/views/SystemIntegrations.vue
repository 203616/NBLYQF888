<template>
  <div class="integrations-page">
    <div class="page-header">
      <h2>集成联调</h2>
      <p>阿里云 OCR、微信订阅消息、DeepSeek 等第三方服务的密钥与模板配置</p>
    </div>

    <div class="toolbar page-card">
      <el-button type="primary" :loading="loading" @click="loadData">重新检测</el-button>
      <el-button type="success" :loading="saving" @click="saveConfig">保存配置</el-button>
      <el-button :loading="testingDeepSeek" @click="testDeepSeek">🤖 测试 DeepSeek 连接</el-button>
      <el-button @click="loadFromEnv">从 .env 同步</el-button>
    </div>

    <el-row :gutter="16">
      <el-col :xs="24" :md="12" v-for="group in formGroups" :key="group.key">
        <div class="page-card config-card">
          <div class="card-head">
            <span class="card-icon">{{ group.icon }}</span>
            <el-tag :type="group.ok ? 'success' : 'warning'" size="small">{{ group.ok ? '已配置' : '待配置' }}</el-tag>
          </div>
          <h3>{{ group.title }}</h3>
          <p class="card-desc">{{ group.desc }}</p>
          <el-form label-position="top" size="small">
            <el-form-item v-for="field in group.fields" :key="field.key" :label="field.label">
              <el-input v-model="form[field.key]" :type="field.type || 'text'" :placeholder="field.placeholder || ''" show-password-on-focus clearable />
              <div v-if="field.hint" class="field-hint">{{ field.hint }}</div>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" v-if="statusData">
      <el-col :span="24">
        <div class="page-card">
          <h3 class="section-title">联调状态检查</h3>
          <el-table :data="checkRows" stripe size="small">
            <el-table-column prop="name" label="检测项" width="160" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.ok ? 'success' : 'danger'" size="small">{{ row.ok ? '正常' : '异常' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="detail" label="详情" min-width="300" />
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getIntegrations } from '../api/resources'
import request from '../api/request'

const loading = ref(false)
const saving = ref(false)
const testingDeepSeek = ref(false)
const statusData = ref(null)
const form = ref({})

// 表单字段组定义
const formGroups = computed(() => [
  {
    key: 'aliyun-ocr',
    icon: '🔍',
    title: '阿里云 OCR',
    desc: '用于进件文档图片的文字识别',
    ok: !!form.value.integration_aliyun_key_id,
    fields: [
      { key: 'integration_aliyun_key_id', label: 'AccessKey ID', placeholder: '例: LTAI5t...' },
      { key: 'integration_aliyun_key_secret', label: 'AccessKey Secret', type: 'password', placeholder: '输入 Secret' },
      { key: 'integration_ocr_endpoint', label: 'OCR 端点', placeholder: 'ocr-api.cn-hangzhou.aliyuncs.com', hint: '默认即可' }
    ]
  },
  {
    key: 'wechat',
    icon: '💬',
    title: '微信开放平台',
    desc: '用于获取 access_token 和发送订阅消息',
    ok: !!form.value.integration_wechat_appid && !!form.value.integration_wechat_secret,
    fields: [
      { key: 'integration_wechat_appid', label: 'AppID', placeholder: 'wx...' },
      { key: 'integration_wechat_secret', label: 'Secret', type: 'password', placeholder: '输入 Secret' }
    ]
  },
  {
    key: 'subscribe',
    icon: '🔔',
    title: '订阅消息模板',
    desc: '微信公众平台 → 功能 → 订阅消息 中申请',
    ok: !!form.value.integration_template_intake_audit,
    fields: [
      { key: 'integration_template_intake_audit', label: '进件审核通知', placeholder: '模板 ID' },
      { key: 'integration_template_intake_disburse', label: '进件放款通知', placeholder: '模板 ID' },
      { key: 'integration_template_finance_review', label: '融圈审核结果', placeholder: '模板 ID', hint: '选填' }
    ]
  },
  {
    key: 'deepseek',
    icon: '🤖',
    title: 'DeepSeek AI',
    desc: '用于智能客服和内容分析',
    ok: !!form.value.integration_deepseek_key,
    fields: [
      { key: 'integration_deepseek_key', label: 'API Key', type: 'password', placeholder: 'sk-...' },
      { key: 'integration_deepseek_model', label: '模型', placeholder: 'deepseek-chat', hint: '默认 deepseek-chat，可选 deepseek-reasoner' }
    ]
  },
  {
    key: 'cdn',
    icon: '📦',
    title: 'CDN 配置',
    desc: '小程序图片/静态资源 CDN 加速',
    ok: !!form.value.integration_cdn_base_url,
    fields: [
      { key: 'integration_cdn_base_url', label: 'CDN 基础 URL', placeholder: 'https://cdn.example.com', hint: '结尾不要 /' }
    ]
  }
])

// 状态检测表格
const checkRows = computed(() => {
  if (!statusData.value) return []
  const d = statusData.value
  return [
    { name: '阿里云 OCR', ok: d.ocr?.configured, detail: d.ocr?.configured ? `模式: ${d.ocr.mode}` : (d.ocr?.hint || '未配置') },
    { name: '微信 access_token', ok: d.wechat?.configured && d.wechatToken?.ok, detail: d.wechatToken?.message || '未配置' },
    { name: '进件订阅模板', ok: d.subscribeTemplates?.configured, detail: d.subscribeTemplates?.configured ? '已配置' : '请配置模板 ID' },
    { name: '融圈订阅模板', ok: d.subscribeTemplates?.financeConfigured, detail: d.subscribeTemplates?.financeConfigured ? '已配置' : '选填' },
    { name: 'DeepSeek', ok: d.deepseek?.configured, detail: d.deepseek?.configured ? `模型: ${d.deepseek.model} (来源: ${d.deepseek.keySource === 'database' ? '数据库配置' : d.deepseek.keySource === 'env' ? '环境变量' : '无'})` : '未配置' },
    { name: '内容安全', ok: d.contentSecurity?.configured, detail: d.contentSecurity?.configured ? '已配置' : (d.contentSecurity?.hint || 'Mock 模式') }
  ]
})

async function loadData() {
  loading.value = true
  try {
    // 加载状态
    statusData.value = await getIntegrations()
    // 加载已保存的配置
    const savedConfig = await request.get('/admin/integrations/config')
    if (savedConfig && typeof savedConfig === 'object') {
      Object.assign(form.value, savedConfig)
    }
  } catch (e) {
    ElMessage.warning('加载集成信息失败: ' + e.message)
  } finally {
    loading.value = false
  }
}

async function saveConfig() {
  saving.value = true
  try {
    const payload = { ...form.value }
    // 只发允许的键
    const allowed = [
      'integration_aliyun_key_id', 'integration_aliyun_key_secret', 'integration_wechat_appid',
      'integration_wechat_secret', 'integration_template_intake_audit', 'integration_template_intake_disburse',
      'integration_template_finance_review', 'integration_deepseek_key', 'integration_deepseek_model',
      'integration_cdn_base_url', 'integration_ocr_endpoint'
    ]
    const clean = {}
    for (const key of allowed) {
      if (payload[key] !== undefined) clean[key] = payload[key]
    }
    await request.post('/admin/integrations/save', clean)
    ElMessage.success('集成配置已保存到数据库')
    // 重新检测状态
    statusData.value = await getIntegrations()
  } catch (e) {
    ElMessage.error('保存失败: ' + e.message)
  } finally {
    saving.value = false
  }
}

async function testDeepSeek() {
  testingDeepSeek.value = true
  try {
    const res = await request.get('/admin/ai/test')
    if (res.ok) {
      ElMessage.success(`DeepSeek 连接成功！模型: ${res.model}, 用时: ${res.usage?.total_tokens || 'N/A'} tokens`)
    } else {
      ElMessage.warning(`DeepSeek 连接失败: ${res.message}`)
    }
  } catch (e) {
    ElMessage.error('测试请求失败: ' + e.message)
  } finally {
    testingDeepSeek.value = false
  }
}

function loadFromEnv() {
  // 从 .env 环境变量预填充（仅作提示，实际值已在 statusData 中）
  ElMessage.info('当前显示的是已保存到数据库的配置。实际运行时还会读取 .env 环境变量。')
}

onMounted(loadData)
</script>

<style scoped>
.toolbar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.config-card { margin-bottom: 16px; min-height: 200px; }
.config-card.ok { border-top: 3px solid #52c41a; }
.config-card.warn { border-top: 3px solid #faad14; }
.card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.card-icon { font-size: 28px; }
.config-card h3 { margin: 0 0 8px; color: var(--brand-primary); }
.card-desc { font-size: 13px; color: var(--brand-muted); margin: 0 0 16px; line-height: 1.5; }
.field-hint { font-size: 12px; color: #999; margin-top: 2px; }
.section-title { margin-bottom: 16px; }
</style>
