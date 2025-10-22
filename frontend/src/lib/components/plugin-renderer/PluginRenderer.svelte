<script lang="ts">
	import { onMount } from 'svelte';
	import Section from './Section.svelte';
	import { pluginState } from './pluginState';

	export let pluginName: string;

	let loading = true;
	let error: string | null = null;
	let schema: any = null;
	let manifest: any = null;

	onMount(async () => {
		try {
			const response = await fetch(`/api/plugins/${pluginName}/ui-schema`);
			const result = await response.json();

			if (result.success) {
				schema = result.data.schema;
				manifest = result.data.manifest;
				pluginState.init(pluginName);
			} else {
				error = result.error || 'Fehler beim Laden des UI-Schemas';
			}
		} catch (err: any) {
			error = `Netzwerkfehler: ${err.message}`;
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>{schema?.title || pluginName} - Spatzenzentrale</title>
	<meta name="description" content={schema?.description || ''}>
</svelte:head>

{#if loading}
	<div class="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
		<div class="text-center">
			<div class="text-6xl mb-4">⏳</div>
			<p class="text-gray-600">Lade Plugin-Oberfläche...</p>
		</div>
	</div>
{:else if error}
	<div class="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
		<div class="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
			<div class="text-6xl mb-4">❌</div>
			<h2 class="text-xl font-semibold text-gray-900 mb-2">Fehler</h2>
			<p class="text-red-600">{error}</p>
		</div>
	</div>
{:else if schema}
	<div class="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
		<div class="container mx-auto px-4 py-8">
			<!-- Header -->
			{#if schema.icon || schema.title}
				<div class="mb-8 text-center">
					{#if schema.icon}
						<div class="text-6xl mb-4">{schema.icon}</div>
					{/if}
					{#if schema.title}
						<h1 class="text-3xl font-bold text-gray-900">{schema.title}</h1>
					{/if}
					{#if schema.description}
						<p class="text-gray-600 mt-2">{schema.description}</p>
					{/if}
				</div>
			{/if}

			<!-- Layout -->
			{#if schema.layout === 'two-column'}
				<div class="grid lg:grid-cols-2 gap-8">
					<!-- Left Column -->
					<div class="space-y-6">
						{#each schema.sections.filter(s => s.column === 'left') as section}
							<Section {section} {pluginName} />
						{/each}
					</div>

					<!-- Right Column -->
					<div class="space-y-6">
						{#each schema.sections.filter(s => s.column === 'right') as section}
							<Section {section} {pluginName} />
						{/each}
					</div>
				</div>

				<!-- Full Width Sections -->
				{#if schema.sections.some(s => s.column === 'full')}
					<div class="mt-8 space-y-8">
						{#each schema.sections.filter(s => s.column === 'full') as section}
							<Section {section} {pluginName} />
						{/each}
					</div>
				{/if}
			{:else}
				<!-- Single Column Layout -->
				<div class="max-w-4xl mx-auto space-y-6">
					{#each schema.sections as section}
						<Section {section} {pluginName} />
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}
