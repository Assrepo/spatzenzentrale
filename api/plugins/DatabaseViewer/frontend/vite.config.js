import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    target: 'esnext',
    minify: true,
    cssCodeSplit: false,
    lib: {
      entry: './src/Plugin.svelte',
      name: 'databaseViewer',
      formats: ['es'],
      fileName: () => 'plugin-bundle.js'
    },
    rollupOptions: {
      output: {
        assetFileNames: 'plugin-bundle.[ext]'
      }
    }
  },
  server: {
    port: 5177,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
