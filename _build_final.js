const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const distPath = 'E:/NBLYQF8888/apps/admin/dist';
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
  console.log('已删除旧 dist');
}

const pnpmDir = 'E:/NBLYQF8888/node_modules/.pnpm';
const viteDirs = fs.readdirSync(pnpmDir).filter(d => d.startsWith('vite@'));
if (!viteDirs.length) throw new Error('vite not found');
const viteDir = viteDirs.sort().pop();
const viteBin = path.join(pnpmDir, viteDir, 'node_modules', 'vite', 'bin', 'vite.js');
console.log('使用 vite:', viteBin);

const out = execSync(`node "${viteBin}" build --base=/ly-admin/`, {
  cwd: 'E:/NBLYQF8888/apps/admin',
  encoding: 'utf8',
  timeout: 120000,
  shell: 'cmd.exe'
});
console.log(out.slice(0, 1000));

const exists = fs.existsSync('E:/NBLYQF8888/apps/admin/dist/index.html');
console.log('构建完成, dist/index.html:', exists);
if (exists) {
  const assets = fs.readdirSync('E:/NBLYQF8888/apps/admin/dist/assets');
  console.log('构建产物:', assets.join(', '));
}
