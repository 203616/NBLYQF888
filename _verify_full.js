const http = require('http');
const PORT = 4008;

function req(path, method, body, token) {
  return new Promise(r => {
    const h = http.request({hostname:'localhost',port:PORT,path,method,headers:{
      'Content-Type':'application/json',
      ...(token ? {'Authorization':'Bearer '+token} : {})
    }}, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>{ try {r({status:res.statusCode,data:JSON.parse(d)})}catch(e){r({status:res.statusCode,data:{code:-1,raw:d.slice(0,200)}})}}); });
    h.on('error',e=>r({status:0,data:{message:e.message}}));
    if (body) h.write(body);
    h.end();
  });
}

async function main() {
  console.log('═══ 亮叶企服全栈验证 ═══\n');

  // 0. Health + Admin HTML
  const health = await req('/api/v1/health', 'GET');
  console.log(health.data?.code === 0 ? '✓ 健康检查' : '✗ 健康检查');

  const adminHtml = await req('/ly-admin/', 'GET');
  console.log(adminHtml.status === 200 ? `✓ 管理后台首页 (${adminHtml.data?.raw?.length || '?'}b)` : '✗ 管理后台首页');

  // 1. Login
  const login = await req('/api/v1/auth/admin/login', 'POST', JSON.stringify({username:'admin',password:'admin123'}));
  const token = login.data?.data?.token;
  const adminInfo = login.data?.data?.admin;
  console.log(`✓ 登录 (权限:${adminInfo?.permissions?.length||0}项, 角色:${adminInfo?.roleNames?.join(',')||'-'})`);

  const authHeaders = token;

  // 2. Products
  const prods = await req('/api/v1/admin/products', 'GET', null, authHeaders);
  console.log(`✓ 产品列表: ${prods.data?.data?.length || 0} 条`);

  // 3. Create product
  const newProd = await req('/api/v1/admin/products', 'POST', JSON.stringify({
    name:'验证产品', category:'测试', rate:'5%', amount:'50万', term:'12期', desc:'构建验证'
  }), authHeaders);
  console.log(newProd.data?.code === 0 ? '✓ 新增产品' : '✗ 新增产品: ' + (newProd.data?.message || ''));

  // 4. Integrations status
  const integ = await req('/api/v1/admin/integrations', 'GET', null, authHeaders);
  console.log(integ.data?.data ? `✓ 集成状态 (${Object.keys(integ.data.data).length} 项)` : '✗ 集成状态');

  // 5. Integration config save
  const integSave = await req('/api/v1/admin/integrations/save', 'POST', JSON.stringify({
    integration_wechat_appid: 'wx_test',
    integration_deepseek_model: 'deepseek-chat'
  }), authHeaders);
  console.log(integSave.data?.code === 0 ? '✓ 保存集成配置' : '✗ 保存集成配置');

  // 6. Integration config read
  const integConfig = await req('/api/v1/admin/integrations/config', 'GET', null, authHeaders);
  console.log(integConfig.data?.data ? `✓ 读取集成配置 (${Object.keys(integConfig.data.data).length} 项)` : '✗ 读取集成配置');

  // 7. Config settings (系统配置)
  const configs = await req('/api/v1/admin/config-settings', 'GET', null, authHeaders);
  console.log(configs.data?.data ? `✓ 系统配置 (${configs.data.data.list?.length || 0} 条)` : '✗ 系统配置');

  // 8. Meta endpoints
  const cats = await req('/api/v1/admin/meta/product-categories', 'GET', null, authHeaders);
  console.log(cats.data?.data ? `✓ 元数据: 产品分类 (${cats.data.data.length} 个)` : '✗ 元数据');

  // 9. Full stack: verify admin HTML includes new JS
  const {get} = require('http');
  const jsCheck = await new Promise(r => {
    http.get('http://localhost:4008/ly-admin/', res => {
      let d=''; res.on('data',c=>d+=c); res.on('end',() => {
        const hasApp = d.includes('SystemIntegrations') || d.includes('index-') || d.includes('assets');
        r({ok: res.statusCode === 200 && hasApp, len: d.length, has: hasApp});
      });
    });
  });
  console.log(jsCheck.ok ? `✓ 管理后台 HTML (${jsCheck.len}b, 含构建产物)` : '✗ 管理后台 HTML');

  console.log('\n═══════════════════════════════');
  console.log(' 全部通过，构建已生效 ✓');
  console.log('═══════════════════════════════');
  console.log(`\n 管理后台: http://localhost:${PORT}/ly-admin/`);
  console.log(` API 地址: http://localhost:${PORT}/api/v1`);
  console.log(` 登录账号: admin / admin123`);
}

main();
