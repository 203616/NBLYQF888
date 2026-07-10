<template>
  <div class="login-page">
    <!-- 装饰性背景元素 -->
    <div class="bg-orb bg-orb-1"></div>
    <div class="bg-orb bg-orb-2"></div>
    <div class="bg-orb bg-orb-3"></div>
    <div class="bg-grid"></div>
    <div class="bg-shimmer"></div>

    <!-- 浮动几何装饰 -->
    <div class="float-shape shape-1"></div>
    <div class="float-shape shape-2"></div>
    <div class="float-shape shape-3"></div>

    <div class="login-left">
      <div class="login-brand">
        <div class="logo-wrap">
          <div class="logo">亮</div>
          <div class="logo-glow-ring"></div>
        </div>
        <h1>亮叶企服</h1>
        <p class="subtitle">汽车金融与企服一体化管理平台</p>
        <div class="brand-accent"></div>
      </div>
      <ul class="feature-list">
        <li v-for="(item, index) in features" :key="index" :style="{ animationDelay: 0.3 + index * 0.1 + 's' }">
          <span class="feature-dot" :class="'dot-' + (index + 1)"></span>
          <span class="feature-text">{{ item }}</span>
        </li>
      </ul>
      <div class="login-footer-text">
        <p>亮叶企服 v2.0</p>
        <p class="compliance">本平台不从事放贷业务，不承诺任何机构审批结果</p>
      </div>
    </div>

    <div class="login-right">
      <el-card class="login-card" shadow="never">
        <div class="card-accent-top"></div>
        <div class="card-header">
          <div class="card-icon-wrap">
            <svg class="card-icon-svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#0F3D2E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2>管理后台</h2>
          <p class="login-tip">默认账号：admin / admin123</p>
        </div>

        <el-alert
          v-if="!apiReady"
          type="warning"
          :closable="false"
          show-icon
          title="API 未连接"
          description="请先在项目根目录运行 pnpm dev:server，再刷新本页登录。"
          class="api-alert"
        />

        <el-form :model="form" label-position="top" @submit.prevent>
          <el-form-item label="账号">
            <el-input
              v-model="form.username"
              placeholder="请输入管理员账号"
              size="large"
              class="custom-input"
            >
              <template #prefix>
                <svg class="input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
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
              class="custom-input"
            >
              <template #prefix>
                <svg class="input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </template>
            </el-input>
          </el-form-item>

          <el-button type="primary" :loading="loading" class="login-btn" size="large" @click="submit">
            <span class="btn-text">{{ loading ? '登录中...' : '登 录' }}</span>
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

const features = [
  '进件材料查看与 PDF 导出',
  '汽车线索与融资申请管理',
  '内容运营与数据看板',
  '消息通知与系统配置',
  'DeepSeek AI 智能客服',
  'RBAC 细粒度权限控制'
]

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
  background-size: 200% 200%;
  animation: bg-gradient-shift 15s ease-in-out infinite;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
}

/* ===== 背景装饰 ===== */
.bg-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.bg-orb-1 {
  top: -25%;
  right: -10%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(212, 168, 75, 0.08) 0%, transparent 65%);
  animation: orb-drift-1 12s ease-in-out infinite;
}

.bg-orb-2 {
  bottom: -20%;
  left: -5%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(212, 168, 75, 0.05) 0%, transparent 65%);
  animation: orb-drift-2 15s ease-in-out infinite;
}

.bg-orb-3 {
  top: 40%;
  left: 30%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 60%);
  animation: orb-drift-3 18s ease-in-out infinite;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  animation: grid-fade 8s ease-in-out infinite;
}

/* 背景微光扫描 */
.bg-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255, 255, 255, 0.015) 45%,
    transparent 50%
  );
  pointer-events: none;
  animation: shimmer-sweep 8s ease-in-out infinite;
}

/* 浮动几何装饰 */
.float-shape {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.shape-1 {
  width: 12px;
  height: 12px;
  top: 15%;
  right: 35%;
  background: rgba(212, 168, 75, 0.2);
  border-radius: 2px;
  transform: rotate(45deg);
  animation: shape-float-1 20s linear infinite;
}

.shape-2 {
  width: 8px;
  height: 8px;
  top: 60%;
  left: 10%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: shape-float-2 25s linear infinite;
}

.shape-3 {
  width: 16px;
  height: 16px;
  bottom: 25%;
  right: 15%;
  background: rgba(212, 168, 75, 0.08);
  border: 1px solid rgba(212, 168, 75, 0.15);
  border-radius: 4px;
  transform: rotate(45deg);
  animation: shape-float-3 22s linear infinite;
}

/* ===== 左侧品牌区 ===== */
.login-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  color: #fff;
  position: relative;
  z-index: 1;
  animation: fadeInLeft 0.8s ease-out;
}

.login-brand .logo-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: 24px;
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
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 32px rgba(212, 168, 75, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-brand .logo:hover {
  transform: scale(1.08);
  box-shadow: 0 12px 48px rgba(212, 168, 75, 0.45);
}

.logo-glow-ring {
  position: absolute;
  inset: -6px;
  border-radius: 20px;
  border: 2px solid rgba(212, 168, 75, 0.2);
  animation: logo-ring-pulse 3s ease-in-out infinite;
}

.login-brand h1 {
  margin: 0 0 8px;
  font-size: 36px;
  font-weight: 700;
  letter-spacing: 2px;
  background: linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.85) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-brand .subtitle {
  margin: 0;
  opacity: 0.75;
  font-size: 16px;
  font-weight: 300;
  letter-spacing: 1px;
}

.brand-accent {
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #D4A84B, transparent);
  border-radius: 2px;
  margin-top: 16px;
}

/* --- 功能列表 --- */
.feature-list {
  margin-top: 48px;
  padding: 0;
  list-style: none;
}

.feature-list li {
  padding: 14px 0;
  font-size: 15px;
  opacity: 0.8;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  line-height: 1.6;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease-out both;
}

.feature-list li:last-child {
  border-bottom: none;
}

.feature-list li:hover {
  opacity: 1;
  padding-left: 10px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.feature-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.feature-list li:hover .feature-dot {
  transform: scale(1.5);
  box-shadow: 0 0 12px currentColor;
}

.feature-text {
  transition: transform 0.3s ease;
}

.feature-list li:hover .feature-text {
  transform: translateX(4px);
}

.dot-1 { background: #D4A84B; }
.dot-2 { background: #67c23a; }
.dot-3 { background: #409eff; }
.dot-4 { background: #e6a23c; }
.dot-5 { background: #9b59b6; }
.dot-6 { background: #2ecc71; }

/* --- 底部信息 --- */
.login-footer-text {
  margin-top: 48px;
  font-size: 13px;
  opacity: 0.5;
}

.login-footer-text .compliance {
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.6;
}

/* ===== 右侧登录卡 ===== */
.login-right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  z-index: 1;
  animation: fadeInRight 0.8s ease-out;
}

.login-card {
  width: 440px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  padding: 8px;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.06),
    0 16px 48px rgba(0, 0, 0, 0.1),
    0 32px 80px rgba(0, 0, 0, 0.08);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.login-card:hover {
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 24px 64px rgba(0, 0, 0, 0.12),
    0 48px 100px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

/* 卡片顶部金色装饰线 */
.card-accent-top {
  position: absolute;
  top: 0;
  left: 40px;
  right: 40px;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(212, 168, 75, 0.5), #D4A84B, rgba(212, 168, 75, 0.5), transparent);
  border-radius: 0 0 2px 2px;
}

/* --- 卡片头部 --- */
.card-header {
  text-align: center;
  margin-bottom: 32px;
  margin-top: 8px;
}

.card-icon-wrap {
  width: 56px;
  height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 61, 46, 0.06);
  border-radius: 16px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.login-card:hover .card-icon-wrap {
  background: rgba(15, 61, 46, 0.1);
  transform: scale(1.05);
}

.card-icon-svg {
  display: block;
}

.card-header h2 {
  margin: 0 0 8px;
  color: #0F3D2E;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 2px;
}

.login-tip {
  color: #aaa;
  margin: 0;
  font-size: 13px;
}

/* --- API 警告 --- */
.api-alert {
  margin-bottom: 20px;
}

/* --- 自定义输入框（增强） --- */
.custom-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 4px 16px;
  box-shadow: 0 0 0 1px #e8eaed inset;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
}

.custom-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
  background: #fff;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 2px rgba(15, 61, 46, 0.2) inset,
    0 0 0 6px rgba(15, 61, 46, 0.04);
  background: #fff;
}

.custom-input :deep(.el-input__inner) {
  height: 48px;
  font-size: 15px;
}

.custom-input :deep(.el-input__prefix) {
  display: flex;
  align-items: center;
  margin-right: 8px;
}

.input-icon {
  color: #b0b8c4;
  transition: color 0.3s ease;
}

.custom-input :deep(.el-input__wrapper.is-focus) .input-icon {
  color: #0F3D2E;
}

/* 输入框标签美化 */
.custom-input :deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 500;
  color: #4a4a4a;
  padding-bottom: 6px;
}

/* --- 登录按钮（增强） --- */
.login-btn {
  width: 100%;
  margin-top: 28px;
  height: 50px;
  font-size: 16px;
  border-radius: 25px;
  background: linear-gradient(135deg, #0F3D2E, #1a6b4a, #0F3D2E);
  background-size: 200% 100%;
  border: none;
  letter-spacing: 6px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(15, 61, 46, 0.3);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  transition: left 0.6s ease;
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:hover {
  background-position: 100% 0;
  transform: translateY(-3px);
  box-shadow: 0 12px 36px rgba(15, 61, 46, 0.45);
}

.login-btn:active {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(15, 61, 46, 0.3);
}

.btn-text {
  position: relative;
  z-index: 1;
}

/* --- 卡片底部 --- */
.card-footer {
  text-align: center;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  position: relative;
}

.card-footer::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 2px;
  background: rgba(212, 168, 75, 0.3);
  border-radius: 1px;
}

.card-footer p {
  margin: 0;
  font-size: 13px;
  color: #c0c4cc;
}

/* ===== 关键帧动画 ===== */
@keyframes bg-gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes orb-drift-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -40px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

@keyframes orb-drift-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-40px, -30px) scale(1.08); }
}

@keyframes orb-drift-3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, 30px) scale(1.06); }
}

@keyframes grid-fade {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes shimmer-sweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

@keyframes shape-float-1 {
  0% { transform: rotate(45deg) translate(0, 0); opacity: 0.2; }
  25% { transform: rotate(135deg) translate(30px, -50px); opacity: 0.4; }
  50% { transform: rotate(225deg) translate(60px, 0); opacity: 0.2; }
  75% { transform: rotate(315deg) translate(30px, 50px); opacity: 0.4; }
  100% { transform: rotate(405deg) translate(0, 0); opacity: 0.2; }
}

@keyframes shape-float-2 {
  0% { transform: translate(0, 0); opacity: 0.15; }
  25% { transform: translate(-40px, -30px); opacity: 0.35; }
  50% { transform: translate(-80px, 10px); opacity: 0.15; }
  75% { transform: translate(-40px, 40px); opacity: 0.35; }
  100% { transform: translate(0, 0); opacity: 0.15; }
}

@keyframes shape-float-3 {
  0% { transform: rotate(45deg) translate(0, 0); opacity: 0.1; }
  33% { transform: rotate(105deg) translate(-40px, -30px); opacity: 0.3; }
  66% { transform: rotate(165deg) translate(20px, -60px); opacity: 0.1; }
  100% { transform: rotate(225deg) translate(0, 0); opacity: 0.3; }
}

@keyframes logo-ring-pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.08); opacity: 1; }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== 响应式设计 ===== */
@media (max-width: 1200px) {
  .login-left {
    padding: 48px;
  }

  .login-card {
    width: 400px;
  }
}

@media (max-width: 1024px) {
  .login-left {
    padding: 40px;
  }

  .login-brand h1 {
    font-size: 30px;
  }

  .feature-list {
    margin-top: 36px;
  }

  .login-card {
    width: 380px;
  }
}

@media (max-width: 900px) {
  .login-left {
    display: none;
  }

  .login-right {
    padding: 24px;
    width: 100%;
  }

  .login-card {
    width: 100%;
    max-width: 420px;
  }

  .login-page {
    justify-content: center;
    align-items: center;
  }

  .bg-orb-1 {
    width: 500px;
    height: 500px;
  }

  .bg-orb-2 {
    width: 400px;
    height: 400px;
  }
}

@media (max-width: 480px) {
  .login-right {
    padding: 16px;
  }

  .login-card {
    border-radius: 16px;
    padding: 4px;
  }

  .card-header h2 {
    font-size: 22px;
  }

  .login-btn {
    height: 46px;
    font-size: 15px;
  }

  .card-icon-wrap {
    width: 48px;
    height: 48px;
  }

  .card-icon-svg {
    width: 24px;
    height: 24px;
  }
}
</style>
