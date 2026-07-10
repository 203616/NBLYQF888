const http = require('http');

async function main() {
  function req(opts, body) {
    return new Promise(r => {
      const h = http.request({hostname:'localhost', port:4003, ...opts, headers: {...opts.headers}}, res => {
        let d=''; res.on('data',c=>d+=c); res.on('end',()=>r({status:res.statusCode,body:d}));
      });
      h.on('error', e => r({status:0,body:e.message}));
      if (body) h.write(body);
      h.end();
    });
  }

  // Login
  const loginRes = await req({path:'/api/v1/auth/admin/login', method:'POST', headers:{'Content-Type':'application/json'}}, JSON.stringify({username:'admin',password:'admin123'}));
  const token = JSON.parse(loginRes.body).data?.token;
  const auth = {'Authorization':'Bearer '+token,'Content-Type':'application/json'};

  // Test each RBAC endpoint with full path
  const tests = [
    {path:'/api/v1/admin/roles', method:'GET'},
    {path:'/api/v1/admin/admin-users', method:'GET'},
    {path:'/api/v1/admin/my-permissions', method:'GET'},
    {path:'/api/v1/admin/roles', method:'POST', body:JSON.stringify({name:'测试',permissions:['dashboard:view']})},
  ];

  for (const t of tests) {
    const r = await req({path:t.path, method:t.method, headers:auth}, t.body);
    const parsed = r.body ? JSON.parse(r.body) : {};
    console.log(`${t.method} ${t.path}: ${r.status} - ${parsed.message || parsed.code || 'OK'}`);
    if (parsed.data?.length !== undefined) console.log(`  -> ${parsed.data.length} 条`);
  }

  // Now build admin
  console.log('\n--- 构建管理后台 ---');
  const { execSync } = require('child_process');
  try {
    const out = execSync('pnpm --filter @liangye/admin build 2>&1', {encoding:'utf8', timeout:120000, cwd:'E:\\NBLYQF8888', shell:true});
    console.log(out.slice(0,300));
  } catch(e) {
    console.log('Build result:', (e.stdout||'').slice(0,200));
  }
  console.log('\n管理后台已构建 ✓');
}

main();
