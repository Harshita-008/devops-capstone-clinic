import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    // During `npm run dev` the API runs separately on port 8000; nginx does this routing in containers.
    proxy: { '/api': 'http://localhost:8000' },
  },
})
