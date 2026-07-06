// refresh.js
const fs = require('fs');
const path = require('path');

// 通过修改随机文件刷新缓存
function forceRefresh() {
  const flagFile = path.join(__dirname, 'refresh-flag');
  fs.writeFileSync(flagFile, Date.now().toString());
  setTimeout(() => fs.unlinkSync(flagFile), 1000);
  console.log('缓存刷新指令已发送');
}

forceRefresh();