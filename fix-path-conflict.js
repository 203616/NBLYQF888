// fix-path-conflict.js
const fs = require('fs');
const path = require('path');

function fixFontPathInFiles() {
  const files = [
    'app.wxss',
    'app.js',
    'pages/**/*.wxss',
    'pages/**/*.js',
    'components/**/*.wxss',
    'components/**/*.js'
  ];
  
  // 替换所有错误的字体路径
  const regex = /['"](?:\/images\/fonts|\.\/images\/fonts)[^\1]*iconfont\.woff2['"]/g;
  const correctPath = '"/fonts/iconfont.woff2"';
  
  files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(regex, correctPath);
      fs.writeFileSync(filePath, content);
    }
  });
  
  console.log('✅ 字体路径强制修复完成');
}

fixFontPathInFiles();