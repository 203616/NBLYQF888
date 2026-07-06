<template>
  <div v-if="detail" class="intake-detail">
    <div class="detail-top">
      <el-button link class="back-btn" @click="goBack">← 返回列表</el-button>
    </div>

    <div class="page-card header-card">
      <div class="header-main">
        <div class="header-icon">📋</div>
        <div>
          <h2>{{ detail.application_no }}</h2>
          <p>{{ detail.product_name }} · {{ typeLabel(detail.product_type) }}</p>
          <div class="header-tags">
            <el-tag :type="statusType(detail.status)" size="large">{{ statusLabel(detail.status) }}</el-tag>
            <el-tag effect="plain" size="large">进度 {{ detail.progress || 0 }}%</el-tag>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="exportPdf">导出 PDF</el-button>
        <el-button plain @click="load">刷新</el-button>
      </div>
    </div>

    <div class="stat-chips">
      <div class="chip" v-for="item in statChips" :key="item.label">
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
      </div>
    </div>

    <el-row :gutter="16">
      <el-col :span="16">
        <div class="page-card block-card" v-for="block in sectionBlocks" :key="block.key" v-show="block.items.some(i => i.value)">
          <h3 class="section-title">{{ block.title }}</h3>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item v-for="item in block.items" :key="item.label" :label="item.label">
              {{ item.value || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="page-card block-card" v-if="!hasSectionData">
          <el-empty description="暂无填报字段，进件可能为草稿或仅本地保存" />
        </div>

        <div class="page-card block-card">
          <h3 class="section-title">上传资料</h3>
          <el-table :data="detail.documents || []" stripe size="small" :empty-text="'暂无上传文件'">
            <el-table-column prop="doc_key" label="类型" width="140">
              <template #default="{ row }">{{ docLabel(row.doc_key) }}</template>
            </el-table-column>
            <el-table-column prop="file_name" label="文件名" min-width="160" show-overflow-tooltip />
            <el-table-column label="预览" width="120">
              <template #default="{ row }">
                <el-button v-if="isImageFile(row.file_url || row.file_name)" link type="primary" @click="previewImage(row)">图片预览</el-button>
                <el-button v-else link type="primary" @click="openFile(row.file_url)">打开</el-button>
              </template>
            </el-table-column>
            <el-table-column label="OCR" width="120">
              <template #default="{ row }">
                <el-button v-if="row.ocr_payload" link type="success" @click="showOcr(row)">查看识别</el-button>
                <span v-else class="muted">未识别</span>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="上传时间" min-width="150" />
          </el-table>
        </div>
      </el-col>

      <el-col :span="8">
        <div class="page-card side-card">
          <h3 class="section-title">流程推进</h3>
          <el-alert type="info" :closable="false" show-icon class="readonly-alert"
            title="机构专员可在此推进流程，小程序端将自动同步" />
          <div class="workflow-actions">
            <el-button
              v-for="action in workflowActions"
              :key="action.key"
              :type="action.type"
              size="small"
              :disabled="action.disabled"
              :loading="workflowLoading === action.key"
              @click="runWorkflow(action)"
            >{{ action.label }}</el-button>
          </div>
          <div class="workflow-steps">
            <div v-for="(item, idx) in workflowStages" :key="item.key" class="wf-step" :class="'wf-' + item.tagType">
              <div class="wf-index">{{ idx + 1 }}</div>
              <div class="wf-body">
                <div class="wf-head">
                  <strong>{{ item.label }}</strong>
                  <el-tag :type="item.tagType" size="small">{{ item.statusText }}</el-tag>
                </div>
                <p v-if="item.time" class="wf-time">{{ item.time }}</p>
                <p v-if="item.remark" class="wf-remark">{{ item.remark }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="page-card side-card">
          <h3 class="section-title">管理信息（只读）</h3>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="状态">{{ statusLabel(detail.status) }}</el-descriptions-item>
            <el-descriptions-item label="负责人">{{ detail.assignee || '-' }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{ detail.admin_note || '-' }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ detail.submitted_at || '-' }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detail.updated_at || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="page-card side-card">
          <h3 class="section-title">流程日志</h3>
          <el-timeline v-if="detail.events?.length">
            <el-timeline-item v-for="ev in detail.events" :key="ev.id" :timestamp="ev.created_at" placement="top">
              <strong>[{{ stageLabel(ev.stage) }}]</strong> {{ ev.remark || ev.status }}
              <p class="ev-operator">{{ ev.operator }}</p>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无流程日志" :image-size="60" />
        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="ocrVisible" title="OCR 识别结果" width="520px">
      <pre class="ocr-json">{{ ocrPreview }}</pre>
    </el-dialog>

    <el-dialog v-model="imagePreviewVisible" title="材料图片预览" width="760px" class="image-preview-dialog">
      <p class="preview-name">{{ previewImageName }}</p>
      <el-image :src="previewImageUrl" fit="contain" class="preview-image" :preview-src-list="[previewImageUrl]" preview-teleported />
    </el-dialog>
  </div>
  <div v-else class="loading-wrap" v-loading="true" />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getIntakeDetail, exportIntakePdf, updateIntakeWorkflow } from '../api/intake'

const route = useRoute()
const router = useRouter()
const detail = ref(null)
const ocrVisible = ref(false)
const ocrPreview = ref('')
const imagePreviewVisible = ref(false)
const previewImageUrl = ref('')
const previewImageName = ref('')
const workflowLoading = ref('')

const stageMeta = {
  audit: { label: '审核', done: '已通过', processing: '审核中', pending: '待审核' },
  disburse: { label: '放款', done: '已放款', processing: '放款中', pending: '待放款' },
  archive: { label: '归档', done: '已归档', processing: '归档中', pending: '待归档' },
  collection: { label: '还款提醒', active: '已启用', done: '已完成', pending: '未启用' },
  sync: { label: '同步', done: '已完成', processing: '进行中', pending: '待处理' }
}

const typeMap = {
  newCar: '新车', usedCar: '二手车', mortgage: '车抵', business: '经营贷',
  personal: '个人贷', warranty: '延保', property: '抵押贷', lease: '租赁', workflow: '综合'
}

const docKeyMap = {
  idCardFront: '身份证正面', idCardBack: '身份证反面', bankFlow: '银行流水',
  incomeProof: '收入证明', creditAuth: '征信授权', vehicleInvoice: '车辆发票',
  drivingLicense: '驾驶证', other: '其他材料'
}

const labelMap = {
  applyCity: '申请城市', applyChannel: '申请渠道', loanPurpose: '资金用途',
  expectedAmount: '期望额度', expectedTerm: '期望期限', urgency: '紧迫度',
  hasHouse: '是否有房产', hasOtherLoan: '其他贷款', remark: '补充说明',
  realName: '姓名', idCard: '身份证号', gender: '性别', birthDate: '出生日期',
  mobile: '手机', email: '邮箱', maritalStatus: '婚姻状况', education: '学历',
  householdType: '户口性质', address: '地址', residenceYears: '居住年限',
  vehicleType: '车辆类型', brand: '品牌', model: '车型', color: '颜色',
  year: '年份', vin: 'VIN', engineNo: '发动机号', plateNo: '车牌',
  mileage: '里程', purchasePrice: '购置/评估价', invoiceAmount: '发票金额',
  dealerName: '车商', insuranceExpiry: '保险到期',
  downPayment: '首付', loanAmount: '贷款额', loanTerm: '期限',
  repaymentMethod: '还款方式', rateType: '利率类型', monthlyPayment: '期望月供',
  insuranceRequired: '捆绑保险', gpsRequired: '安装GPS', subsidyAmount: '补贴金额',
  employmentType: '就业类型', companyName: '单位', industry: '行业',
  position: '职位', workYears: '工龄', companyScale: '单位规模',
  companyAddress: '单位地址', companyPhone: '单位电话', businessLicense: '信用代码',
  monthlyIncome: '月收入', otherIncome: '其他收入', familyMonthlyExpense: '家庭支出',
  existingLoans: '负债月供', bankFlowMonths: '流水月数', incomeProofType: '收入证明',
  providentFund: '公积金', taxAnnual: '年纳税额',
  emergencyName: '紧急联系人', emergencyPhone: '联系人电话',
  emergencyRelation: '关系', emergencyAddress: '联系人地址',
  secondContactName: '第二联系人', secondContactPhone: '第二联系人电话'
}

const sectionKeys = {
  basic: ['applyCity', 'applyChannel', 'loanPurpose', 'expectedAmount', 'expectedTerm', 'urgency', 'hasHouse', 'hasOtherLoan', 'remark'],
  personal: ['realName', 'idCard', 'gender', 'mobile', 'email', 'maritalStatus', 'education', 'address'],
  vehicle: ['vehicleType', 'brand', 'model', 'year', 'vin', 'mileage', 'purchasePrice', 'dealerName', 'plateNo'],
  finance: ['downPayment', 'loanAmount', 'loanTerm', 'repaymentMethod', 'rateType', 'monthlyPayment'],
  work: ['employmentType', 'companyName', 'industry', 'position', 'workYears', 'businessLicense', 'companyAddress'],
  income: ['monthlyIncome', 'bankFlowMonths', 'incomeProofType', 'existingLoans', 'providentFund', 'taxAnnual'],
  contacts: ['emergencyName', 'emergencyPhone', 'emergencyRelation', 'secondContactName', 'secondContactPhone']
}

function typeLabel(t) { return typeMap[t] || t }
function statusLabel(s) { return { draft: '草稿', auditing: '审核中', approved: '已通过', disbursed: '已放款', archived: '已归档' }[s] || s }
function statusType(s) {
  if (s === 'auditing') return 'warning'
  if (s === 'approved' || s === 'disbursed') return 'success'
  if (s === 'archived') return 'info'
  return ''
}
function stageLabel(s) { return stageMeta[s]?.label || s }
function docLabel(k) { return docKeyMap[k] || k }

function pick(obj = {}, keys = []) {
  return keys.map(key => ({
    label: labelMap[key] || key,
    value: formatValue(obj[key])
  }))
}

function formatValue(v) {
  if (v === true) return '是'
  if (v === false) return '否'
  if (v === null || v === undefined || v === '') return ''
  return String(v)
}

const workflowStages = computed(() => {
  const wf = detail.value?.workflow || {}
  return ['audit', 'disburse', 'archive', 'collection'].map(key => {
    const node = wf[key] || {}
    const meta = stageMeta[key]
    const status = node.status || 'pending'
    const statusText = meta[status] || status
    const tagType = status === 'done' || status === 'active' ? 'success' : status === 'processing' ? 'warning' : 'info'
    return { key, label: meta.label, statusText, tagType, time: node.time, remark: node.remark, status }
  })
})

const workflowActions = computed(() => {
  const wf = detail.value?.workflow || {}
  const audit = wf.audit?.status || 'pending'
  const disburse = wf.disburse?.status || 'locked'
  const archive = wf.archive?.status || 'locked'
  const collection = wf.collection?.status || 'locked'
  return [
    { key: 'audit_done', label: '通过初审', type: 'success', disabled: audit === 'done', stage: 'audit', status: 'done', metaStatus: 'approved', remark: '初审通过，已匹配合作持牌金融机构' },
    { key: 'disburse_proc', label: '开始放款', type: 'warning', disabled: audit !== 'done' || disburse === 'done', stage: 'disburse', status: 'processing', metaStatus: 'approved', remark: '正在准备签约材料与抵押登记（如适用）' },
    { key: 'disburse_done', label: '完成放款', type: 'success', disabled: disburse !== 'processing', stage: 'disburse', status: 'done', metaStatus: 'disbursed', remark: '放款已到账，请查收合同约定账户' },
    { key: 'archive_done', label: '完成归档', type: 'primary', disabled: disburse !== 'done' || archive === 'done', stage: 'archive', status: 'done', metaStatus: 'archived', remark: '电子合同与影像材料已归档存证' },
    { key: 'collection_on', label: '启用还款提醒', type: 'info', disabled: collection === 'active' || collection === 'done', stage: 'collection', status: 'active', metaStatus: null, remark: '还款计划已生成，到期前将短信提醒' }
  ]
})

const sectionBlocks = computed(() => {
  const p = detail.value?.payload || {}
  return Object.entries(sectionKeys).map(([key, keys]) => ({
    key,
    title: { basic: '基本信息', personal: '个人信息', vehicle: '车辆信息', finance: '融资信息', work: '工作/企业信息', income: '收入信息', contacts: '紧急联系人' }[key],
    items: pick(p[key], keys)
  }))
})

const hasSectionData = computed(() => sectionBlocks.value.some(b => b.items.some(i => i.value)))

const statChips = computed(() => [
  { label: '完成进度', value: `${detail.value?.progress || 0}%` },
  { label: '上传文件', value: (detail.value?.documents || []).length },
  { label: 'OCR识别', value: (detail.value?.documents || []).filter(d => d.ocr_payload).length },
  { label: '流程日志', value: (detail.value?.events || []).length }
])

function fileHref(url) {
  if (!url) return '#'
  if (url.startsWith('http')) return url
  return `${window.location.origin}${url}`
}

function isImageFile(urlOrName = '') {
  return /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(String(urlOrName))
}

function previewImage(row) {
  previewImageUrl.value = fileHref(row.file_url)
  previewImageName.value = row.file_name || docLabel(row.doc_key)
  imagePreviewVisible.value = true
}

function openFile(url) {
  if (!url) return
  if (isImageFile(url)) {
    previewImage({ file_url: url, file_name: url.split('/').pop() })
    return
  }
  window.open(fileHref(url), '_blank')
}

function showOcr(row) {
  try {
    ocrPreview.value = typeof row.ocr_payload === 'string'
      ? JSON.stringify(JSON.parse(row.ocr_payload), null, 2)
      : JSON.stringify(row.ocr_payload, null, 2)
  } catch {
    ocrPreview.value = String(row.ocr_payload)
  }
  ocrVisible.value = true
}

function goBack() {
  router.push('/intake')
}

async function load() {
  detail.value = await getIntakeDetail(route.params.id)
}

async function exportPdf() {
  try {
    const pdf = await exportIntakePdf(route.params.id)
    const href = pdf.url?.startsWith('http') ? pdf.url : `${window.location.origin}${pdf.url}`
    window.open(href, '_blank')
    ElMessage.success('PDF 已生成')
  } catch {
    ElMessage.error('导出失败')
  }
}

async function runWorkflow(action) {
  workflowLoading.value = action.key
  try {
    const body = {
      stage: action.stage,
      status: action.status,
      remark: action.remark
    }
    if (action.metaStatus) body.metaStatus = action.metaStatus
    await updateIntakeWorkflow(route.params.id, body)
    ElMessage.success('流程已更新')
    await load()
  } catch {
    ElMessage.error('流程更新失败')
  } finally {
    workflowLoading.value = ''
  }
}

onMounted(load)
</script>

<style scoped>
.detail-top {
  margin-bottom: 12px;
}

.back-btn {
  color: var(--brand-primary);
  font-size: 14px;
}

.header-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 16px;
}

.header-main {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.header-icon {
  font-size: 40px;
  line-height: 1;
}

.header-card h2 {
  margin: 0 0 6px;
  font-size: 22px;
  color: var(--brand-primary);
}

.header-card p {
  margin: 0 0 10px;
  color: var(--brand-muted);
  font-size: 14px;
}

.header-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.stat-chips {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.chip {
  background: #fff;
  border: 1px solid var(--brand-border);
  border-radius: 12px;
  padding: 12px 20px;
  text-align: center;
  min-width: 90px;
}

.chip strong {
  display: block;
  font-size: 22px;
  color: var(--brand-primary);
}

.chip span {
  font-size: 12px;
  color: var(--brand-muted);
}

.block-card, .side-card {
  margin-bottom: 16px;
}

.readonly-alert {
  margin-bottom: 16px;
}

.workflow-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.workflow-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wf-step {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: #f7faf8;
  border-left: 4px solid #d1d5db;
}

.wf-step.wf-success { border-left-color: var(--brand-primary); }
.wf-step.wf-warning { border-left-color: #D4A84B; }

.wf-index {
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  border-radius: 50%;
  background: var(--brand-primary);
  color: #fff;
  font-size: 13px;
  flex-shrink: 0;
}

.wf-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.wf-time, .wf-remark, .ev-operator {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--brand-muted);
}

.muted {
  color: var(--brand-muted);
  font-size: 13px;
}

.ocr-json {
  background: #f7faf8;
  padding: 16px;
  border-radius: 8px;
  font-size: 12px;
  max-height: 400px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.preview-name {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--brand-muted);
}

.preview-image {
  width: 100%;
  max-height: 60vh;
}

.loading-wrap {
  min-height: 400px;
}
</style>
