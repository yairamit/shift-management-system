import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dns from 'dns';
dns.setDefaultResultOrder('verbatim');

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist' },
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production'
          ? 'https://shift-management-system-production.up.railway.app/api'
          : 'http://localhost:3001',
        changeOrigin: true, 
        secure: false,
        // ws: true,  // אם אתה משתמש ב‑WebSockets
      }
    }
  }
});
