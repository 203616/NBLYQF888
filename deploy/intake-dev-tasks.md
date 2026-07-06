# 进件系统 — 开发任务清单

## 已完成（本迭代）

- [x] SQLite 表：`intake_applications`、`intake_documents`、`intake_workflow_events`
- [x] 后端 API：`POST /intake/sync`、`POST /intake/upload`、`POST /intake/ocr`、`POST /intake/:no/submit`
- [x] 管理端 API：`GET /intake/admin/list`、`GET /intake/admin/detail/:id`、`PATCH`、`POST workflow`
- [x] 小程序：表单/上传自动同步云端；身份证 OCR 识别并填入个人信息
- [x] 管理后台：进件列表、详情、流程推进、资料预览
- [x] OCR 演示模式（`OCR_PROVIDER=mock`）

## 待办 — P0（上线前必做）

| 任务 | 说明 | 负责模块 |
|------|------|----------|
| 执行数据库迁移 | `pnpm db:migrate`（已有库）或 `pnpm db:reset`（开发重置） | server |
| 配置生产环境变量 | `JWT_SECRET`、`PUBLIC_BASE_URL`、`OCR_*` | deploy |
| 微信合法域名 | 小程序 request/uploadFile 域名加入微信公众平台 | 运维 |
| 腾讯云 OCR 接入 | 实现 `ocr.service.js` 中 `recognizeTencentIdCard` | server |
| HTTPS 证书与反向代理 | `/uploads` 静态资源外网可访问 | 运维 |

## 待办 — P1（体验增强）

| 任务 | 说明 |
|------|------|
| 登录态绑定进件 | 用户登录后 `user_id` 自动关联，支持「我的进件」列表 |
| 断网重试队列 | 小程序离线编辑，网络恢复后批量 `sync` |
| 管理端资料大图预览 | IntakeDetail 内嵌图片 viewer |
| 工作流通知 | 审核状态变更推送微信订阅消息 / 站内通知 |
| 导出进件 PDF | 管理端一键导出材料包 |

## 待办 — P2（合规与扩展）

| 任务 | 说明 |
|------|------|
| 敏感字段加密 | 身份证号、手机号入库加密存储 |
| 操作审计日志 | 管理员查看/修改进件留痕 |
| 多机构分发 | 审核通过后按规则分配给合作机构 |
| 电子签约 | 对接 e 签宝 / 法大大 |
| 征信接口 | 在授权书上传后调用持牌征信通道 |

## 本地联调步骤

```bash
# 1. 迁移数据库
pnpm db:migrate

# 2. 启动后端 + 管理端
pnpm dev

# 3. 小程序开发者工具
#    - utils/config.js 设置 MANUAL_ENV = 'development'
#    - 勾选「不校验合法域名」

# 4. 管理后台
#    http://localhost:5188/ly-admin  账号 admin / admin123

# 5. 验证进件同步
#    小程序填写进件 → 管理端「进件管理」查看记录
```

## API 速查

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/intake/sync` | 全量同步进件 JSON |
| POST | `/api/v1/intake/upload` | Base64 上传资料 |
| POST | `/api/v1/intake/ocr` | 身份证 OCR |
| POST | `/api/v1/intake/:no/submit` | 提交审核 |
| GET | `/api/v1/intake/admin/list` | 管理端列表 |
| GET | `/api/v1/intake/admin/detail/:id` | 管理端详情 |

## 环境变量

```env
OCR_PROVIDER=mock          # mock | tencent
OCR_SECRET_ID=
OCR_SECRET_KEY=
PUBLIC_BASE_URL=http://localhost:3000
UPLOADS_DIR=apps/server/uploads
```
