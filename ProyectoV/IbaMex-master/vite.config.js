import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      'b304e099-5112-416f-bbe5-6cd19124bf94-00-24t1mybldirrg.worf.replit.dev',
      'localhost',
      '.replit.dev'
    ],
  }
})
