const { execSync } = require('child_process');
const env = {
  ...process.env,
  GIT_AUTHOR_NAME: 'liangye-dev',
  GIT_AUTHOR_EMAIL: 'dev@liangyeqf.com',
  GIT_COMMITTER_NAME: 'liangye-dev',
  GIT_COMMITTER_EMAIL: 'dev@liangyeqf.com'
};
execSync('git commit -m "full-stack audit and refinement"', { env, cwd: __dirname, stdio: 'inherit' });
