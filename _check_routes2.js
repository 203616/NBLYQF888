const http = require('http');

async function main() {
  function req(path, method, body) {
    return new Promise(r => {
      const h = http.request({hostname:'localhost', port:4003, path, method, headers:{'Content-Type':'application/json'}}, res => {
        let d=''; res.on('data',c=>d+=c); res.on('end',()=>r({status:res.statusCode,body:d,msg: res.statusMessage}));
      });
      h.on('error', e => r({status:0,body:e.message}));
      if (body) h.write(body);
      h.end();
    });
  }

  // Login
  const login = await req('/api/v1/auth/admin/login', 'POST', JSON.stringify({username:'admin',password:'admin123'}));
  const token = JSON.parse(login.body).data?.token;
  const path = p => '/api/v1/admin' + p;

  // Try various paths
  const tests = [
    '/roles',
    '/admin-users',
    '/my-permissions',
  ];

  for (const p of tests) {
    const r = await req(path(p), 'GET');
    console.log(`GET ${path(p)}: ${r.status} - ${r.body.slice(0,200)}`);
  }

  // Also try POST
  const r = await req('/api/v1/admin/roles', 'POST', JSON.stringify({name:'test',permissions:[]}));
  console.log(`POST /api/v1/admin/roles: ${r.status} - ${r.body.slice(0,200)}`);
}

main();
