const { execSync } = require('child_process');
try {
  console.log('Building admin...');
  const out = execSync('npx --yes vite build --base=/ly-admin/', {
    cwd: 'E:/NBLYQF8888/apps/admin',
    encoding: 'utf8',
    timeout: 120000,
    shell: true,
    env: { ...process.env, PATH: process.env.PATH }
  });
  console.log(out);
} catch(e) {
  console.error('BUILD ERROR:', e.message);
  console.error('STDOUT:', e.stdout?.slice(0,500));
  console.error('STDERR:', (e.stderr || e.message).slice(0,500));
}
