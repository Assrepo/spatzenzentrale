<script lang="ts">
	import { onMount } from 'svelte';
	import PluginRenderer from './plugin-renderer/PluginRenderer.svelte';

	export let pluginName: string;

	let PluginComponent: any = null;
	let loading = true;
	let error: string | null = null;
	let manifest: any = null;

	onMount(async () => {
		try {
			// Load plugin manifest
			const manifestRes = await fetch(`/api/plugins/${pluginName}`);
			if (!manifestRes.ok) {
				throw new Error(`Plugin ${pluginName} nicht gefunden`);
			}

			const manifestData = await manifestRes.json();
			manifest = manifestData.data;

			// Check plugin type
			if (manifest.frontend?.type === 'svelte-component') {
				// Load Svelte Component Bundle
				await loadSvelteComponent();
			} else {
				// Fallback: UI-Schema (Legacy)
				PluginComponent = PluginRenderer;
			}

			loading = false;
		} catch (e: any) {
			error = e.message;
			loading = false;
		}
	});

	async function loadSvelteComponent() {
		const bundleUrl = `/api/plugins/${pluginName}/frontend/dist/plugin-bundle.js`;

		// Load CSS
		const cssLink = document.createElement('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = `/api/plugins/${pluginName}/frontend/dist/plugin-bundle.css`;
		document.head.appendChild(cssLink);

		// Load JS Module (dynamic import)
		const module = await import(/* @vite-ignore */ bundleUrl);
		PluginComponent = module.default;
	}
</script>

<div class="plugin-loader">
	{#if loading}
		<div class="loading-container">
			<div class="loading loading-spinner loading-lg"></div>
			<p>Lade {manifest?.frontend?.name || pluginName}...</p>
		</div>
	{:else if error}
		<div class="alert alert-error">
			<h3>Plugin konnte nicht geladen werden</h3>
			<p>{error}</p>
		</div>
	{:else if PluginComponent}
		{#if manifest?.frontend?.type === 'svelte-component'}
			<svelte:component this={PluginComponent} />
		{:else}
			<PluginRenderer {pluginName} />
		{/if}
	{/if}
</div>

<style>
	.plugin-loader {
		min-height: 400px;
		width: 100%;
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		gap: 1rem;
	}
</style>
