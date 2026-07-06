# 亮叶企服 · 全栈升级迭代计划表

> 核查日期：2026-07-06 | 当前基线：批次 A–O 已完成 | 本文档为批次 P 交付物

---

## 一、全栈现状摘要

| 层级 | 技术栈 | 健康度 | 主要待办 |
|------|--------|--------|----------|
| 小程序 | 微信原生 55 页 | ✅ CI 通过 | 安全区/tab 页、真机全端验证 |
| API | Express + SQLite | ✅ 语法/路由完整 | 生产密钥、减 mock 依赖 |
| 管理后台 | Vue3 + Element Plus | ✅ 25 菜单项 | 侧栏分组（P 已做）、进件图片预览 |
| 部署 | CI + miniprogram-ci + OSS | ✅ dry-run 通过 | 正式密钥、首次 Git 推送 |
| 集成 | OCR / 内容安全 / 订阅消息 | ⚠️ 需 .env | 生产环境配置 |

---

## 二、分批次修复计划（P1–P8）

### P1 · 多端兼容（本批次 P 已启动）— 优先级 P0

| 项 | 内容 | 状态 |
|----|------|------|
| P1-1 | `utils/device.js` 平台识别 ios/android/harmony | ✅ |
| P1-2 | 全局 safe-area CSS 变量 | ✅ |
| P1-3 | `verify-platform.js` 静态检查 | ✅ |
| P1-4 | `deploy/platform-compatibility.md` 真机清单 | ✅ |
| P1-5 | 设置页展示当前设备信息（联调） | ✅ |
| P1-6 | 全 Tab 页真机回归（iOS/Android/鸿蒙） | 🔲 需人工 |

### P2 · 生产集成与密钥 — 优先级 P0

| 项 | 内容 | 状态 |
|----|------|------|
| P2-1 | `.env` 配置 JWT / 微信 Secret / 模板 ID | 🔲 |
| P2-2 | 阿里云 OCR + 内容安全正式开通 | 🔲 |
| P2-3 | DeepSeek 客服（可选） | 🔲 |
| P2-4 | 服务端减少 `api/mock.js` 热路径依赖 | 🔲 |
| P2-5 | `pnpm sync:prod` + HTTPS 域名 | 🔲 |

### P3 · 进件 P0（`deploy/intake-dev-tasks.md`）— 优先级 P0

| 项 | 内容 | 状态 |
|----|------|------|
| P3-1 | 生产 PUBLIC_BASE_URL + /uploads 公网 | 🔲 |
| P3-2 | 微信公众平台合法域名 | 🔲 |
| P3-3 | 进件与用户账号绑定 | 🔲 |
| P3-4 | 离线同步重试队列 | ✅ |

### P4 · 进件 P1 体验 — 优先级 P1

| 项 | 内容 | 状态 |
|----|------|------|
| P4-1 | 后台进件材料图片预览 | ✅ |
| P4-2 | 工作流推送通知完善 | 🔲 |
| P4-3 | 进件 PDF 批量导出 | 🔲 |
| P4-4 | 「我的进件」小程序入口强化 | 🔲 |

### P5 · 管理后台 UX — 优先级 P1

| 项 | 内容 | 状态 |
|----|------|------|
| P5-1 | 侧栏分组菜单（数据/运营/业务/系统） | ✅ |
| P5-2 | 侧栏批次 A–O 时间线 | ✅ |
| P5-3 | Dashboard 快捷入口对齐分组 | ✅ |
| P5-4 | 融圈/进件待办统一 inbox | ✅ |

### P6 · 合规与安全 P2 — 优先级 P2

| 项 | 内容 | 状态 |
|----|------|------|
| P6-1 | 敏感字段加密存储 | 🔲 |
| P6-2 | 管理后台操作审计日志 | 🔲 |
| P6-3 | 多机构路由 | 🔲 |
| P6-4 | 电子签对接预留 | 🔲 |

### P7 · 发布与 Git — 优先级 P0

| 项 | 内容 | 状态 |
|----|------|------|
| P7-1 | Git 仓库初始化 + 首次提交 | ✅ |
| P7-2 | 配置 GitHub/GitLab remote 并 push | ✅ |
| P7-3 | GitHub Actions 与 remote 联动 | 🔲 |
| P7-4 | `release:checklist` 正式版门禁 | ✅ 脚本已有 |

### P8 · 真机验收门禁 — 优先级 P0

| 项 | 内容 | 状态 |
|----|------|------|
| P8-1 | `pnpm ci:verify` 10 项全绿 | ✅ |
| P8-2 | `pnpm verify:device` API 冒烟 | 🔲 需服务 |
| P8-3 | iOS 真机全链路 | 🔲 人工 |
| P8-4 | Android 真机全链路 | 🔲 人工 |
| P8-5 | 鸿蒙微信真机全链路 | 🔲 人工 |
| P8-6 | 体验版 + 管理后台联调 | 🔲 人工 |

---

## 三、历史批次时间线（A–O）

| 批次 | 主题 | 核心交付 |
|------|------|----------|
| **A** | 进件与区域 | 征信/OCR、地区看板、线索案例 |
| **B** | 延保与融圈 | 理赔 API、DeepSeek、估值 OCR |
| **C** | 导出与设备 | PDF、feed 详情、verify:device |
| **D** | 包体优化 | WebP、分包、audit-bundle |
| **E** | 图片健壮 | safe-image、PNG fallback |
| **F** | 生产配置 | sync:prod、CDN staging |
| **G** | CI/CD | GitHub Actions、OSS dry-run |
| **H** | 发布后台 | miniprogram-ci、SystemDeploy |
| **I** | 一键发布 | SSE 日志、publish workflow |
| **J** | 体验版 | 轮播 safe-image、robot/trial |
| **K** | 融圈上传 | 图片 API、部署告警 |
| **L** | 融圈 OSS | upload-image、trial-version |
| **M** | 融圈审核 | review_status、发布清单、OSS 进度 |
| **N** | 审核增强 | 图片预览、自动规则、通知 |
| **O** | 云审核 | 敏感词 UI、阿里云 Green、订阅消息 |
| **P** | 全栈核查 | 计划表、多端适配、Git push、侧栏、进件离线队列、Dashboard inbox |

---

## 四、推荐执行顺序

```
P1 多端 → P7 Git → P2 生产密钥 → P8 真机验收 → P3/P4 进件 → P5/P6 体验与合规
```

---

## 五、验证命令速查

```bash
pnpm ci:verify              # 静态 CI（10 项）
pnpm verify:platform        # 多端配置检查
pnpm verify:device          # API 冒烟（需 pnpm dev:server）
pnpm release:checklist      # 正式版清单
pnpm verify:production      # 生产发布前
pnpm upload:mp:dry          # 小程序上传预检
```
