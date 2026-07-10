const { spawn } = require('child_process');
const http = require('http');
const net = require('net');

process.chdir('E:\\NBLYQF8888');

// Check if 5200 is free first
function checkPort(port) {
  return new Promise(r => {
    const s = net.createServer();
    s.once('error', () => { console.log(`端口 ${port}: 已被占用 ❌`); r(false); });
    s.once('listening', () => { s.close(); console.log(`端口 ${port}: 空闲 ✓`); r(true); });
    s.listen(port);
  });
}

async function main() {
  // Check all relevant ports
  const ports = { 'API后端': 4003, '管理后台dev': 5200 };
  for (const [name, port] of Object.entries(ports)) {
    const free = await checkPort(port);
    if (!free) {
      console.log(`❌ ${name} 端口 ${port} 被占用！`);
    }
  }

  console.log('\n=== 启动 API 后端 (Express 托管 SPA) ===');
  const apiServer = spawn('node', ['apps/server/src/server.js'], {
    cwd: 'E:\\NBLYQF8888', stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: '4003', NODE_ENV: 'development' }
  });
  apiServer.stdout.on('data', d => process.stdout.write('  ' + d.toString()));
  apiServer.stderr.on('data', d => {});

  // Wait for api server to be ready
  await new Promise(r => setTimeout(r, 2000));

  console.log('\n=== 测试管理后台 (Express 托管) ===');
  const r1 = await fetchUrl('http://localhost:4003/ly-admin/');
  console.log(`  GET /ly-admin/: ${r1.status} (${r1.data.length}b) - ${r1.status === 200 ? '✓' : '✗'}`);
  
  console.log('\n=== 启动 Vite 开发服务器 ===');
  const viteServer = spawn('pnpm', ['dev:admin'], {
    cwd: 'E:\\NBLYQF8888', stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    env: { ...process.env }
  });
  viteServer.stdout.on('data', d => process.stdout.write('  VITE: ' + d.toString()));
  viteServer.stderr.on('data', d => {});

  // Wait for vite to start
  await new Promise(r => setTimeout(r, 8000));

  console.log('\n=== 测试 Vite 管理后台 ===');
  const r2 = await fetchUrl('http://localhost:5200/ly-admin/');
  console.log(`  GET /ly-admin/: ${r2.status} (${r2.data.length}b)`);
  if (r2.status === 200 && r2.data.length > 100) {
    console.log('  ✓ Vite 开发服务器正常');
  } else {
    console.log('  ✗ Vite 开发服务器异常');
  }

  // Test login API
  console.log('\n=== 测试管理后台登录 API ===');
  const loginRes = await new Promise(r => {
    const data = JSON.stringify({ username: 'admin', password: 'admin123' });
    const req = http.request({
      hostname:'localhost', port:4003, path:'/api/v1/auth/admin/login',
      method:'POST',
      headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(data)}
    }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>r(JSON.parse(d))); });
    req.write(data); req.end();
  });
  console.log(`  登录: ${loginRes.code === 0 ? '✓ 成功' : '✗ 失败'}`);

  console.log('\n═══ 总结 ═══');
  console.log('  管理后台 (生产): http://localhost:4003/ly-admin/');
  console.log('  管理后台 (开发): http://localhost:5200/ly-admin/');
  console.log('  API:            http://localhost:4003/api/v1');
  console.log('  账号:           admin / admin123\n');

  // Keep running
}

function fetchUrl(url) {
  return new Promise(r => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => r({ status: res.statusCode, data }));
    }).on('error', e => r({ status: 0, data: e.message }));
  });
}

main();
