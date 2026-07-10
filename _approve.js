const { execSync } = require('child_process');
const fs = require('fs');

process.chdir('E:\\NBLYQF8888');

// Read current package.json
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Set pnpm.onlyBuiltDependencies to allow all current ones
const deps = ['@parcel/watcher', '@swc/core', 'core-js', 'less', 'protobufjs'];
if (!pkg.pnpm) pkg.pnpm = {};
if (!pkg.pnpm.onlyBuiltDependencies) pkg.pnpm.onlyBuiltDependencies = [];
for (const dep of deps) {
  if (!pkg.pnpm.onlyBuiltDependencies.includes(dep)) {
    pkg.pnpm.onlyBuiltDependencies.push(dep);
  }
}

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('已添加 approved builds 到 package.json');

// Now try to install
try {
  const out = execSync('pnpm install 2>&1', { encoding: 'utf8', timeout: 120000, cwd: 'E:\\NBLYQF8888' });
  console.log('pnpm install 输出:', out.slice(0, 500));
} catch (e) {
  console.log('install error:', (e.stdout || '').slice(-300));
}

// Test if vite can now start
console.log('\n检查 vite 是否可用...');
try {
  const out = execSync('pnpm --filter @liangye/admin dev 2>&1', {
    encoding: 'utf8', timeout: 15000, cwd: 'E:\\NBLYQF8888'
  });
  console.log(out.slice(0, 500));
} catch (e) {
  const out = (e.stdout || '') + (e.stderr || '');
  console.log('vite 输出:', out.slice(0, 1000));
}

console.log('\n完成');
