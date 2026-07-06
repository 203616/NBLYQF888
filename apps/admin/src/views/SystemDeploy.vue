<template>

  <div class="deploy-page">

    <div class="page-header">

      <h2>发布部署</h2>

      <p>小程序体验版上传、CDN/OSS 与微信域名配置（检测 + 一键操作）</p>

    </div>



    <div class="toolbar page-card">

      <el-button type="primary" :loading="loading" @click="load">重新检测</el-button>

      <el-button @click="copyCmd('pnpm verify:production')">复制校验命令</el-button>

    </div>



    <div class="page-card actions-panel" v-if="data?.actions?.length">

      <h3 class="section-title">一键操作</h3>

      <p class="hint">操作通过 SSE 实时输出日志（长任务如 OSS / 小程序上传）</p>

      <div class="action-grid">

        <el-button

          v-for="act in data.actions"

          :key="act.id"

          :type="actionBtnType(act)"

          :disabled="!act.available || actionLoading === act.id"

          :loading="actionLoading === act.id"

          @click="runAction(act)"

        >

          {{ act.label }}

        </el-button>

      </div>

      <el-form v-if="showMpForm" inline class="mp-form">

        <el-form-item label="版本号">

          <el-input v-model="mpVersion" placeholder="1.0.0" style="width: 120px" />

        </el-form-item>

        <el-form-item label="说明">

          <el-input v-model="mpDesc" placeholder="体验版" style="width: 220px" />

        </el-form-item>

        <el-form-item>

          <el-button type="danger" :loading="actionLoading === 'mp-upload'" @click="confirmMpUpload">

            确认上传小程序

          </el-button>

        </el-form-item>

      </el-form>

      <el-alert

        v-if="actionLog"

        class="mt-12"

        :title="actionLog.ok ? '操作成功' : '操作失败'"

        :type="actionLog.ok ? 'success' : 'error'"

        :closable="true"

        @close="actionLog = null"

      />

      <pre v-if="actionLog?.output" class="action-log">{{ actionLog.output }}</pre>

      <el-progress
        v-if="uploadProgress.active"
        class="mt-12 upload-progress"
        :percentage="uploadProgress.percent"
        :format="() => `${uploadProgress.current}/${uploadProgress.total}`"
        :status="uploadProgress.percent >= 100 ? 'success' : undefined"
      />

    </div>



    <div class="page-card qrcode-panel" v-if="data">

      <h3 class="section-title">体验版预览码</h3>

      <p class="hint">生成后微信扫码体验（需配置上传密钥；文件位于 deploy/preview-qrcode.jpg）</p>

      <div class="qrcode-row">

        <el-button type="primary" :loading="actionLoading === 'mp-preview'" @click="generatePreview">

          生成预览二维码

        </el-button>

        <el-button v-if="qrcodeBlobUrl" @click="refreshQrcode">刷新图片</el-button>

      </div>

      <img v-if="qrcodeBlobUrl" class="qrcode-img" :src="qrcodeBlobUrl" alt="体验版预览码" />

      <p v-else-if="data.miniprogram?.previewQrcodeExists" class="hint mt-12">已有预览码文件，点击刷新图片加载</p>

    </div>



    <div class="page-card" v-if="deployHistory.length">

      <h3 class="section-title">部署通知记录</h3>

      <el-timeline>

        <el-timeline-item

          v-for="item in deployHistory"

          :key="item.id"

          :timestamp="item.createdAt"

          :type="item.title.includes('成功') ? 'success' : 'danger'"

        >

          <strong>{{ item.title }}</strong>

          <p class="history-desc">{{ item.content }}</p>

        </el-timeline-item>

      </el-timeline>

    </div>



    <el-row :gutter="16" v-if="data">

      <el-col :xs="24" :md="8" v-for="card in cards" :key="card.key">

        <div class="page-card status-card" :class="card.ok ? 'ok' : 'warn'">

          <div class="card-head">

            <span class="card-icon">{{ card.icon }}</span>

            <el-tag :type="card.ok ? 'success' : 'warning'" size="small">{{ card.ok ? '就绪' : '待处理' }}</el-tag>

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

      <h3 class="section-title">发布步骤</h3>

      <el-steps :active="activeStep" finish-status="success" align-center>

        <el-step

          v-for="step in data.steps"

          :key="step.id"

          :title="step.label"

          :description="step.cmd"

        />

      </el-steps>

    </div>



    <div class="page-card" v-if="data">

      <h3 class="section-title">微信服务器域名</h3>

      <el-descriptions :column="1" border size="small">

        <el-descriptions-item label="request">{{ (data.wechatDomains.request || []).join('、') || '-' }}</el-descriptions-item>

        <el-descriptions-item label="upload">{{ (data.wechatDomains.upload || []).join('、') || '-' }}</el-descriptions-item>

        <el-descriptions-item label="download">{{ (data.wechatDomains.download || []).join('、') || '-' }}</el-descriptions-item>

        <el-descriptions-item label="web-view">{{ (data.wechatDomains.webView || []).join('、') || '-' }}</el-descriptions-item>

      </el-descriptions>

      <p class="hint mt-12">{{ data.wechatDomains.mpAdminUrl || '微信公众平台 → 开发 → 开发管理 → 服务器域名' }}</p>

      <p class="hint">GitHub Actions：仓库 Actions → Publish Mini Program（需配置 WECHAT_UPLOAD_PRIVATE_KEY 等 Secrets）</p>

    </div>



    <div class="page-card commands" v-if="data">

      <h3 class="section-title">常用命令</h3>

      <div class="cmd-row" v-for="cmd in data.commands" :key="cmd">

        <code>{{ cmd }}</code>

        <el-button size="small" link type="primary" @click="copyCmd(cmd)">复制</el-button>

      </div>

    </div>

  </div>

</template>



<script setup>

import { computed, onMounted, ref } from 'vue'

import { ElMessageBox } from 'element-plus'

import { getDeployStatus, getDeployHistory, fetchDeployQrcodeBlob, runDeployActionStream } from '../api/resources'



const loading = ref(false)

const data = ref(null)

const actionLoading = ref('')

const actionLog = ref(null)

const showMpForm = ref(false)

const mpVersion = ref('1.0.0')

const mpDesc = ref('管理后台体验版')

const qrcodeBlobUrl = ref('')

const deployHistory = ref([])

const uploadProgress = ref({ active: false, current: 0, total: 0, percent: 0 })



const activeStep = computed(() => {

  if (!data.value?.steps?.length) return 0

  const done = data.value.steps.filter(s => s.done).length

  return Math.min(done, data.value.steps.length - 1)

})



const cards = computed(() => {

  if (!data.value) return []

  const d = data.value

  const staging = d.cdn?.staging || {}

  return [

    {

      key: 'mp',

      icon: '📱',

      title: '小程序上传',

      ok: d.miniprogram?.uploadReady,

      desc: d.miniprogram?.uploadReady ? 'miniprogram-ci 密钥已配置' : '需配置 WECHAT_UPLOAD_PRIVATE_KEY*',

      lines: [

        `AppID：${d.app?.appId || '-'}`,

        `主包：${d.miniprogram?.mainPackageKb != null ? d.miniprogram.mainPackageKb + ' KB' : '-'}`,

        `版本：${d.miniprogram?.version || '-'}`,

        `Robot：#${d.miniprogram?.robot || 1}${d.miniprogram?.autoTrial ? '（体验版自动替换）' : ''}`,

        `命令：${d.miniprogram?.dryRunCmd || 'pnpm upload:mp:dry'}`

      ]

    },

    {

      key: 'cdn',

      icon: '☁️',

      title: 'CDN / OSS',

      ok: d.cdn?.cdnReady && (!d.cdn?.useCdnImages || d.cdn?.oss?.configured),

      desc: d.cdn?.useCdnImages ? '已启用 CDN 图片' : '本地分包图片（默认）',

      lines: [

        `CDN：${d.cdn?.baseUrl || '未启用'}`,

        `Staging：${staging.count || 0} 个文件`,

        `OSS：${d.cdn?.oss?.configured ? d.cdn.oss.bucket : '未配置'}`,

        `同步：${d.api?.configSynced ? '已同步' : '请 pnpm sync:prod'}`

      ]

    },

    {

      key: 'api',

      icon: '🔗',

      title: 'API 与域名',

      ok: d.api?.configSynced && (d.wechatDomains?.download || []).length > 0,

      desc: d.app?.appIdMatch === false ? 'appId 与 project.config 不一致' : '配置一致',

      lines: [

        `API：${d.api?.baseUrl || '-'}`,

        `download 域名：${(d.wechatDomains?.download || []).length} 个`,

        `基础库：${d.app?.libVersion || '-'}`

      ]

    }

  ]

})



function actionBtnType(act) {

  if (act.id === 'mp-upload' || act.id === 'cdn-upload') return 'danger'

  if (act.id.includes('dry-run') || act.id === 'mp-dry-run') return 'default'

  return 'primary'

}



function copyCmd(cmd) {

  navigator.clipboard?.writeText(cmd).then(() => {

    alert('已复制: ' + cmd)

  }).catch(() => alert(cmd))

}



async function refreshQrcode() {

  if (qrcodeBlobUrl.value) URL.revokeObjectURL(qrcodeBlobUrl.value)

  qrcodeBlobUrl.value = (await fetchDeployQrcodeBlob()) || ''

}



async function loadHistory() {

  try {

    deployHistory.value = await getDeployHistory()

  } catch {

    deployHistory.value = []

  }

}



async function generatePreview() {

  await execAction('mp-preview', { desc: '管理后台预览' })

  await refreshQrcode()

}



async function load() {

  loading.value = true

  try {

    data.value = await getDeployStatus()

    if (data.value?.miniprogram?.version) mpVersion.value = data.value.miniprogram.version

    await loadHistory()

    if (data.value?.miniprogram?.previewQrcodeExists) await refreshQrcode()

  } finally {

    loading.value = false

  }

}



async function runAction(act) {

  if (act.id === 'mp-upload') {

    showMpForm.value = true

    return

  }

  if (act.id === 'cdn-upload') {

    try {

      await ElMessageBox.confirm('将上传 deploy/cdn-staging/ 至 OSS，确认继续？', 'OSS 上传', { type: 'warning' })

    } catch {

      return

    }

  }

  await execAction(act.id)

}



async function confirmMpUpload() {

  try {

    await ElMessageBox.confirm(`上传版本 ${mpVersion.value}：${mpDesc.value}`, '小程序上传', { type: 'warning' })

  } catch {

    return

  }

  await execAction('mp-upload', { version: mpVersion.value, desc: mpDesc.value })

  showMpForm.value = false

}



async function execAction(actionId, payload = {}) {

  actionLoading.value = actionId

  actionLog.value = { ok: true, output: '' }

  const trackProgress = actionId === 'cdn-upload' || actionId === 'cdn-dry-run'

  if (trackProgress) uploadProgress.value = { active: true, current: 0, total: 0, percent: 0 }

  try {

    await runDeployActionStream(actionId, payload, evt => {

      if (evt.type === 'start') actionLog.value.output += `>> ${evt.label}\n`

      if (evt.type === 'log') actionLog.value.output += evt.message

      if (evt.type === 'progress' && trackProgress) {

        uploadProgress.value = {

          active: true,

          current: evt.current,

          total: evt.total,

          percent: evt.percent

        }

      }

      if (evt.type === 'done') {

        actionLog.value.ok = evt.ok

        if (evt.message) actionLog.value.output += `\n${evt.message}`

      }

    })

    await load()

  } catch (e) {

    actionLog.value = {

      ok: false,

      output: (actionLog.value?.output || '') + (e?.data?.output ? `\n${e.data.output}` : `\n${e.message}`)

    }

  } finally {

    actionLoading.value = ''

    if (trackProgress) {

      setTimeout(() => {

        uploadProgress.value = { ...uploadProgress.value, active: false }

      }, 1500)

    }

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



.actions-panel {

  margin-bottom: 16px;

}



.action-grid {

  display: flex;

  flex-wrap: wrap;

  gap: 10px;

  margin-top: 12px;

}



.mp-form {

  margin-top: 16px;

}



.action-log {

  margin-top: 12px;

  padding: 12px;

  background: #1e1e1e;

  color: #d4d4d4;

  border-radius: 6px;

  font-size: 12px;

  max-height: 320px;

  overflow: auto;

  white-space: pre-wrap;

  word-break: break-all;

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



.card-desc {

  color: #666;

  font-size: 13px;

  margin: 8px 0 12px;

}



.detail-list {

  margin: 0;

  padding-left: 18px;

  font-size: 13px;

  color: #444;

  line-height: 1.8;

}



.section-title {

  margin: 0 0 16px;

  font-size: 16px;

}



.checklist {

  margin-top: 8px;

}



.hint {

  font-size: 13px;

  color: #888;

}



.mt-12 {

  margin-top: 12px;

}



.cmd-row {

  display: flex;

  align-items: center;

  justify-content: space-between;

  padding: 8px 0;

  border-bottom: 1px solid #f0f0f0;

}



.cmd-row code {

  font-size: 13px;

  color: #333;

}

.qrcode-panel {

  margin-bottom: 16px;

}

.qrcode-row {

  display: flex;

  gap: 12px;

  margin-bottom: 16px;

}

.qrcode-img {

  width: 220px;

  height: 220px;

  border: 1px solid #eee;

  border-radius: 8px;

  object-fit: contain;

  background: #fff;

}

.history-desc {

  margin: 6px 0 0;

  font-size: 13px;

  color: #666;

  white-space: pre-wrap;

}

</style>


