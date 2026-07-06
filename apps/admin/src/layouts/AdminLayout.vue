<template>
  <el-container class="layout">
    <el-aside :width="sidebarWidth" class="aside">
      <div class="brand-block">
        <div class="brand-logo">亮</div>
        <div class="brand-text">
          <strong>亮叶企服</strong>
          <span>管理后台</span>
        </div>
      </div>

      <el-scrollbar class="menu-scroll">
        <el-menu
          router
          :default-active="$route.path"
          class="side-menu"
          background-color="transparent"
          text-color="rgba(255,255,255,0.75)"
          active-text-color="#ffffff"
        >
          <el-sub-menu v-for="group in menuGroups" :key="group.id" :index="group.id">
            <template #title>
              <span class="menu-icon">{{ group.icon }}</span>
              <span>{{ group.title }}</span>
            </template>
            <el-menu-item
              v-for="item in itemsInGroup(group.id)"
              :key="item.path"
              :index="item.path"
            >
              <span class="menu-icon sub">{{ item.icon }}</span>
              <span>{{ item.title }}</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>

        <div class="timeline-panel">
          <div class="timeline-head">迭代时间线</div>
          <div class="timeline-list">
            <div
              v-for="item in releaseTimeline"
              :key="item.batch"
              class="timeline-item"
              :class="item.status"
            >
              <span class="tl-batch">{{ item.batch }}</span>
              <div class="tl-body">
                <strong>{{ item.title }}</strong>
                <span class="tl-status">{{ statusLabel(item.status) }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-scrollbar>

      <div class="aside-footer">
        <text>批次 P · 全栈核查</text>
        <text>v1.0</text>
      </div>
    </el-aside>
    <el-container class="main-wrap">
      <el-header class="header">
        <div class="header-left">
          <strong>{{ currentTitle }}</strong>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>后台</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentGroupTitle }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-tag type="success" effect="plain" size="small">运行中</el-tag>
          <el-dropdown>
            <span class="user-chip">
              <span class="user-avatar">管</span>
              管理员
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { menus, menuGroups, releaseTimeline } from '../router'

const route = useRoute()
const router = useRouter()
const sidebarWidth = '260px'

const currentTitle = computed(() =>
  route.meta.title || menus.find(item => item.path === route.path)?.title || '数据概览'
)

const currentGroupTitle = computed(() => {
  const item = menus.find(m => m.path === route.path)
  if (!item) return '概览'
  return menuGroups.find(g => g.id === item.group)?.title || '概览'
})

function itemsInGroup(groupId) {
  return menus.filter(m => m.group === groupId)
}

function statusLabel(status) {
  const map = { done: '已完成', active: '进行中', pending: '待开始' }
  return map[status] || status
}

function logout() {
  localStorage.removeItem('adminToken')
  router.replace('/login')
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.aside {
  background: linear-gradient(180deg, #0a2e22 0%, #0F3D2E 50%, #145a40 100%);
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.brand-logo {
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #D4A84B, #e8c878);
  color: #0F3D2E;
  font-weight: 800;
  font-size: 18px;
}

.brand-text strong {
  display: block;
  color: #fff;
  font-size: 16px;
}

.brand-text span {
  color: rgba(255, 255, 255, 0.55);
  font-size: 12px;
}

.menu-scroll {
  flex: 1;
  min-height: 0;
}

.side-menu {
  border-right: none;
  padding: 8px 8px 0;
}

.side-menu :deep(.el-sub-menu__title),
.side-menu .el-menu-item {
  border-radius: 10px;
  margin-bottom: 2px;
  height: 44px;
}

.side-menu :deep(.el-sub-menu__title:hover),
.side-menu .el-menu-item:hover {
  background: rgba(255, 255, 255, 0.06) !important;
}

.side-menu .el-menu-item.is-active {
  background: rgba(212, 168, 75, 0.2) !important;
  color: #fff !important;
}

.menu-icon {
  margin-right: 10px;
  font-size: 16px;
}

.menu-icon.sub {
  font-size: 14px;
  opacity: 0.9;
}

.timeline-panel {
  margin: 12px 10px 16px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.timeline-head {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 10px;
  text-transform: uppercase;
}

.timeline-list {
  max-height: 220px;
  overflow-y: auto;
}

.timeline-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 11px;
}

.timeline-item:last-child {
  border-bottom: none;
}

.tl-batch {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  border-radius: 6px;
  font-weight: 700;
  font-size: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.timeline-item.done .tl-batch {
  background: rgba(82, 196, 26, 0.25);
  color: #95de64;
}

.timeline-item.active .tl-batch {
  background: rgba(212, 168, 75, 0.35);
  color: #ffe58f;
}

.tl-body {
  flex: 1;
  min-width: 0;
}

.tl-body strong {
  display: block;
  color: rgba(255, 255, 255, 0.85);
  font-size: 11px;
  font-weight: 500;
  line-height: 1.3;
}

.tl-status {
  color: rgba(255, 255, 255, 0.4);
  font-size: 10px;
}

.aside-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  justify-content: space-between;
  flex-shrink: 0;
}

.main-wrap {
  background: var(--brand-bg);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid var(--brand-border);
  height: var(--header-height);
  padding: 0 28px;
}

.header-left strong {
  display: block;
  font-size: 18px;
  color: var(--brand-primary);
  margin-bottom: 4px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--brand-text);
}

.user-avatar {
  width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  border-radius: 50%;
  background: var(--brand-primary);
  color: #fff;
  font-size: 13px;
}

.main-content {
  padding: 24px 28px;
}
</style>
