# DeepSeek AI 接入配置指南

亮叶企服智能客服通过服务端调用 [DeepSeek API](https://platform.deepseek.com/)，小程序在 `development` / `production` 模式下走真实接口。

## 1. 获取 API Key

1. 登录 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 创建 API Key
3. 复制 Key（仅显示一次，请妥善保存）

## 2. 配置环境变量

在项目根目录 `.env` 中设置：

```env
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
DEEPSEEK_MODEL=deepseek-chat
```

| 变量 | 说明 |
|------|------|
| `DEEPSEEK_API_KEY` | DeepSeek 平台颁发的密钥，留空则自动降级为本地 FAQ |
| `DEEPSEEK_MODEL` | 推荐 `deepseek-chat`（通用对话）；也可使用 `deepseek-reasoner` |

可参考根目录 `.env.example` 模板。

## 3. 启动服务

```bash
pnpm dev:server   # API :3000
# 或
pnpm dev          # API + 管理后台
```

## 4. 小程序联调

`utils/config.js` 中设置：

```javascript
const MANUAL_ENV = 'development'
```

确保 `apiBaseUrl` 指向 `http://localhost:3000/api/v1`，且 `useMockFallback: false`。

微信开发者工具需勾选「不校验合法域名」以便本地调试。

## 5. 验证

1. 打开小程序「智能客服」页面
2. 发送：「宁波银行容易贷需要什么材料？」
3. 回复来源应显示 **AI 智能回复**（`source: deepseek`）

也可直接测试 API：

```bash
curl -X POST http://localhost:3000/api/v1/service/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"平台是否收取前置费用？\"}"
```

返回 `source` 为 `deepseek` 表示接入成功；为 `faq-fallback` 表示 Key 未配置或调用失败。

## 6. 合规说明

系统提示词已内置合规约束（见 `apps/server/src/services/aiChat.service.js`）：

- 不承诺放款、额度、利率
- 不诱导前置收费
- 涉及产品条件时提示以持牌机构合同为准

## 7. 常见问题

| 现象 | 处理 |
|------|------|
| 回复来源为「常见问题库」 | 检查 `DEEPSEEK_API_KEY` 是否写入 `.env` 并重启 API |
| 网络错误 | 确认 API 已启动、小程序 `MANUAL_ENV` 为 `development` |
| 模型报错 | 将 `DEEPSEEK_MODEL` 改为 `deepseek-chat` |
