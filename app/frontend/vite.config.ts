import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0', // Allows Vite to be accessed from outside the container
    proxy: {
      '/api': {
        target: 'http://backend:5000', // URL of your backend service within the Docker network
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Removes '/api' prefix before forwarding
      },
    },
  },
  preview: {
    port: 5173,
    host: '0.0.0.0',
  },
})
