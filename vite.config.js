import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: ['react-router-dom', '@mui/material', '@mui/icons-material']
  },
  esbuild: {
    drop: ['console', 'debugger']
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-dom') || id.includes('react-router-dom') || /[\\/]node_modules[\\/]react[\\/]/.test(id)) {
            return 'vendor-react';
          }
          if (id.includes('@mui/icons-material')) {
            return 'vendor-mui-icons';
          }
          if (id.includes('@mui') || id.includes('@emotion')) {
            return 'vendor-mui';
          }
          if (id.includes('lucide-react')) {
            return 'vendor-lucide';
          }
          if (id.includes('lottie-web')) {
            return 'vendor-lottie';
          }
          if (id.includes('@capacitor')) {
            return 'vendor-capacitor';
          }
        }
      }
    }
  }
});

