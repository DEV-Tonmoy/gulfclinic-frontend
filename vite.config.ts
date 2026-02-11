import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // This allows the app to be accessible over the network
    strictPort: true,
  },
  preview: {
    port: 8080, // Default port for many deployment environments
    host: true,
  }
})