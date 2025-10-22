import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

/**
 * Shared Vite Config für Spatzenzentrale Plugins
 *
 * Usage: Import und customize in deinem Plugin
 */
export function createPluginConfig(pluginName, options = {}) {
  return defineConfig({
    plugins: [svelte()],

    build: {
      target: 'esnext',
      minify: true,
      cssCodeSplit: false,

      lib: {
        entry: options.entry || './src/Plugin.svelte',
        name: pluginName,
        formats: ['es'],
        fileName: () => 'plugin-bundle.js'
      },

      rollupOptions: {
        external: options.external || [],
        output: {
          assetFileNames: 'plugin-bundle.[ext]',
          globals: options.globals || {}
        }
      }
    },

    server: {
      port: options.port || 5174,
      proxy: {
        [`/${pluginName}`]: {
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
}

export default createPluginConfig;
