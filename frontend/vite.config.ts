import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		host: true,
		port: 5173,
		allowedHosts: ['sus-web-01-lp', '10.2.2.57', 'localhost'],
		hmr: {
			port: 5173
		},
		proxy: {
			'/api': {
				target: 'http://sus-web-01-lp:3001',
				changeOrigin: true,
				secure: false
			},
			'/botbucket': {
				target: 'http://sus-web-01-lp:3001',
				changeOrigin: true,
				secure: false
			},
			'/qr-proxy': {
				target: 'http://sus-web-01-lp:3001',
				changeOrigin: true,
				secure: false
			}
		}
	},
	preview: {
		host: true,
		port: 4173,
		allowedHosts: ['sus-web-01-lp', '10.2.2.57', 'localhost'],
		proxy: {
			'/api': {
				target: 'http://sus-web-01-lp:3001',
				changeOrigin: true,
				secure: false
			},
			'/botbucket': {
				target: 'http://sus-web-01-lp:3001',
				changeOrigin: true,
				secure: false
			},
			'/qr-proxy': {
				target: 'http://sus-web-01-lp:3001',
				changeOrigin: true,
				secure: false
			}
		}
	}
});
