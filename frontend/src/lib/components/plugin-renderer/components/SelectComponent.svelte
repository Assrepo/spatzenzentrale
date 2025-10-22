<script lang="ts">
	import { onMount } from 'svelte';
	import { pluginState } from '../pluginState';

	export let component: any;
	export let pluginName: string;

	let options: any[] = [];
	let loading = false;
	let value = component.defaultValue || '';

	$: pluginState.set(component.id, value);

	onMount(async () => {
		if (component.dataSource?.endpoint) {
			loading = true;
			try {
				const response = await fetch(component.dataSource.endpoint);
				const result = await response.json();

				if (result.success) {
					options = result.bots || result.data || [];
				}
			} catch (err) {
				console.error('Fehler beim Laden der Select-Optionen:', err);
			} finally {
				loading = false;
			}
		}
	});
</script>

<div>
	{#if component.label}
		<label class="block text-sm font-medium text-gray-700 mb-2">
			{component.label}
		</label>
	{/if}

	<select
		bind:value
		disabled={loading}
		class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
	>
		{#if loading}
			<option>Lade Optionen...</option>
		{:else if options.length > 0}
			{#each options as option}
				<option value={option[component.dataSource.valueField]}>
					{option[component.dataSource.labelField]}
				</option>
			{/each}
		{:else}
			<option>Keine Optionen verfügbar</option>
		{/if}
	</select>
</div>
