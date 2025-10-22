<script lang="ts">
	import Component from './Component.svelte';
	import { pluginState } from './pluginState';

	export let section: any;
	export let pluginName: string;

	// Prüfe Conditions (z.B. "lastScrapingResult" existiert)
	function checkCondition(condition: string | undefined): boolean {
		if (!condition) return true;
		return !!pluginState.get(condition);
	}

	$: isVisible = checkCondition(section.condition);
</script>

{#if isVisible}
	<div class="bg-white rounded-lg shadow-sm border p-6">
		{#if section.title || section.icon}
			<h2 class="text-xl font-semibold mb-4 flex items-center">
				{#if section.icon}
					<span class="mr-2">{section.icon}</span>
				{/if}
				{section.title || ''}
			</h2>
		{/if}

		<div class="space-y-4">
			{#each section.components as component}
				<Component {component} {pluginName} />
			{/each}
		</div>
	</div>
{/if}
