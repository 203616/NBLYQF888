# 亮叶企服 - 微信云托管 (CloudRun) 部署指南

## 环境信息

| 项目 | 值 |
|------|-----|
| 环境 ID | `prod-2g0e58nv8af29b4b` |
| 服务名称 | `express-gfke` |
| 网关地址 | `https://prod-2g0e58nv8af29b4b.service.tcloudbase.com/express-gfke` |
| API 地址 | `https://prod-2g0e58nv8af29b4b.service.tcloudbase.com/express-gfke/api/v1` |
| 管理后台 | `https://prod-2g0e58nv8af29b4b.service.tcloudbase.com/express-gfke/ly-admin/` |
| 移动端 H5 | `https://prod-2g0e58nv8af29b4b.service.tcloudbase.com/express-gfke/mobile/` |

---

## 一、前置条件

1. 微信小程序 AppId: `wxf49b1aeb1d62f227`（已在 `.env` 和 `project.config.json` 中配置）
2. 已在微信公众平台开通「云开发」/「云托管」并创建环境 `prod-2g0e58nv8af29b4b`
3. 安装 Docker Desktop（本地构建镜像用）
4. 安装微信开发者工具（上传小程序代码用）

---

## 二、构建并推送 Docker 镜像

### 2.1 先构建管理后台

```bash
# 在项目根目录执行
pnpm build:admin
# 输出: apps/admin/dist/
```

### 2.2 构建 Docker 镜像

```bash
# 构建镜像（标签建议使用日期+版本）
docker build -t ccr.ccs.tencentyun.com/liangye/express-gfke:$(date +%Y%m%d)-v1 .

# 登录腾讯云容器镜像服务
docker login ccr.ccs.tencentyun.com --username=你的腾讯云账号

# 推送镜像
docker push ccr.ccs.tencentyun.com/liangye/express-gfke:$(date +%Y%m%d)-v1
```

### 2.3 在云托管控制台配置服务

1. 打开微信云托管控制台：https://cloud.weixin.qq.com/cloudrun/service/express-gfke
2. 选择环境 `prod-2g0e58nv8af29b4b`
3. 创建/更新服务 `express-gfke`
   - **镜像地址**: `ccr.ccs.tencentyun.com/liangye/express-gfke:<tag>`
   - **端口**: `80`
   - **CPU/内存**: 1核 / 1G（推荐）
   - **最小实例**: 0（无请求时缩到0，节省费用）
   - **最大实例**: 5

---

## 三、配置环境变量

在云托管控制台 > 服务 `express-gfke` > 环境变量 中设置以下变量：

> 参考 `cloud.env.example` 文件，复制全部内容到控制台

### 关键变量（必须配置）

| 变量 | 值 | 说明 |
|------|-----|------|
| `NODE_ENV` | `production` | 运行模式 |
| `JWT_SECRET` | (从 .env 复制) | JWT 密钥 |
| `PORT` | `80` | 容器监听端口 |
| `ADMIN_BASE_PATH` | `/ly-admin` | 管理后台路径 |
| `WECHAT_APPID` | `wxf49b1aeb1d62f227` | 小程序 AppId |
| `WECHAT_SECRET` | (从微信公众平台获取) | ⚠️ 必须配置，否则微信登录不可用 |

### 数据持久化（SQLite）

云托管的容器文件系统是临时性的，重启后数据丢失。需配置**数据卷挂载**：

1. 在云托管控制台 > 服务配置 > 存储挂载
2. 添加挂载：
   - **容器路径**: `/app/apps/server/data`
   - **云存储路径**: 选择或新建 PV（推荐 1Gi）
3. 重启服务使挂载生效

> 如数据量较大，建议迁移至云数据库 MySQL（可通过 `DATABASE_URL` 环境变量切换）

---

## 四、上传小程序代码

1. 打开微信开发者工具
2. 选择小程序项目（AppId: `wxf49b1aeb1d62f227`）
3. 点击「上传」按钮
4. 选择「开发版」或「体验版」
5. 在微信公众平台提交「审核发布」

---

## 五、验证部署

### 5.1 检查服务是否正常运行

访问以下地址，验证服务响应：

```bash
# 健康检查
curl https://prod-2g0e58nv8af29b4b.service.tcloudbase.com/express-gfke/api/v1/health

# 预期返回: {"code":0,"message":"ok","data":{"service":"liangye-api"}}
```

### 5.2 小程序内验证

1. 在开发者工具中，将 `project.config.json` 的 `urlCheck` 设为 `false`（开发阶段）
2. 或在微信公众平台配置「合法域名」白名单：
   - `https://prod-2g0e58nv8af29b4b.service.tcloudbase.com`

### 5.3 验证移动端 H5

访问: `https://prod-2g0e58nv8af29b4b.service.tcloudbase.com/express-gfke/mobile/`

---

## 六、CI/CD 自动化（可选）

在项目根目录已创建以下自动化配置文件：

| 文件 | 用途 |
|------|------|
| `Dockerfile` | 容器镜像构建 |
| `.dockerignore` | 构建排除项 |
| `cloudbaserc.json` | CloudBase 框架配置 |
| `cloud.env.example` | 环境变量模板 |

可在 CI 中执行：

```bash
# 构建
pnpm build:admin
docker build -t express-gfke:latest .

# 推送
docker push ccr.ccs.tencentyun.com/liangye/express-gfke:latest

# 通知云托管拉取新镜像（需要在云托管控制台手动操作）
```

---

## 七、费用预估（参考）

| 资源 | 规格 | 预估月费 |
|------|------|---------|
| 容器实例 | 1核1G × 0~5实例 | ¥30~150 |
| 数据卷 | 1Gi | ¥0 |
| 数据库（可选） | 云MySQL 1核1G | ¥50~100 |
| **合计** | | **¥30~250/月** |

---

## 八、常见问题

**Q: 部署后访问返回 502/503？**
A: 检查 Dockerfile 是否正确构建，端口是否与服务配置一致（当前使用 80 端口）。在云托管控制台查看服务日志。

**Q: SQLite 数据在重启后丢失？**
A: 必须配置数据卷挂载（见第三章节）。重启前请确认挂载已生效。

**Q: 小程序无法连接到云托管服务？**
A: 检查以下配置：
1. `utils/config.js` 中 `PRODUCTION_API_BASE` 是否为正确的网关地址
2. 微信公众平台是否已配置合法域名白名单
3. 云托管服务状态是否为「运行中」

**Q: 如何查看日志？**
A: 在云托管控制台 > 服务 `express-gfke` > 日志 中查看实时日志。
