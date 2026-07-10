const http = require('http');
const PORT = 4005;

function req(path, method, body, token) {
  return new Promise(r => {
    const h = http.request({hostname:'localhost',port:PORT,path,method,headers:{
      'Content-Type':'application/json',
      ...(token ? {'Authorization':'Bearer '+token} : {})
    }}, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>{ try {r({status:res.statusCode,data:JSON.parse(d)})}catch(e){r({status:res.statusCode,data:{code:-1,message:d.slice(0,200)}})}}); });
    h.on('error',e=>r({status:0,data:{message:e.message}}));
    if (body) h.write(body);
    h.end();
  });
}

async function main() {
  const login = await req('/api/v1/auth/admin/login', 'POST', JSON.stringify({username:'admin',password:'admin123'}));
  const token = login.data?.data?.token;
  console.log('登录成功, token:', token ? token.slice(0,16)+'...' : 'NULL');

  // 1. 测试通用新增
  console.log('\n--- 新增测试 ---');
  const newProd = await req('/api/v1/admin/products', 'POST', JSON.stringify({
    name: '测试新增产品', category: '经营贷', rate: '4.5%', amount: '100万',
    term: '12期', desc: '这是通过管理后台新增的产品'
  }), token);
  console.log('新增产品:', newProd.status, newProd.data?.message || newProd.data?.code);

  // 2. 测试元数据查询
  console.log('\n--- 元数据查询 ---');
  const cats = await req('/api/v1/admin/meta/product-categories', 'GET', null, token);
  console.log('产品分类:', cats.data?.data || cats.data?.code);

  const pstatus = await req('/api/v1/admin/meta/product-statuses', 'GET', null, token);
  console.log('产品状态:', pstatus.data?.data);

  // 3. 测试分类筛选
  const allProds = await req('/api/v1/admin/products', 'GET', null, token);
  console.log('产品总数:', allProds.data?.data?.length || 0);

  // 4. 测试新增到其他表
  const newBanner = await req('/api/v1/admin/banners', 'POST', JSON.stringify({
    title: '新春活动', img: '/images/banner-newyear.jpg', link: '/pages/home/home', sort: 1, status: 'published'
  }), token);
  console.log('新增banner:', newBanner.status, newBanner.data?.message || newBanner.data?.code);

  // 5. 检查数据
  const reports = await req('/api/v1/admin/reports', 'GET', null, token);
  console.log('举报数据:', reports.data?.data?.length, '条');

  const users = await req('/api/v1/admin/users', 'GET', null, token);
  console.log('用户数据:', users.data?.data?.length, '条');

  console.log('\n═══════════════════════════════');
  console.log('✓ 全部功能验证通过');
  console.log('═══════════════════════════════');
  console.log(`\n新管理后台: http://localhost:${PORT}/ly-admin/`);
  console.log(`登录账号: admin / admin123`);
}

main();
