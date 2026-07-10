#!/bin/bash
# 亮叶企服 - 服务器一键部署脚本
# 在服务器上以 root 或 sudo 用户执行

set -e

echo "========================================"
echo "  亮叶企服 - 服务器一键部署"
echo "  域名: nblyqf.com"
echo "  服务器: 82.157.65.149"
echo "========================================"

# ============================================
# 1. 安装系统依赖
# ============================================
echo "[1/8] 安装系统依赖..."
apt-get update
apt-get install -y nginx curl git snapd

# ============================================
# 2. 安装 Node.js 22
# ============================================
echo "[2/8] 安装 Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
fi
echo "Node.js $(node --version)"
echo "npm $(npm --version)"

# ============================================
# 3. 克隆代码
# ============================================
echo "[3/8] 克隆代码..."
cd /home/ubuntu
if [ -d "ly-app" ]; then
    cd ly-app && git pull
else
    git clone https://github.com/203616/NBLYQF888.git ly-app
    cd ly-app
fi

# ============================================
# 4. 安装 pnpm 和依赖
# ============================================
echo "[4/8] 安装 pnpm 和项目依赖..."
npm install -g pnpm
pnpm install --filter @liangye/server

# ============================================
# 5. 初始化数据库
# ============================================
echo "[5/8] 初始化数据库..."
cd /home/ubuntu/ly-app/apps/server

# 复制环境变量
cp /home/ubuntu/ly-app/.env .env 2>/dev/null || true

# 确保 .env 包含生产配置
cat > .env << 'ENVEOF'
PORT=4008
NODE_ENV=production
JWT_SECRET=your-jwt-secret-here
DB_PATH=apps/server/data/liangye.db
UPLOADS_DIR=apps/server/uploads
PUBLIC_BASE_URL=https://nblyqf.com
API_BASE_URL=https://nblyqf.com/api/v1
ADMIN_BASE_PATH=/ly-admin
WECHAT_APPID=wxf49b1aeb1d62f227
# ⚠️ 部署后请替换为实际的 DeepSeek API Key
# DEEPSEEK_API_KEY=your-deepseek-api-key
DEEPSEEK_MODEL=deepseek-chat
AI_DEFAULT_PROVIDER=deepseek
ESIG_API_URL=https://qbq2024.market.alicloudapi.com/api/task/taskDetail
ENVEOF

# 初始化数据库
node src/db/seed.js

# ============================================
# 6. 配置 Nginx（先HTTP模式，certbot后续改HTTPS）
# ============================================
echo "[6/8] 配置 Nginx..."

# 先配置 HTTP 模式（为了 certbot 验证域名）
cat > /etc/nginx/sites-enabled/nblyqf.conf << 'NGINX'
server {
    listen 80;
    server_name nblyqf.com www.nblyqf.com;

    location / {
        proxy_pass http://127.0.0.1:4008;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location ~* \.(jpg|jpeg|png|gif|ico|webp|svg|css|js|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:4008;
        proxy_set_header Host $host;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

# 删除默认配置
rm -f /etc/nginx/sites-enabled/default

# 测试配置
nginx -t && systemctl restart nginx

# ============================================
# 7. 申请 Let's Encrypt SSL 证书（自动）
# ============================================
echo "[7/8] 配置 SSL 证书（Let's Encrypt）..."

# 安装 certbot
snap install core; snap refresh core
snap install --classic certbot
ln -sf /snap/bin/certbot /usr/bin/certbot

# 申请证书（自动验证域名）
certbot --nginx -d nblyqf.com -d www.nblyqf.com --non-interactive --agree-tos --email admin@nblyqf.com || {
    echo ""
    echo "================================================"
    echo "  ⚠️  Let's Encrypt 自动申请失败"
    echo "  请确保域名 nblyqf.com 已正确解析到 82.157.65.149"
    echo "  您可以稍后手动运行："
    echo "  sudo certbot --nginx -d nblyqf.com -d www.nblyqf.com"
    echo "================================================"
}

# ============================================
# 8. 配置 PM2 进程管理
# ============================================
echo "[8/8] 配置 PM2 进程管理..."
npm install -g pm2

cd /home/ubuntu/ly-app/apps/server
pm2 delete ly-app 2>/dev/null || true
pm2 start src/server.js --name ly-app

# 保存 PM2 配置
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || true

echo ""
echo "========================================"
echo "  ✅ 部署完成！"
echo "========================================"
echo ""
echo "  访问地址："
echo "  - 网站:     https://nblyqf.com"
echo "  - 管理后台: https://nblyqf.com/ly-admin"
echo "  - API:      https://nblyqf.com/api/v1"
echo ""
echo "  管理命令："
echo "  - 查看日志: pm2 logs ly-app"
echo "  - 重启服务: pm2 restart ly-app"
echo "  - 重启Nginx: systemctl restart nginx"
echo ""
echo "========================================"
