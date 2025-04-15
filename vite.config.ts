import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyPort = env.API_PROXY_PORT || '3000'
  const allowedHostNames = env.ALLOWED_HOSTNAMES ? env.ALLOWED_HOSTNAMES.split(',') : []

  if (command === 'serve') {
    // Only log during dev server startup
    console.log('\nVite Dev Server Config:')
    console.table({
      Mode: mode,
      'Allowed Hosts': allowedHostNames.join(', ') || 'none',
      'API Proxy Port': apiProxyPort
    })
    console.log() // Empty line for spacing
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      allowedHosts: allowedHostNames,
      proxy: {
        '/api': {
          target: `http://localhost:${apiProxyPort}`,
          changeOrigin: true,
        }
      },
      logger: {
        info: true,
        debug: true
      }
    }
  }
})
