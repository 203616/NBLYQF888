# 亮叶企服智能合规全栈版

![CI](https://github.com/203616/NBLYQF888/actions/workflows/verify.yml/badge.svg)

本项目保留微信小程序根目录结构，并新增 Node.js/Express API 与 Vue 管理后台。

## 目录

- `pages/`、`subpackages/`：微信小程序前端
- `api/`、`utils/`：小程序接口层与本地 mock fallback
- `apps/server`：Express + SQLite 后端
- `apps/admin`：Vue 3 + Element Plus 管理后台

## 本地启动

```bash
pnpm install
pnpm run db:reset
pnpm run dev
```

后端地址：`http://localhost:3000/api/v1`

管理后台：`http://localhost:5188/ly-admin/`（须先 `pnpm dev` 或同时启动 API + Admin）

默认后台账号：`admin / admin123`

## 小程序联调

默认 `utils/config.js` 使用 `ENV = 'local'`，小程序走本地 mock 数据，适合直接在微信开发者工具预览。

如需连接本地后端：

1. 将 `utils/config.js` 中 `ENV` 改为 `development`
2. 确认 `apiBaseUrl` 为 `http://localhost:3000/api/v1`
3. 启动后端：`pnpm run dev:server`

## 部署前检查

全栈升级计划与批次时间线见 [`deploy/upgrade-roadmap.md`](deploy/upgrade-roadmap.md)；多端真机说明见 [`deploy/platform-compatibility.md`](deploy/platform-compatibility.md)。

生产密钥：复制 [`.env.production.example`](.env.production.example) 为 `.env` 并按 [`deploy/production-secrets.md`](deploy/production-secrets.md) 填写；GitHub Actions Secrets 见 [`.github/SECRETS.md`](.github/SECRETS.md)。

一键部署（推荐）：

```bash
pnpm run deploy
```

将自动完成：生成 `.env`、同步 API 地址、生成图片、初始化数据库、构建管理后台、健康检查。

部署状态验证：

```bash
pnpm run deploy:check
```

手动分步部署：

```bash
pnpm run generate:images
pnpm run db:reset
pnpm run build:admin
pnpm run start:server
```

小程序仍通过微信开发者工具上传；后端和管理后台可分别部署到 Node 服务与静态站点。

上线前请完成：

1. 按需修改 `deploy/deploy.config.json` 中的域名，然后重新执行 `pnpm run deploy`
2. 按 `deploy/wechat-checklist.txt` 在微信公众平台配置 request 合法域名
3. 将 `api.liangyeqf.com` 解析到服务器并配置 HTTPS 证书
4. 正式版小程序将自动使用 `production` 环境；开发者工具预览默认走 `local` mock 数据

服务地址（本地）：

- API: `http://localhost:3000/api/v1`
- 管理后台: `http://localhost:3000/admin`（需先 `pnpm run build:admin`）
- 健康检查: `http://localhost:3000/api/v1/health`
