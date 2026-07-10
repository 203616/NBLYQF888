const fs = require('fs');
const content = fs.readFileSync('E:/NBLYQF8888/apps/server/src/routes/admin.routes.js', 'utf8');

// 找到每个路由注册的行号
const lines = content.split('\n');
let i = 0;
for (const line of lines) {
  i++;
  const m = line.match(/router\.(get|post|patch|delete|put)\(\s*'([^']+)'/);
  if (m) {
    console.log(`第${i}行: ${m[1].toUpperCase()} '${m[2]}'`);
  }
}
