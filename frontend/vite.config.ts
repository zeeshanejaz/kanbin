import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'
import type { Connect } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      // Dev-server middleware — mirrors Nginx routing rules for local development:
      //   GET /          → serve public/index.html (static landing page)
      //   GET /b/*       → serve app.html (React SPA)
      //   GET /home      → serve app.html (React SPA)
      // In production, Nginx handles these rules instead.
      name: 'landing-and-spa-routing',
      configureServer(server) {
        const landingHtml = resolve(__dirname, 'public/index.html')
        const middleware: Connect.NextHandleFunction = (req, res, next) => {
          const url = req.url ?? '/'
          // Exact root → static landing page
          if (url === '/' || url === '/?') {
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(fs.readFileSync(landingHtml, 'utf-8'))
            return
          }
          // SPA routes → rewrite to app.html so Vite transforms it
          if (url.startsWith('/b/') || url === '/home' || url.startsWith('/home?')) {
            req.url = '/app.html'
          }
          next()
        }
        server.middlewares.use(middleware)
      },
    },
  ],
  // Use app.html as the SPA entry so that Vite's build output is dist/app.html.
  // The static landing page lives at frontend/public/index.html and is copied
  // verbatim to dist/index.html by Vite's public-dir handling.
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'app.html'),
    },
  },
  server: {
    proxy: {
      // Proxy all /api/* requests to the Go backend during development.
      // In production, the frontend is served from the same origin as the API.
      '/api': 'http://localhost:8080',
    },
  },
})
