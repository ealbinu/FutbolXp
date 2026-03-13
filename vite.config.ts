import { defineConfig } from 'vite';

export default defineConfig({
  // Vite config for Astro is automatically merged
  // Add custom Vite config here if needed
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          vendor: ['astro'],
        },
      },
    },
  },
});