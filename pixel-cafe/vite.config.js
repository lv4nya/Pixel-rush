import { defineConfig } from 'vite';

export default defineConfig({
  // '.' so asset paths work after 'vite build'
  base: './',

  server: {
    port: 3000,
    open: true,   // Automatically open browser on 'npm run dev'
  },

  build: {
    outDir: 'dist',
  },
});
