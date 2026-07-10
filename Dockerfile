# ============================================
# 亮叶企服 - WeChat CloudRun (云托管) Dockerfile
# 多阶段构建，适用于 微信云托管 部署
# 构建步骤：
#   1. pnpm install --frozen-lockfile --filter @liangye/server
#   2. 复制构建产物到精简运行镜像
# ============================================
FROM node:22-alpine AS runner

RUN apk add --no-cache tini

WORKDIR /app

# 复制依赖描述文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/package.json

# 安装 pnpm 并安装依赖
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# 复制服务端代码
COPY apps/server/src ./apps/server/src
COPY apps/server/data ./apps/server/data

# 复制管理后台构建产物
COPY apps/admin/dist ./apps/admin/dist

# 复制移动端 H5
COPY apps/mobile ./apps/mobile

# 复制 CDN 静态资源
COPY deploy/cdn-staging ./deploy/cdn-staging

# 确保数据目录存在
RUN mkdir -p apps/server/uploads

# 云托管默认端口（控制台可覆盖）
ENV NODE_ENV=production
ENV PORT=80
ENV ADMIN_BASE_PATH=/ly-admin

EXPOSE 80

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/server/src/server.js"]
