const http = require('http');
function req(opts, body) {
  return new Promise(r => {
    const h = http.request({hostname:'localhost',port:4003,...opts}, res => {
      let d=''; res.on('data',c=>d+=c); res.on('end', ()=> {
        try { r({status:res.statusCode,data:JSON.parse(d)}); }
        catch(e) { r({status:res.statusCode,data:{code:-1,message:d.slice(0,200)}}); }
      });
    });
    h.on('error',e=>r({status:0,data:{message:e.message}}));
    if (body) h.write(body);
    h.end();
  });
}

async function main() {
  const login = await req({path:'/api/v1/auth/admin/login', method:'POST', headers:{'Content-Type':'application/json'}}, JSON.stringify({username:'admin',password:'admin123'}));
  const token = login.data?.data?.token;
  const auth = {'Authorization':'Bearer '+token,'Content-Type':'application/json'};

  // Test all RBAC endpoints
  const tests = [
    ['GET /admin/roles', '/api/v1/admin/roles', 'GET'],
    ['GET /admin/admin-users', '/api/v1/admin/admin-users', 'GET'],
    ['GET /admin/my-permissions', '/api/v1/admin/my-permissions', 'GET'],
    ['PATCH /admin/roles/2', '/api/v1/admin/roles/2', 'PATCH', JSON.stringify({name:'运营编辑(改)', permissions:['dashboard:view','products:list']})],
    ['GET /admin/audit-logs', '/api/v1/admin/audit-logs', 'GET'],
    ['GET /admin/system-status', '/api/v1/admin/system-status', 'GET'],
    ['GET /admin/config-settings', '/api/v1/admin/config-settings', 'GET'],
  ];

  let allOk = true;
  for (const [name, path, method, body] of tests) {
    const r = await req({path, method, headers:auth}, body);
    const pass = r.status === 200 && (r.data?.code === 0 || r.data?.code === 200);
    console.log(`${pass ? '✓' : '✗'} ${name}: ${r.status} ${pass ? 'OK' : (r.data?.message || r.data?.code)}`);
    if (!pass) allOk = false;
  }

  // Check login now includes permissions
  console.log('\n--- 登录信息增强 ---');
  console.log('  roleNames:', login.data?.data?.admin?.roleNames);
  console.log('  permissions:', login.data?.data?.admin?.permissions?.length + '项');

  console.log('\n═══════════════');
  console.log(allOk ? '✓ 全部通过' : '✗ 部分失败');
  console.log('═══════════════\n');
}

main();
