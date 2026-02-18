import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/kilimostat-api': {
        target: 'https://10.101.100.251',
        changeOrigin: true,
        secure: false,
        headers: {
          Host: 'kilimostat.kilimo.go.ke',
        },
        rewrite: (path) => path.replace(/^\/kilimostat-api/, '/en/kilimostat-api'),
      },
    },
  },
})
