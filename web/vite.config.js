import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  // Where the Spring Boot API listens. ECONNREFUSED in the terminal = nothing running here.
  const proxyTarget = env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:8080'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        // Same-origin /api in dev → no CORS issues (localhost vs 127.0.0.1, embedded preview, etc.)
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
