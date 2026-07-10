<template>
  <div class="integrations-page">
    <div class="page-header">
      <h2>集成联调</h2>
      <p>AI 大模型、阿里云 OCR、微信订阅消息、电子签章、向量数据库等第三方服务的密钥配置与状态检测</p>
    </div>

    <div class="toolbar page-card">
      <el-button type="primary" :loading="loading" @click="loadData">重新检测</el-button>
      <el-button type="success" :loading="saving" @click="saveConfig">保存配置</el-button>
      <el-button :loading="testingAI" @click="testAI('')">🤖 测试默认 AI</el-button>
      <el-button :loading="testingAI" @click="testAI('deepseek')">🔵 测试 DeepSeek</el-button>
      <el-button :loading="testingAI" @click="testAI('qwen')">🟢 测试通义千问</el-button>
      <el-button :loading="testingAI" @click="testAI('anthropic')">🟣 测试 Anthropic</el-button>
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
const testingAI = ref(false)
const statusData = ref(null)
const form = ref({})

async function loadData() {
  loading.value = true
  try {
    const res = await getIntegrations()
    statusData.value = res
  } catch (e) {
    ElMessage.error('加载集成状态失败')
  }
  loading.value = false
}

async function saveConfig() {
  saving.value = true
  try {
    const payload = {}
    Object.entries(form.value).forEach(([key, value]) => {
      if (value) payload[key] = value
    })
    await request.post('/admin/integrations/save', payload)
    ElMessage.success('配置已保存')
    await loadData()
  } catch (e) {
    ElMessage.error('保存失败')
  }
  saving.value = false
}

async function testAI(provider) {
  testingAI.value = true
  try {
    const params = provider ? `?provider=${provider}` : ''
    const res = await request.get(`/admin/ai/test${params}`)
    if (res.ok) {
      const label = provider || '默认'
      ElMessage.success(`${label} AI: ${res.message}`)
    } else {
      ElMessage.warning(res.message || '连接异常')
    }
  } catch (e) {
    ElMessage.error('AI 连接测试失败')
  }
  testingAI.value = false
}

function loadFromEnv() {
  form.value = {
    integration_deepseek_key: '',
    integration_deepseek_model: 'deepseek-chat',
    integration_qwen_key: '',
    integration_qwen_model: 'qwen-plus',
    integration_anthropic_key: '',
    integration_anthropic_model: 'claude-3-haiku',
    integration_esig_key: '205024966',
    integration_esig_secret: 'zSugFhekoScWwyfi1tIAb3e0N5y3ElWC',
    integration_esig_code: 'f9b6dd8e803e479fafe7ca9369e8c13a',
    integration_zilliz_token: '84db2a86a3da0e3eddb4d7ffce167fd8989f6dd585fbf25967eec7ea16197c48d9bfdfa5947e35973fb84c6438b792ab0e0e7e8c'
  }
  ElMessage.success('已从 .env 同步默认值')
}

const formGroups = computed(() => {
  const s = statusData.value
  return [
    {
      key: 'ai',
      icon: '🤖',
      title: 'AI 大模型',
      desc: '配置智能客服与内容分析使用的 AI 模型',
      ok: s?.ai?.deepseek?.configured || s?.ai?.providers?.deepseek?.configured,
      fields: [
        { key: 'integration_deepseek_key', label: 'DeepSeek API Key', type: 'password', placeholder: 'sk-...', hint: !!(s?.ai?.providers?.deepseek?.configured) ? `已配置 (${s?.ai?.providers?.deepseek?.model})` : '' },
        { key: 'integration_deepseek_model', label: 'DeepSeek 模型', placeholder: 'deepseek-chat', hint: '默认模型: deepseek-chat' },
        { key: 'integration_qwen_key', label: '通义千问 API Key', type: 'password', placeholder: 'sk-...', hint: !!(s?.ai?.providers?.qwen?.configured) ? '已配置' : 'DashScope OpenAI 兼容模式' },
        { key: 'integration_qwen_model', label: '通义千问模型', placeholder: 'qwen-plus', hint: 'qwen-plus / qwen-max 等' },
        { key: 'integration_anthropic_key', label: 'Anthropic API Key', type: 'password', placeholder: 'sk-...', hint: !!(s?.ai?.providers?.anthropic?.configured) ? '已配置(通义千问 Anthropic 兼容)' : '' },
        { key: 'integration_anthropic_model', label: 'Anthropic 模型', placeholder: 'claude-3-haiku', hint: 'claude-3-haiku 等' }
      ]
    },
    {
      key: 'esig',
      icon: '✍️',
      title: '电子签章',
      desc: '在线合同签署 API（阿里云市场）',
      ok: s?.esig?.configured,
      fields: [
        { key: 'integration_esig_key', label: 'AppKey', type: 'password', placeholder: 'AppKey', hint: s?.esig?.appKeyConfigured ? '已配置' : '' },
        { key: 'integration_esig_secret', label: 'AppSecret', type: 'password', placeholder: 'AppSecret', hint: s?.esig?.appSecretConfigured ? '已配置' : '' },
        { key: 'integration_esig_code', label: 'AppCode', type: 'password', placeholder: 'AppCode', hint: s?.esig?.appCodeConfigured ? '已配置' : '' }
      ]
    },
    {
      key: 'zilliz',
      icon: '🗄️',
      title: '向量数据库（Zilliz Cloud）',
      desc: 'Milvus 向量数据库，用于智能搜索与知识库',
      ok: s?.zilliz?.configured,
      fields: [
        { key: 'integration_zilliz_cluster_id', label: '集群 ID', placeholder: 'in03-...', hint: s?.zilliz?.clusterId ? `已配置 (${s.zilliz.clusterId})` : '' },
        { key: 'integration_zilliz_endpoint', label: 'Endpoint', placeholder: 'https://...', hint: s?.zilliz?.endpointConfigured ? '已配置' : '' },
        { key: 'integration_zilliz_token', label: 'Token', type: 'password', placeholder: '...', hint: s?.zilliz?.tokenConfigured ? '已配置' : '' }
      ]
    },
    {
      key: 'ocr',
      icon: '📄',
      title: '阿里云 OCR',
      desc: '行驶证、身份证等识别',
      ok: s?.ocr?.configured,
      fields: [
        { key: 'integration_aliyun_key_id', label: 'AccessKey ID', type: 'password', placeholder: 'LTAI...', hint: s?.ocr?.accessKeyId ? `已配置 (${s.ocr.accessKeyId})` : '' },
        { key: 'integration_aliyun_key_secret', label: 'AccessKey Secret', type: 'password', placeholder: '...' },
        { key: 'integration_aliyun_ocr_endpoint', label: 'Endpoint', placeholder: 'ocr-api.cn-hangzhou.aliyuncs.com', hint: '' }
      ]
    },
    {
      key: 'wechat',
      icon: '💬',
      title: '微信小程序',
      desc: '订阅消息、模板通知',
      ok: s?.wechat?.configured,
      fields: [
        { key: 'integration_wechat_appid', label: 'AppID', placeholder: 'wxf49b1aeb1d62f227', hint: s?.wechat?.appId || '' },
        { key: 'integration_wechat_secret', label: 'AppSecret', type: 'password', placeholder: '...', hint: s?.wechat?.secretConfigured ? '已配置' : '' },
        { key: 'integration_template_intake_audit', label: '进件审核通知模板ID', placeholder: '模板 ID' },
        { key: 'integration_template_intake_disburse', label: '进件放款通知模板ID', placeholder: '模板 ID' },
        { key: 'integration_template_finance_review', label: '融圈审核通知模板ID', placeholder: '模板 ID' }
      ]
    }
  ]
})

const checkRows = computed(() => {
  const s = statusData.value
  if (!s) return []
  const rows = []
  rows.push({ name: 'DeepSeek AI', ok: s.ai?.deepseek?.configured || s.ai?.providers?.deepseek?.configured, detail: s.ai?.deepseek?.configured ? `模型: ${s.ai.deepseek.model}` : '未配置' })
  rows.push({ name: '通义千问 AI', ok: s.ai?.providers?.qwen?.configured, detail: s.ai?.providers?.qwen?.configured ? `已配置 (${s.ai.providers.qwen.model})` : '未配置' })
  rows.push({ name: 'Anthropic AI', ok: s.ai?.providers?.anthropic?.configured, detail: s.ai?.providers?.anthropic?.configured ? '已配置' : '未配置' })
  rows.push({ name: '电子签章', ok: s.esig?.configured, detail: s.esig?.configured ? 'AppKey/Secret/AppCode 已配置' : '待配置' })
  rows.push({ name: 'Zilliz 向量库', ok: s.zilliz?.configured, detail: s.zilliz?.configured ? '已配置' : '待配置' })
  rows.push({ name: '阿里云 OCR', ok: s.ocr?.configured, detail: s.ocr?.configured ? `已配置 (${s.ocr.mode})` : '待配置' })
  rows.push({ name: '微信订阅消息', ok: s.subscribeTemplates?.configured, detail: s.subscribeTemplates?.configured ? '进件模板已配置' : '待配置' })
  rows.push({ name: '内容安全', ok: s.contentSecurity?.configured, detail: s.contentSecurity?.configured ? '已启用' : s.contentSecurity?.hint || '未配置' })
  rows.push({ name: 'API 公网地址', ok: !!s.wechat?.publicBaseUrl, detail: s.wechat?.publicBaseUrl || 'PUBLIC_BASE_URL 未配置' })
  return rows
})

onMounted(loadData)
</script>

<style scoped>
.integrations-page { max-width: 1400px; }
.config-card { margin-bottom: 16px; min-height: 200px; }
.card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.card-icon { font-size: 28px; }
.card-desc { font-size: 13px; color: #999; margin-bottom: 16px; }
.section-title { margin-bottom: 16px; font-size: 16px; }
.field-hint { font-size: 12px; color: #999; margin-top: 4px; }
.toolbar { margin-bottom: 16px; display: flex; flex-wrap: wrap; gap: 8px; }
</style>
