const { execSync } = require('child_process');
const fs = require('fs');

// Remove old dist
const distPath = 'E:/NBLYQF8888/apps/admin/dist';
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
  console.log('已删除旧 dist');
}

// Build using node directly with vite's API
console.log('开始构建管理后台...');
try {
  const out = execSync('node node_modules/.pnpm/vite@6.3.5_@types+node@22.15.2/node_modules/vite/bin/vite.js build --base=/ly-admin/', {
    cwd: 'E:/NBLYQF8888/apps/admin',
    encoding: 'utf8',
    timeout: 120000,
    shell: 'cmd.exe',
    env: { ...process.env, PNPM_SCRIPT_SKIP: 'true', PATH: process.env.PATH }
  });
  console.log('构建输出:', out.slice(0, 500));
} catch (e) {
  console.log('构建失败:', e.message?.slice(0, 300));
  console.log('stdout:', (e.stdout || '').slice(0, 500));
}

// Check result
const exists = fs.existsSync('E:/NBLYQF8888/apps/admin/dist/index.html');
console.log('dist/index.html 存在:', exists);
if (exists) {
  const files = fs.readdirSync('E:/NBLYQF8888/apps/admin/dist/assets');
  console.log('构建产物:', files.join(', '));
}
