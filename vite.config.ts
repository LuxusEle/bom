import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Use /bom/ for production (GitHub Pages), / for development
  base: mode === 'production' ? '/bom/' : '/',
}))
