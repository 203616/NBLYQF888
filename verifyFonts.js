// E:/LIANGYE99999/verifyFonts.js
const fs = require('fs');
const path = require('path');

// 验证字体文件存在性
function verifyFontFile() {
  const fontPath = path.join(__dirname, 'images/fonts/iconfont.woff2');
  
  if (!fs.existsSync(fontPath)) {
    console.error('❌ 字体文件不存在:', fontPath);
    return false;
  }
  
  // 检查文件大小（至少1KB）
  const stats = fs.statSync(fontPath);
  if (stats.size < 1024) {
    console.warn('⚠️ 字体文件过小（可能损坏）:', stats.size, 'bytes');
    return false;
  }
  
  console.log('✅ 字体文件验证通过');
  return true;
}

module.exports = verifyFontFile;