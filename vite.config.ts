import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Enable HTTPS for local development (needed for payment gateway callbacks)
    basicSsl(),
  ],
  server: {
    port: 5173,
  },
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          animations: ['framer-motion'],
          i18n: ['i18next', 'react-i18next'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Minify for production
    minify: 'esbuild',
  },
  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
  },
})
