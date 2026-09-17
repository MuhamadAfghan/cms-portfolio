import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      __JWT_SECRET__: JSON.stringify(env.JWT_SECRET ?? ''),
      __JWT_EXPIRES_IN__: JSON.stringify(env.JWT_EXPIRES_IN ?? '1h'),
    },
    build: {
      // The charts (ApexCharts) chunk is large but lazy-loaded on demand, so it
      // never blocks initial load; raise the limit to keep build output clean.
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Split heavy vendors into their own chunks for better caching/loading.
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            mui: ['@mui/material', '@mui/icons-material'],
            charts: ['apexcharts', 'react-apexcharts'],
            supabase: ['@supabase/supabase-js'],
          },
        },
      },
    },
  }
})
