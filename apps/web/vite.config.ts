import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this app from a subpath (github.io/<repo>/) rather
  // than a domain root, so asset URLs need that prefix baked in. Only set
  // when explicitly building for Pages — other hosts (Vercel, custom
  // domains) serve from the root and must keep the default '/'.
  base: process.env.GITHUB_PAGES ? '/pdf_slide_writer/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
  },
})
