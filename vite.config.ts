import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Use /bom/ for GitHub Pages, / for Vercel and development
  base: process.env.VERCEL ? '/' : mode === 'production' ? '/bom/' : '/',
}))
