import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite dev server on port 3000 + proxy to your internal HTTPS API.
// secure:false lets the proxy ignore self-signed/invalid certs on 10.101.100.251.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/kilimostat-api': {
        target: 'https://10.101.100.251',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/kilimostat-api/, '/en/kilimostat-api'),
      },
    },
  },
})
