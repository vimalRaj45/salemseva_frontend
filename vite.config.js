import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  server: {
    port: 3000,
    host: true
  },
  optimizeDeps: {
    include: ['react-router-dom', '@mui/material', '@mui/icons-material', 'leaflet', 'react-leaflet']
  }
});

