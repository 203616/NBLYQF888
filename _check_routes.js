const fs = require('fs');
const c = fs.readFileSync('E:/NBLYQF8888/apps/server/src/routes/admin.routes.js', 'utf8');
console.log('文件大小:', c.length);
console.log('包含 bcrypt:', c.includes('bcryptjs'));
console.log('包含 /admin-users:', c.includes("'/admin-users'"));
console.log('包含 RBAC 专用路由:', c.includes("// =============================================") && c.includes("RBAC"));
const idx = c.indexOf('RBAC');
if (idx >= 0) console.log('RBAC 部分前50字:', c.slice(Math.max(0, idx-30), idx+100));
