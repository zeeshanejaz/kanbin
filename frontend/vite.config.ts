import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all /api/* requests to the Go backend during development.
      // In production, the frontend is served from the same origin as the API.
      '/api': 'http://localhost:8080',
    },
  },
})
