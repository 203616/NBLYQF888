# 亮叶企服 · 环境变量配置指引

本文说明项目根目录 `.env` 各配置项用途、获取方式与联调步骤。

## 快速开始（本地开发）

```bash
# 1. 复制模板
copy deploy\env.local.template .env

# 2. 至少填写 JWT_SECRET（随机长字符串）
# 3. 迁移数据库并启动
pnpm db:migrate
pnpm dev
```

| 服务 | 地址 |
|------|------|
| API | http://localhost:3000/api/v1 |
| 管理后台 | http://localhost:5188/ly-admin/ （需同时运行 API） |
| 单端口备选 | http://localhost:3000/ly-admin/ （需先 `pnpm build:admin`） |
| 默认管理员 | admin / admin123 |

小程序联调：在 `utils/config.js` 设置 `MANUAL_ENV = 'development'`。

---

## 配置项说明

### 基础服务

| 变量 | 必填 | 说明 |
|------|------|------|
| `PORT` | 否 | API 端口，默认 3000 |
| `NODE_ENV` | 建议 | `development` / `production` |
| `JWT_SECRET` | **是** | 用户与管理员 JWT 签名密钥，请使用 32 位以上随机字符串 |
| `DB_PATH` | 否 | SQLite 路径，默认 `apps/server/data/liangye.db` |
| `UPLOADS_DIR` | 否 | 上传文件目录 |
| `PUBLIC_BASE_URL` | 建议 | 对外可访问的 API 根地址（PDF/图片链接用） |
| `API_BASE_URL` | 否 | 文档用，与 PUBLIC_BASE_URL 对应 |
| `ADMIN_URL` | 否 | 管理后台完整访问地址（含子路径） |
| `ADMIN_PORT` | 否 | 本地开发端口，默认 `5188` |
| `ADMIN_BASE_PATH` | 否 | 后台 URL 子路径，默认 `/ly-admin` |

### DeepSeek 智能客服

| 变量 | 必填 | 说明 |
|------|------|------|
| `DEEPSEEK_API_KEY` | 建议 | [DeepSeek 开放平台](https://platform.deepseek.com/) API Key；留空则降级为本地 FAQ |
| `DEEPSEEK_MODEL` | 否 | 推荐 `deepseek-chat`，默认已更新为此模型 |

详细步骤见 [deploy/deepseek-setup.md](./deepseek-setup.md)。

### 阿里云 OCR（身份证识别）

| 变量 | 必填 | 说明 |
|------|------|------|
| `OCR_PROVIDER` | 否 | `aliyun` 或留空（Mock 模式） |
| `ALIYUN_ACCESS_KEY_ID` | OCR 时必填 | 阿里云 RAM AccessKey ID |
| `ALIYUN_ACCESS_KEY_SECRET` | OCR 时必填 | 阿里云 RAM AccessKey Secret |
| `ALIYUN_OCR_ENDPOINT` | 否 | 默认 `ocr-api.cn-hangzhou.aliyuncs.com` |

未配置密钥时，系统自动使用 **Mock OCR**（返回示例字段，便于 UI 联调）。

详细开通步骤见 [deploy/aliyun-ocr-setup.md](./aliyun-ocr-setup.md)。

### 微信小程序

| 变量 | 必填 | 说明 |
|------|------|------|
| `WECHAT_APPID` | 建议 | 小程序 AppID，当前项目：`wxf49b1aeb1d62f227` |
| `WECHAT_SECRET` | 订阅/登录时必填 | 小程序 AppSecret（微信公众平台 → 开发管理 → 开发设置） |
| `WECHAT_TEMPLATE_INTAKE_AUDIT` | 订阅时必填 | 进件审核进度订阅消息模板 ID |
| `WECHAT_TEMPLATE_INTAKE_DISBURSE` | 订阅时必填 | 放款通知订阅消息模板 ID |

模板 ID 由服务端 `/api/v1/config/integrations` 下发给小程序，**无需改小程序代码**。

### 订阅消息模板字段建议

审核通知建议包含：产品名称、进件编号、状态、申请人姓名。  
放款通知建议包含：产品名称、进件编号、放款状态、备注。

---

## 配置示例

### 本地开发（最小可用）

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=请替换为随机长字符串至少32位
PUBLIC_BASE_URL=http://localhost:3000
WECHAT_APPID=wxf49b1aeb1d62f227
OCR_PROVIDER=
```

### 完整生产示例

```env
NODE_ENV=production
JWT_SECRET=生产环境强随机密钥
PUBLIC_BASE_URL=https://api.yourdomain.com
OCR_PROVIDER=aliyun
ALIYUN_ACCESS_KEY_ID=LTAI...
ALIYUN_ACCESS_KEY_SECRET=...
WECHAT_APPID=wxf49b1aeb1d62f227
WECHAT_SECRET=...
WECHAT_TEMPLATE_INTAKE_AUDIT=...
WECHAT_TEMPLATE_INTAKE_DISBURSE=...
```

---

## 验证命令

```bash
# 检查 OCR / 微信 / 订阅集成状态
pnpm verify:integrations --ping

# 进件流转全链路
pnpm verify:intake

# 易融圈需求发布
pnpm verify:demands

# 小程序页面完整性
pnpm verify:notifications  # 消息未读/已读
```

---

## 常见问题

**Q: 管理后台端口或路径冲突？**  
A: 在 `.env` 中修改 `ADMIN_PORT`（默认 `5188`）和 `ADMIN_BASE_PATH`（默认 `/ly-admin`），重启 `pnpm dev:admin`。访问地址为 `http://localhost:{端口}{路径}`，例如 `http://localhost:5188/ly-admin`。

**Q: 生产环境独立域名部署？**  
A: 若后台挂在域名根路径（如 `https://admin.liangyeqf.com`），构建时设置 `ADMIN_BASE_PATH=/` 后执行 `pnpm build:admin`。

**Q: 改了 `.env` 不生效？**  
A: 重启 API 服务（`pnpm dev:server`）。dotenv 在 `apps/server/src/config/index.js` 加载项目根目录 `.env`。

**Q: 小程序请求 localhost 失败？**  
A: 微信开发者工具 → 详情 → 本地设置 → 勾选「不校验合法域名」；真机调试需使用 HTTPS 域名。

**Q: OCR 一直 Mock？**  
A: 确认 `OCR_PROVIDER=aliyun` 且 AccessKey 已填写，运行 `pnpm verify:integrations` 查看 `ocrMode`。

**Q: 订阅消息发不出去？**  
A: 需配置 `WECHAT_SECRET` 与模板 ID；用户须在小程序内点击「订阅进度通知」授权。

---

## 相关文档

- [aliyun-ocr-setup.md](./aliyun-ocr-setup.md) — OCR 与微信订阅详细步骤  
- [e2e-test-checklist.md](./e2e-test-checklist.md) — 端到端测试清单  
- [env.local.template](./env.local.template) — 可复制的 `.env` 模板
