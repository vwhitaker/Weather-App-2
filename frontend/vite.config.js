import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Forward API calls to FastAPI during `npm run dev`
    proxy: { '/api': 'http://localhost:8000' },
  },
})
