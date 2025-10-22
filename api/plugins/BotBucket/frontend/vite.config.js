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
      name: 'botbucket',
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
    port: 5174,
    proxy: {
      '/botbucket': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
