// 直接在 Node.js 中编程调用 vite build，完全绕开 pnpm lifecycle 检查
import { build } from 'vite'

const result = await build({
  root: 'E:/NBLYQF8888/apps/admin',
  base: '/ly-admin/',
  logLevel: 'info',
  build: {
    outDir: 'E:/NBLYQF8888/apps/admin/dist',
    emptyOutDir: true,
  }
})

console.log('Build 完成:', result)
