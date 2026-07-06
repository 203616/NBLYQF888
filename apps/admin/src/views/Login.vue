<template>
  <div class="login-page">
    <div class="login-left">
      <div class="login-brand">
        <div class="logo">亮</div>
        <h1>亮叶企服</h1>
        <p>汽车金融与企服一体化管理平台</p>
      </div>
      <ul class="feature-list">
        <li>进件材料查看与 PDF 导出</li>
        <li>汽车线索与融资申请管理</li>
        <li>内容运营与数据看板</li>
        <li>消息通知与系统配置</li>
      </ul>
    </div>
    <el-card class="login-card" shadow="never">
      <h2>管理后台登录</h2>
      <p class="login-tip">默认账号：admin / admin123</p>
      <el-alert v-if="!apiReady" type="warning" :closable="false" show-icon title="API 未连接" description="请先在项目根目录运行 pnpm dev:server，再刷新本页登录。" class="api-alert" />
      <el-form :model="form" label-position="top" @submit.prevent>
        <el-form-item label="账号">
          <el-input v-model="form.username" prefix-icon="User" size="large" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password prefix-icon="Lock" size="large" />
        </el-form-item>
        <el-button type="primary" :loading="loading" class="login-btn" size="large" @click="submit">登录</el-button>
      </el-form>
    </el-card>
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
}

.login-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  color: #fff;
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
  margin-bottom: 20px;
}

.login-brand h1 {
  margin: 0 0 8px;
  font-size: 36px;
}

.login-brand p {
  margin: 0;
  opacity: 0.8;
  font-size: 16px;
}

.feature-list {
  margin-top: 48px;
  padding: 0;
  list-style: none;
}

.feature-list li {
  padding: 12px 0;
  font-size: 15px;
  opacity: 0.9;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-list li::before {
  content: '✓ ';
  color: #D4A84B;
  font-weight: bold;
}

.login-card {
  width: 440px;
  margin: auto 80px auto 0;
  border-radius: 20px;
  border: none;
  padding: 12px;
}

h2 {
  margin: 0 0 8px;
  color: var(--brand-primary);
  font-size: 24px;
}

.login-tip {
  color: var(--brand-muted);
  margin-bottom: 16px;
  font-size: 13px;
}

.api-alert {
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
}

@media (max-width: 900px) {
  .login-left { display: none; }
  .login-card { margin: auto; width: 90%; max-width: 400px; }
}
</style>
