import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Middleware to serve static files (SVGs, PNGs, CSVs, WebP, etc.) from parent repo directory
function serveParentAssets() {
  return {
    name: 'serve-parent-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const decodedUrl = decodeURIComponent(req.url.split('?')[0])
        const parentPath = path.join(__dirname, '..', decodedUrl)
        
        if (fs.existsSync(parentPath) && fs.statSync(parentPath).isFile()) {
          const ext = path.extname(parentPath).toLowerCase()
          const mimeTypes = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
            '.csv': 'text/csv; charset=utf-8',
            '.pdf': 'application/pdf',
            '.json': 'application/json',
            '.mp4': 'video/mp4'
          }
          if (mimeTypes[ext]) {
            res.setHeader('Content-Type', mimeTypes[ext])
            res.setHeader('Access-Control-Allow-Origin', '*')
            fs.createReadStream(parentPath).pipe(res)
            return
          }
        }
        next()
      })
    }
  }
}

export default defineConfig({
  base: process.env.VITE_BASE || './',
  plugins: [
    react(),
    tailwindcss(),
    serveParentAssets()
  ],
  server: {
    port: 5173,
    host: true
  }
})
