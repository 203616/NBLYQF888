const fs = require('fs');
const path = require('path');

// 查找所有json文件
const jsonFiles = findFiles('E:/LIANGYE99999', '.json');

jsonFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /"service-card":\s*"\/components\/card\/service-card\/service-card"/g,
    '"service-card": "/components/card/service - card/service - card"'
  );
  fs.writeFileSync(file, content);
});

function findFiles(dir, ext) {
  // 实现递归查找...
}