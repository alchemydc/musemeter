import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const vercelDevPort = env.VERCEL_DEV_PORT || '3000'
  const allowedHostNames = env.ALLOWED_HOSTNAMES ? env.ALLOWED_HOSTNAMES.split(',') : []

  if (command === 'serve') {
    // Only log during dev server startup
    console.log('\nVite Dev Server Config:')
    console.table({
      Mode: mode,
      'Allowed Hosts': allowedHostNames.join(', ') || 'none',
      'Vercel Dev Port': vercelDevPort
    })
    console.log() // Empty line for spacing
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      allowedHosts: allowedHostNames,
      proxy: command === 'serve' ? {
        '/api': {
          target: `http://127.0.0.1:${vercelDevPort}`,
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: (path) => path.replace(/^\/api/, '/api') // Explicitly rewrite paths if needed
        }
      } : undefined,
      logger: {
        info: true,
        debug: true
      }
    },
    assetsInclude: ['**/*.html'] // Add this line
  }
})
