const fs = require('fs');
const path = require('path');

const fontPath = path.join(__dirname, 'images/fonts/iconfont.woff2');

// 确保文件存在并设置权限
if (fs.existsSync(fontPath)) {
  fs.chmodSync(fontPath, '755'); // 设置读写权限
  console.log('✅ 字体文件权限已更新');
} else {
  console.error('❌ 字体文件不存在：', fontPath);
}