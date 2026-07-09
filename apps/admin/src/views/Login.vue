<template>
  <div class="login-page">
    <div class="login-left">
      <div class="login-brand">
        <div class="logo">亮</div>
        <h1>亮叶企服</h1>
        <p class="subtitle">汽车金融与企服一体化管理平台</p>
      </div>
      <ul class="feature-list">
        <li>📄 进件材料查看与 PDF 导出</li>
        <li>🚗 汽车线索与融资申请管理</li>
        <li>📊 内容运营与数据看板</li>
        <li>🔔 消息通知与系统配置</li>
        <li>🤖 DeepSeek AI 智能客服</li>
        <li>🔐 RBAC 细粒度权限控制</li>
      </ul>
      <div class="login-footer-text">
        <p>亮叶企服 v2.0</p>
        <p class="compliance">本平台不从事放贷业务，不承诺任何机构审批结果</p>
      </div>
    </div>

    <div class="login-right">
      <el-card class="login-card" shadow="never">
        <div class="card-header">
          <h2>管理后台</h2>
          <p class="login-tip">默认账号：admin / admin123</p>
        </div>

        <el-alert v-if="!apiReady" type="warning" :closable="false" show-icon title="API 未连接" description="请先在项目根目录运行 pnpm dev:server，再刷新本页登录。" class="api-alert" />

        <el-form :model="form" label-position="top" @submit.prevent>
          <el-form-item label="账号">
            <el-input
              v-model="form.username"
              placeholder="请输入管理员账号"
              size="large"
            >
              <template #prefix>
                <span style="font-size:18px;">👤</span>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="密码">
            <el-input
              v-model="form.password"
              type="password"
              show-password
              placeholder="请输入密码"
              size="large"
            >
              <template #prefix>
                <span style="font-size:18px;">🔒</span>
              </template>
            </el-input>
          </el-form-item>

          <el-button type="primary" :loading="loading" class="login-btn" size="large" @click="submit">
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form>

        <div class="card-footer">
          <p>首次使用？请联系管理员获取账号</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '../api/resources'
import { pingApi } from '../api/request'

const router = useRouter()
const loading = ref(false)
const apiReady = ref(true)
const form = reactive({
  username: 'admin',
  password: 'admin123'
})

onMounted(async () => {
  const health = await pingApi()
  apiReady.value = !!health
  if (!apiReady.value) {
    ElMessage.warning('API 未启动，请先运行 pnpm dev:server')
  }
})

async function submit() {
  if (!form.username || !form.password) {
    return ElMessage.warning('请输入账号和密码')
  }
  loading.value = true
  try {
    const data = await login(form)
    if (!data?.token) throw new Error('登录响应异常，请检查 API 服务')
    localStorage.setItem('adminToken', data.token)
    ElMessage.success('登录成功')
    router.replace('/dashboard')
  } catch (error) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #0a2e22 0%, #0F3D2E 40%, #1a5c42 100%);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
}

/* 左侧品牌区 */
.login-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  color: #fff;
  position: relative;
  overflow: hidden;
}

.login-left::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212,168,75,0.08) 0%, transparent 70%);
}

.login-brand .logo {
  width: 56px;
  height: 56px;
  line-height: 56px;
  text-align: center;
  border-radius: 16px;
  background: linear-gradient(135deg, #D4A84B, #e8c878);
  color: #0F3D2E;
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(212,168,75,0.3);
}

.login-brand h1 {
  margin: 0 0 8px;
  font-size: 36px;
  font-weight: 700;
}

.login-brand .subtitle {
  margin: 0;
  opacity: 0.8;
  font-size: 16px;
  font-weight: 300;
}

.feature-list {
  margin-top: 48px;
  padding: 0;
  list-style: none;
}

.feature-list li {
  padding: 14px 0;
  font-size: 15px;
  opacity: 0.9;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  line-height: 1.6;
}

.feature-list li:last-child {
  border-bottom: none;
}

.login-footer-text {
  margin-top: 48px;
  font-size: 13px;
  opacity: 0.6;
}

.login-footer-text .compliance {
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.5;
}

/* 右侧登录卡 */
.login-right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-card {
  width: 440px;
  border-radius: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  padding: 8px;
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.card-header h2 {
  margin: 0 0 8px;
  color: #0F3D2E;
  font-size: 26px;
  font-weight: 700;
}

.login-tip {
  color: #999;
  margin: 0;
  font-size: 13px;
}

.api-alert {
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  margin-top: 16px;
  height: 48px;
  font-size: 16px;
  border-radius: 24px;
  background: linear-gradient(135deg, #0F3D2E, #1a5c42);
  border: none;
  letter-spacing: 4px;
}

.login-btn:hover {
  background: linear-gradient(135deg, #1a5c42, #0F3D2E);
  opacity: 0.95;
}

.card-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.card-footer p {
  margin: 0;
  font-size: 13px;
  color: #bbb;
}

/* 响应式 */
@media (max-width: 900px) {
  .login-left { display: none; }
  .login-right { padding: 20px; width: 100%; }
  .login-card { width: 100%; max-width: 420px; }
}
</style>
