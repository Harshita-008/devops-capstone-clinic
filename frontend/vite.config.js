import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    // In dev the API runs on port 8000; in containers nginx does this instead.
    proxy: { '/api': 'http://localhost:8000' },
  },
})
