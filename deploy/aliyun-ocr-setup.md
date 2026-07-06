# 阿里云 OCR 配置说明

## 环境变量（.env）

```env
OCR_PROVIDER=aliyun
ALIYUN_ACCESS_KEY_ID=你的AccessKeyId
ALIYUN_ACCESS_KEY_SECRET=你的AccessKeySecret
ALIYUN_OCR_ENDPOINT=ocr-api.cn-hangzhou.aliyuncs.com

# 微信小程序订阅消息
WECHAT_APPID=wxf49b1aeb1d62f227
WECHAT_SECRET=你的小程序Secret
WECHAT_TEMPLATE_INTAKE_AUDIT=审核通知模板ID
WECHAT_TEMPLATE_INTAKE_DISBURSE=放款通知模板ID

PUBLIC_BASE_URL=https://你的域名
```

## 阿里云 OCR 开通步骤

1. 登录 [阿里云控制台](https://www.aliyun.com/)
2. 开通「文字识别 OCR」服务
3. 创建 RAM 用户并授予 `AliyunOCRFullAccess` 权限
4. 将 AccessKey 填入 `.env`
5. 重启 API 服务：`pnpm dev:server`

## 微信订阅消息

1. 微信公众平台 → 功能 → 订阅消息
2. 选用「审核进度」「放款通知」类模板（字段需包含：产品名称、状态、姓名、单号等）
3. 将模板 ID 填入 `.env` 的 `WECHAT_TEMPLATE_INTAKE_AUDIT` / `WECHAT_TEMPLATE_INTAKE_DISBURSE`
4. 小程序在进件首页、消息中心会调用 `wx.requestSubscribeMessage`
5. 模板 ID 由服务端 `/api/v1/config/integrations` 下发，无需改小程序代码

## 联调检测

```bash
# 检查 .env 配置项
node scripts/verify-integrations.js

# 探测本地 API（需先 pnpm dev:server）
node scripts/verify-integrations.js --ping
```

管理后台 → **集成联调** 页面可查看 OCR / 微信 Token / 订阅模板实时状态。

完整业务流程见：`deploy/e2e-test-checklist.md`

## 进件 PDF 导出

管理后台进件详情页点击「导出PDF」，或调用：

`GET /api/v1/intake/admin/pdf/:id`
