const { spawnSync } = require('child_process');
const path = require('path');

// 直接在 apps/admin 目录中运行 npx vite build
const result = spawnSync('cmd', ['/c', 'npx vite build --base=/ly-admin/'], {
  cwd: 'E:/NBLYQF8888/apps/admin',
  shell: true,
  timeout: 120000,
  stdio: 'pipe',
  encoding: 'utf8',
  env: { ...process.env, PNPM_SCRIPT_SKIP: 'true' }
});

console.log('STDOUT:', result.stdout?.slice(0, 2000));
console.log('STDERR:', (result.stderr || '').slice(0, 500));
console.log('EXIT:', result.status);

// Check for dist
const fs = require('fs');
const distPath = 'E:/NBLYQF8888/apps/admin/dist/index.html';
console.log('dist exists:', fs.existsSync(distPath));
