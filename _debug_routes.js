// 强制清理并直接启动服务器用于调试
const Module = require('module');
const path = require('path');

// 清除所有 admin.routes 的缓存
Object.keys(require.cache).forEach(key => {
  if (key.includes('admin.routes')) {
    delete require.cache[key];
    console.log('清除缓存:', key);
  }
});

// 重新加载并验证
const routesPath = path.resolve(__dirname, 'apps/server/src/routes/admin.routes.js');
const content = require('fs').readFileSync(routesPath, 'utf8');
console.log('文件长度:', content.length);

// 导出所有 GET 路由路径
const getRoutes = [];
content.split('\n').forEach((line, i) => {
  const m = line.match(/router\.(get|post|patch|delete|put)\(\s*'([^']+)'/);
  if (m) getRoutes.push({line:i+1, method:m[1], path:m[2]});
});

console.log('\n注册的路由列表:');
getRoutes.forEach(r => console.log(`  ${r.method.toUpperCase()} ${r.path} (第${r.line}行)`));
