# GitHub Actions Secrets 配置（P7-3）

仓库：[203616/NBLYQF888](https://github.com/203616/NBLYQF888)

在 **Settings → Secrets and variables → Actions → New repository secret** 中添加。

---

## Workflow 一览

| Workflow | 文件 | 触发 | 需要 Secrets |
|----------|------|------|--------------|
| **Mini Program Verify** | [`verify.yml`](workflows/verify.yml) | push / PR → main | 无（纯静态 CI） |
| **Publish Mini Program** | [`publish-miniprogram.yml`](workflows/publish-miniprogram.yml) | 手动 workflow_dispatch | 见下表 |

---

## Publish Mini Program 所需 Secrets

| Secret 名称 | 必填 | 说明 |
|-------------|------|------|
| `WECHAT_UPLOAD_PRIVATE_KEY` | ✅ | 小程序代码上传密钥完整 PEM 内容（单行或多行均可） |
| `OSS_REGION` | CDN 上传时 | 如 `oss-cn-hangzhou` |
| `OSS_BUCKET` | CDN 上传时 | OSS Bucket 名称 |
| `OSS_ACCESS_KEY_ID` | CDN 上传时 | 阿里云 AccessKey ID |
| `OSS_ACCESS_KEY_SECRET` | CDN 上传时 | 阿里云 AccessKey Secret |
| `OSS_PREFIX` | 可选 | 静态资源前缀，默认见 `.env.production.example` |

> 触发发布时勾选 **upload_cdn** 才会使用 OSS 相关 Secrets。

---

## 获取 WECHAT_UPLOAD_PRIVATE_KEY

1. 登录 [微信公众平台](https://mp.weixin.qq.com)
2. **开发管理 → 开发设置 → 小程序代码上传**
3. 生成或下载上传密钥（`.key` 文件）
4. 将文件**全文**粘贴为 GitHub Secret（含 `-----BEGIN PRIVATE KEY-----` 行）

Workflow 会在运行时写入 `deploy/private.key`，步骤结束后自动删除。

---

## 手动触发发布

1. GitHub 仓库 → **Actions** → **Publish Mini Program**
2. **Run workflow**
3. 填写版本号、说明，按需勾选「同时上传 CDN 到 OSS」

---

## CI 状态徽章（可选）

在 README 中加入（替换为实际仓库路径）：

```markdown
![CI](https://github.com/203616/NBLYQF888/actions/workflows/verify.yml/badge.svg)
```

---

## 与服务器 .env 的关系

| 场景 | 配置位置 |
|------|----------|
| GitHub 自动上传小程序 | GitHub Secrets（上表） |
| 生产 API 服务器 | 服务器 `.env`（见 [`deploy/production-secrets.md`](../deploy/production-secrets.md)） |
| 本地开发 | 复制 `.env.example` 或 `.env.production.example` |

两者独立：CI 发布小程序**不需要**在 GitHub 配置 `WECHAT_SECRET` 或数据库密钥。
