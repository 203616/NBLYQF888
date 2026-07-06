// checkFonts.js
const fs = require('fs');
const path = require('path');

// 验证字体文件存在性和路径
function verifyFontPath() {
  // 项目根目录下的fonts文件夹
  const fontDir = path.join(__dirname, 'fonts');
  
  // 检查目录是否存在
  if (!fs.existsSync(fontDir)) {
    console.error('❌ fonts目录不存在:', fontDir);
    return false;
  }
  
  // 检查字体文件是否存在
  const fontPath = path.join(fontDir, 'iconfont.woff2');
  if (!fs.existsSync(fontPath)) {
    console.error('❌ 字体文件不存在:', fontPath);
    return false;
  }
  
  // 检查文件大小
  const stats = fs.statSync(fontPath);
  if (stats.size < 1024) {
    console.warn('⚠️ 字体文件过小（可能损坏）:', stats.size, 'bytes');
    return false;
  }
  
  console.log('✅ 字体文件验证通过:', fontPath);
  return true;
}

// 执行验证
module.exports = verifyFontPath;