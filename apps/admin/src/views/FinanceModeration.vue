<template>
  <div class="moderation-page">
    <div class="page-header">
      <h2>融圈审核规则</h2>
      <p>敏感词、自动通过与阿里云内容安全（文本 ScanText / 图片 ImageSyncScan）</p>
    </div>

    <div class="toolbar page-card">
      <el-button type="primary" :loading="loading" @click="load">重新加载</el-button>
      <el-button type="success" :loading="saving" @click="save">保存规则</el-button>
      <router-link to="/social/finance-posts" class="link-btn">前往动态审核 →</router-link>
    </div>

    <el-row :gutter="16">
      <el-col :xs="24" :md="14">
        <div class="page-card">
          <h3 class="section-title">基础规则</h3>
          <el-form label-width="160px">
            <el-form-item label="启用自动审核">
              <el-switch v-model="form.enabled" />
            </el-form-item>
            <el-form-item label="纯文字自动通过">
              <el-switch v-model="form.autoApproveTextOnly" />
            </el-form-item>
            <el-form-item label="纯文字字数上限">
              <el-input-number v-model="form.maxTextLengthForAutoApprove" :min="20" :max="2000" />
            </el-form-item>
            <el-form-item label="含图片转人工">
              <el-switch v-model="form.reviewPostsWithImages" />
            </el-form-item>
            <el-form-item label="敏感词命中动作">
              <el-select v-model="form.blockedKeywordAction" style="width: 160px">
                <el-option label="自动驳回" value="reject" />
                <el-option label="转人工" value="pending" />
              </el-select>
            </el-form-item>
            <el-form-item label="敏感词列表">
              <el-select
                v-model="form.blockedKeywords"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="输入后回车添加"
                style="width: 100%"
              />
            </el-form-item>
          </el-form>

          <h3 class="section-title">阿里云内容安全</h3>
          <el-form label-width="160px">
            <el-form-item label="启用云检测">
              <el-switch v-model="form.useAliyunContentSecurity" />
            </el-form-item>
            <el-form-item label="文本 block 动作">
              <el-select v-model="form.aliyunTextBlockAction" style="width: 160px">
                <el-option label="驳回" value="reject" />
                <el-option label="转人工" value="pending" />
              </el-select>
            </el-form-item>
            <el-form-item label="文本 review 动作">
              <el-select v-model="form.aliyunTextReviewAction" style="width: 160px">
                <el-option label="转人工" value="pending" />
                <el-option label="驳回" value="reject" />
              </el-select>
            </el-form-item>
            <el-form-item label="图片 block 动作">
              <el-select v-model="form.aliyunImageBlockAction" style="width: 160px">
                <el-option label="驳回" value="reject" />
                <el-option label="转人工" value="pending" />
              </el-select>
            </el-form-item>
            <el-form-item label="图片 review 动作">
              <el-select v-model="form.aliyunImageReviewAction" style="width: 160px">
                <el-option label="转人工" value="pending" />
                <el-option label="驳回" value="reject" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </el-col>

      <el-col :xs="24" :md="10">
        <div class="page-card">
          <h3 class="section-title">云检测状态</h3>
          <el-descriptions :column="1" border size="small" v-if="contentSecurity">
            <el-descriptions-item label="模式">{{ contentSecurity.mode }}</el-descriptions-item>
            <el-descriptions-item label="端点">{{ contentSecurity.endpoint }}</el-descriptions-item>
            <el-descriptions-item label="区域">{{ contentSecurity.region }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="contentSecurity.configured ? 'success' : 'warning'" size="small">
                {{ contentSecurity.configured ? '已配置' : 'Mock 跳过' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
          <p class="hint">{{ contentSecurity?.hint || '-' }}</p>
          <el-alert
            class="mt-12"
            type="info"
            :closable="false"
            show-icon
            title="配置文件"
            description="规则保存至 deploy/finance-circle-moderation.json；密钥见 .env 中 ALIYUN_ACCESS_KEY_* 与 ALIYUN_GREEN_*"
          />
        </div>

        <div class="page-card">
          <h3 class="section-title">微信审核通知</h3>
          <p class="hint">审核通过/驳回后向用户发送订阅消息（需配置 WECHAT_TEMPLATE_FINANCE_REVIEW）</p>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="模板变量">thing1 内容摘要 · phrase2 结果 · thing3 说明 · time4 时间</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getFinanceModerationRules, saveFinanceModerationRules } from '../api/resources'

const loading = ref(false)
const saving = ref(false)
const contentSecurity = ref(null)
const form = ref({
  enabled: true,
  autoApproveTextOnly: true,
  maxTextLengthForAutoApprove: 200,
  reviewPostsWithImages: true,
  blockedKeywords: [],
  blockedKeywordAction: 'reject',
  useAliyunContentSecurity: true,
  aliyunTextBlockAction: 'reject',
  aliyunTextReviewAction: 'pending',
  aliyunImageBlockAction: 'reject',
  aliyunImageReviewAction: 'pending'
})

async function load() {
  loading.value = true
  try {
    const data = await getFinanceModerationRules()
    form.value = { ...form.value, ...(data.rules || data) }
    contentSecurity.value = data.contentSecurity || null
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    await saveFinanceModerationRules(form.value)
    ElMessage.success('审核规则已保存')
    await load()
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.link-btn {
  color: var(--brand-primary);
  text-decoration: none;
  font-size: 14px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 16px;
}

.section-title:not(:first-child) {
  margin-top: 24px;
}

.hint {
  margin-top: 12px;
  font-size: 13px;
  color: var(--brand-muted);
}

.mt-12 {
  margin-top: 12px;
}
</style>
