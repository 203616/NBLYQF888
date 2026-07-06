import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')

function adminBaseRedirectPlugin(basePath) {
  return {
    name: 'admin-base-redirect',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] || ''
        if (url === basePath) {
          res.writeHead(301, { Location: `${basePath}/` })
          res.end()
          return
        }
        if (url === '/' || url === '') {
          res.writeHead(302, { Location: `${basePath}/` })
          res.end()
          return
        }
        next()
      })
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRoot, '')
  const adminBase = (env.ADMIN_BASE_PATH || '/ly-admin').replace(/\/$/, '')
  const adminPort = Number(env.ADMIN_PORT || 5188)
  const apiTarget = env.PUBLIC_BASE_URL || 'http://localhost:3000'

  return {
    envDir: repoRoot,
    base: `${adminBase}/`,
    plugins: [vue(), adminBaseRedirectPlugin(adminBase)],
    server: {
      host: '0.0.0.0',
      port: adminPort,
      strictPort: false,
      open: `${adminBase}/`,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false
        },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
          secure: false
        }
      }
    },
    preview: {
      host: '0.0.0.0',
      port: adminPort,
      open: `${adminBase}/`,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true
        },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true
        }
      }
    }
  }
})
