const http = require('http');

async function main() {
  function req(hostOpts, path, method, body, authToken) {
    const headers = {'Content-Type':'application/json'};
    if (authToken) headers['Authorization'] = 'Bearer ' + authToken;
    return new Promise(r => {
      const h = http.request({hostname:'localhost',port:4003,path,method,headers}, res => {
        let d=''; res.on('data',c=>d+=c); res.on('end',()=>r({status:res.statusCode,body:d}));
      });
      h.on('error',e=>r({status:0,body:e.message}));
      if (body) h.write(body);
      h.end();
    });
  }

  // Login
  const login = await req({}, '/api/v1/auth/admin/login', 'POST', JSON.stringify({username:'admin',password:'admin123'}));
  const token = JSON.parse(login.body).data?.token;
  console.log('Token:', token ? token.slice(0,20)+'...' : 'NULL');

  const auth = token;

  // Now test with auth
  const testPaths = [
    '/api/v1/admin/roles',
    '/api/v1/admin/admin-users',
    '/api/v1/admin/my-permissions',
  ];

  for (const p of testPaths) {
    const r = await req({}, p, 'GET', null, auth);
    const json = safeParse(r.body);
    console.log(`GET ${p}: ${r.status}`, json.code === 0 ? `OK (${json.data?.length || JSON.stringify(json.data).length} items)` : `FAIL: ${json.message}`);
  }

  // POST role
  const r2 = await req({}, '/api/v1/admin/roles', 'POST', JSON.stringify({name:'test',permissions:['dashboard:view']}), auth);
  const j2 = safeParse(r2.body);
  console.log(`POST /api/v1/admin/roles: ${r2.status}`, j2.code === 0 ? 'OK' : `FAIL: ${j2.message}`);
}

function safeParse(s) {
  try { return JSON.parse(s) } catch(e) { return {code:-1, message: s.trim().slice(0,100)} }
}

main();
