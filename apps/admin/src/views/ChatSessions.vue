<template>
  <div class="chats-page">
    <div class="page-header">
      <h2>💬 客服会话管理</h2>
      <p>查看用户与 DeepSeek 智能客服的对话记录和 AI 分析结果</p>
    </div>

    <!-- 筛选工具栏 -->
    <div class="toolbar page-card">
      <el-select v-model="filters.status" placeholder="会话状态" clearable size="small" @change="loadSessions" style="width:140px">
        <el-option label="进行中" value="open" />
        <el-option label="已关闭" value="closed" />
      </el-select>
      <el-input v-model="filters.keyword" placeholder="搜索用户 ID / 标题" size="small" clearable style="width:200px" @keyup.enter="loadSessions" />
      <el-button type="primary" size="small" @click="loadSessions">查询</el-button>
      <el-button size="small" @click="loadSessions">刷新</el-button>
      <span style="margin-left:auto;font-size:13px;color:#999;">共 {{ total }} 条会话</span>
    </div>

    <el-row :gutter="16">
      <!-- 左侧：会话列表 -->
      <el-col :xs="24" :md="10">
        <div class="page-card session-list">
          <el-table :data="sessions" stripe size="small" highlight-current-row @current-change="selectSession" height="calc(100vh - 320px)">
            <el-table-column type="index" label="#" width="50" />
            <el-table-column prop="title" label="标题" min-width="120" show-overflow-tooltip />
            <el-table-column prop="user_id" label="用户 ID" width="80" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'open' ? 'success' : 'info'" size="small">{{ row.status === 'open' ? '进行中' : '已关闭' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="160" />
          </el-table>
          <el-pagination
            v-model:current-page="page"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            small
            background
            style="margin-top:12px;text-align:center;"
            @current-change="loadSessions"
          />
        </div>
      </el-col>

      <!-- 右侧：对话详情 -->
      <el-col :xs="24" :md="14">
        <div class="page-card" v-if="currentSession">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <h3 style="margin:0;">会话 #{{ currentSession.id }} - {{ currentSession.title }}</h3>
            <div>
              <el-tag v-if="aiConnected" type="success" size="small">DeepSeek 已连接</el-tag>
              <el-tag v-else type="danger" size="small">AI 离线</el-tag>
            </div>
          </div>

          <div class="chat-messages" ref="chatBox">
            <div v-for="msg in messages" :key="msg.id" class="chat-msg" :class="msg.role">
              <div class="msg-avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</div>
              <div class="msg-body">
                <div class="msg-header">
                  <strong>{{ msg.role === 'user' ? '用户' : '亮叶助手' }}</strong>
                  <span class="msg-time">{{ msg.created_at }}</span>
                  <el-tag v-if="msg.role === 'assistant' && msg.id === lastAiMsgId && aiSource === 'deepseek'" size="small" type="success" style="margin-left:8px;">DeepSeek</el-tag>
                  <el-tag v-else-if="msg.role === 'assistant' && msg.id === lastAiMsgId" size="small" type="warning" style="margin-left:8px;">本地 FAQ</el-tag>
                </div>
                <div class="msg-content">{{ msg.content }}</div>
                <div v-if="msg.role === 'user'" class="msg-actions">
                  <el-button size="mini" type="primary" link @click="showAnalysis(msg.id)">🔍 AI 分析</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="page-card" v-else style="text-align:center;padding:60px 20px;color:#999;">
          <p style="font-size:48px;margin:0 0 16px;">💬</p>
          <p>请从左侧选择一个会话查看对话详情</p>
        </div>
      </el-col>
    </el-row>

    <!-- AI 分析结果弹窗 -->
    <el-dialog v-model="analysisVisible" title="🔍 AI 内容分析" width="600px" :close-on-click-modal="false">
      <div v-if="analysisLoading" style="text-align:center;padding:40px;">
        <div class="loading-spinner"></div>
        <p style="margin-top:12px;">正在分析中...</p>
      </div>
      <div v-else-if="analysisResult" class="analysis-result">
        <div class="analysis-item"><label>内容分类</label><span>{{ analysisResult.category }}</span></div>
        <div class="analysis-item"><label>内容摘要</label><span>{{ analysisResult.summary }}</span></div>
        <div class="analysis-item"><label>情感倾向</label><span>
          <el-tag :type="sentimentType(analysisResult.sentiment)" size="small">{{ analysisResult.sentiment }}</el-tag>
        </span></div>
        <div class="analysis-item"><label>紧急程度</label><span>
          <el-tag :type="urgencyType(analysisResult.urgency)" size="small">{{ analysisResult.urgency }}</el-tag>
        </span></div>
        <div class="analysis-item" v-if="analysisResult.suggestedReply">
          <label>建议回复</label>
          <span class="suggested-reply">{{ analysisResult.suggestedReply }}</span>
        </div>
        <div class="analysis-item"><label>分析来源</label><span>
          <el-tag :type="analysisResult.source === 'deepseek' ? 'success' : 'info'" size="small">
            {{ analysisResult.source === 'deepseek' ? 'DeepSeek AI' : '本地分析' }}
          </el-tag>
        </span></div>
      </div>
      <div v-else style="text-align:center;padding:40px;color:#999;">
        <p>未找到分析结果，请确认用户消息已发送成功</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../api/request'

const sessions = ref([])
const messages = ref([])
const currentSession = ref(null)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const aiConnected = ref(false)
const aiSource = ref('')
const lastAiMsgId = ref(null)
const chatBox = ref(null)
const analysisVisible = ref(false)
const analysisLoading = ref(false)
const analysisResult = ref(null)

const filters = ref({
  status: '',
  keyword: ''
})

async function loadSessions() {
  try {
    const params = { page: page.value, pageSize: pageSize.value }
    if (filters.value.status) params.status = filters.value.status
    // 使用通用 CRUD 获取会话列表
    const res = await request.get('/admin/serviceSessions', { params })
    sessions.value = res.list || []
    total.value = res.total || 0
  } catch (e) {
    ElMessage.warning('加载会话列表失败: ' + e.message)
  }
}

async function selectSession(session) {
  if (!session) return
  currentSession.value = session
  try {
    const res = await request.get(`/admin/service-sessions/${session.id}/messages`)
    messages.value = res.messages || []
    lastAiMsgId.value = null
    aiSource.value = ''
    // 找到最后一个 AI 回复的 source
    for (let i = messages.value.length - 1; i >= 0; i--) {
      if (messages.value[i].role === 'assistant') {
        lastAiMsgId.value = messages.value[i].id
        // 检查内容是否包含合规提示来确定来源
        if (messages.value[i].content.includes('合规提示')) {
          aiSource.value = 'faq-fallback'
        } else {
          aiSource.value = 'deepseek'
        }
        break
      }
    }
    aiConnected.value = aiSource.value === 'deepseek'
    await nextTick()
    if (chatBox.value) {
      chatBox.value.scrollTop = chatBox.value.scrollHeight
    }
  } catch (e) {
    ElMessage.warning('加载消息失败: ' + e.message)
    messages.value = []
  }
}

async function showAnalysis(messageId) {
  analysisVisible.value = true
  analysisLoading.value = true
  analysisResult.value = null
  try {
    const res = await request.get(`/admin/chat-analysis/${messageId}`)
    analysisResult.value = res
  } catch {
    analysisResult.value = null
  } finally {
    analysisLoading.value = false
  }
}

function sentimentType(s) {
  const map = { 正面: 'success', 中性: 'info', 负面: 'warning', 愤怒: 'danger' }
  return map[s] || 'info'
}

function urgencyType(u) {
  const map = { 低: 'info', 中: 'warning', 高: 'danger', 紧急: 'danger' }
  return map[u] || 'info'
}

onMounted(() => {
  loadSessions()
})
</script>

<style scoped>
.toolbar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
.session-list { min-height: 300px; }
.chat-messages { max-height: calc(100vh - 420px); overflow-y: auto; padding: 12px; background: #f8f9fa; border-radius: 8px; }
.chat-msg { display: flex; gap: 10px; margin-bottom: 16px; }
.chat-msg.user { flex-direction: row-reverse; }
.msg-avatar { width: 36px; height: 36px; border-radius: 50%; background: #e8eaed; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.chat-msg.user .msg-avatar { background: #e3f2fd; }
.msg-body { max-width: 75%; }
.chat-msg.user .msg-body { text-align: right; }
.msg-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap; }
.chat-msg.user .msg-header { flex-direction: row-reverse; }
.msg-time { font-size: 12px; color: #999; }
.msg-content { background: white; padding: 10px 14px; border-radius: 12px; line-height: 1.6; font-size: 14px; white-space: pre-wrap; word-break: break-word; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
.chat-msg.user .msg-content { background: #e3f2fd; }
.msg-actions { margin-top: 4px; }
.analysis-result { padding: 8px 0; }
.analysis-item { display: flex; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
.analysis-item:last-child { border-bottom: none; }
.analysis-item label { width: 100px; font-weight: 600; color: #666; flex-shrink: 0; }
.analysis-item span { flex: 1; }
.suggested-reply { background: #f6ffed; padding: 8px 12px; border-radius: 6px; border-left: 3px solid #52c41a; line-height: 1.6; white-space: pre-wrap; }
.loading-spinner { display: inline-block; width: 32px; height: 32px; border: 3px solid #e8eaed; border-top-color: #409eff; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
