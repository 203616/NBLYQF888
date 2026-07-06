// forceRefresh.js
const fs = require('fs');
const path = require('path');

// 创建刷新标识文件
const flagFile = path.join(__dirname, '.force-refresh');
fs.writeFileSync(flagFile, Date.now().toString());

setTimeout(() => {
  fs.unlinkSync(flagFile);
  console.log('缓存强制刷新完成');
}, 1000);