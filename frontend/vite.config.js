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
          ? 'https://your-app.vercel.app'
          : 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
        // ws: true,  // אם אתה משתמש ב‑WebSockets
      }
    }
  }
});
