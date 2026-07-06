# 生产密钥配置指南（P2）

> 模板文件：根目录 [`.env.production.example`](../.env.production.example)  
> GitHub Actions：[`.github/SECRETS.md`](../.github/SECRETS.md)  
> 域名清单：[`deploy/deploy.config.json`](deploy.config.json) → 运行 `pnpm sync:prod` 生成微信域名 JSON

---

## 一、快速上手（5 步）

```bash
# 1. 从模板创建 .env（.env 已在 .gitignore，不会进 Git）
cp .env.production.example .env

# 2. 编辑 .env，填写「必填」项（见下表）

# 3. 静态校验密钥模板完整性
pnpm verify:env

# 4. 同步小程序生产 API / CDN 地址
pnpm sync:prod

# 5. 启动并探测集成（可选）
pnpm dev:server
pnpm verify:integrations --ping
```

---

## 二、必填项清单

| 变量 | 用途 | 获取位置 |
|------|------|----------|
| `JWT_SECRET` | 后台登录 Token 签名 | 自行生成 ≥32 位随机串 |
| `PUBLIC_BASE_URL` | 进件材料公网 URL 前缀 | 如 `https://api.liangyeqf.com` |
| `WECHAT_APPID` | 小程序 AppID | 微信公众平台 → 开发管理 |
| `WECHAT_SECRET` | 小程序 Secret | 同上（重置后旧 Secret 失效） |
| `WECHAT_TEMPLATE_*` | 订阅消息模板 | 公众平台 → 功能 → 订阅消息 |
| `ALIYUN_ACCESS_KEY_ID` | OCR / 内容安全 | 阿里云 RAM → AccessKey |
| `ALIYUN_ACCESS_KEY_SECRET` | 同上 | 同上 |

### 建议生产开启

| 变量 | 说明 |
|------|------|
| `ALIYUN_GREEN_ENABLED=true` | 融圈文本/图片云审核 |
| `USE_CDN_IMAGES=true` + `OSS_*` | 静态图走 CDN（需先 `pnpm upload:cdn`） |
| `WECHAT_UPLOAD_PRIVATE_KEY*` | 体验版/正式版代码上传 |

---

## 三、微信公众平台域名

运行 `pnpm sync:prod` 后查看：

- [`deploy/wechat-domain-config.json`](wechat-domain-config.json)
- [`deploy/wechat-checklist.txt`](wechat-checklist.txt)

在 **开发 → 开发管理 → 开发设置 → 服务器域名** 中配置：

| 类型 | 生产值（示例） |
|------|----------------|
| request 合法域名 | `https://api.liangyeqf.com` |
| uploadFile 合法域名 | `https://api.liangyeqf.com` |
| downloadFile 合法域名 | `https://api.liangyeqf.com`、`https://cdn.liangyeqf.com` |

---

## 四、阿里云开通步骤

### 4.1 OCR（进件身份证/营业执照识别）

1. 开通 [文字识别 OCR](https://www.aliyun.com/product/ocr)
2. 创建 RAM 子账号，授予 `AliyunOCRFullAccess`
3. 写入 `.env`：`ALIYUN_ACCESS_KEY_ID`、`ALIYUN_ACCESS_KEY_SECRET`

### 4.2 内容安全 Green（融圈审核）

1. 开通 [内容安全](https://www.aliyun.com/product/lvwang)
2. 同一 AccessKey 可复用（或单独 RAM 策略 `AliyunYundunGreenWebFullAccess`）
3. 设置 `ALIYUN_GREEN_ENABLED=true`

---

## 五、订阅消息模板字段

在公众平台创建模板后，将模板 ID 写入 `.env`：

| 环境变量 | 场景 |
|----------|------|
| `WECHAT_TEMPLATE_INTAKE_AUDIT` | 进件审核结果通知 |
| `WECHAT_TEMPLATE_INTAKE_DISBURSE` | 进件放款通知 |
| `WECHAT_TEMPLATE_FINANCE_REVIEW` | 融圈动态审核结果 |

小程序端需用户授权订阅；后台 **系统 → 集成联调** 可查看配置状态。

---

## 六、OSS / CDN（可选）

```bash
# 1. .env 配置 OSS_* 与 CDN_BASE_URL
# 2. deploy.config.json 设置 useCdnImages: true
pnpm sync:prod
pnpm prepare:cdn
pnpm upload:cdn:dry    # 预检
pnpm upload:cdn        # 正式上传
```

---

## 七、小程序代码上传

### 本地

```bash
# 将上传密钥保存为 deploy/private.key（已在 .gitignore）
pnpm upload:mp:dry
pnpm upload:mp:preview   # 生成体验版二维码 deploy/preview-qrcode.jpg
pnpm upload:mp           # 上传并设为体验版
```

### GitHub Actions

见 [`.github/SECRETS.md`](../.github/SECRETS.md)，在仓库 Settings → Secrets 配置后，手动触发 **Publish Mini Program** workflow。

---

## 八、生产部署检查

```bash
pnpm verify:env              # 模板完整性
pnpm verify:production       # 发布前门禁
pnpm release:checklist       # 正式版清单
pnpm ci:verify               # 与 GitHub Actions 相同静态 CI
```

---

## 九、安全提醒

- **切勿**将 `.env`、`deploy/private.key` 提交到 Git
- 生产 `JWT_SECRET` 与开发环境必须不同
- AccessKey 建议使用 RAM 子账号 + 最小权限
- GitHub Secrets 仅用于 CI 发布，服务器 `.env` 单独管理
