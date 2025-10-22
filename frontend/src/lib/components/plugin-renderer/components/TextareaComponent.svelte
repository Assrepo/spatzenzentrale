<script lang="ts">
	import { pluginState } from '../pluginState';

	export let component: any;
	export let pluginName: string;

	let value = component.defaultValue || '';

	$: pluginState.set(component.id, value);
</script>

<div>
	{#if component.label}
		<label class="block text-sm font-medium text-gray-700 mb-2">
			{component.label}
		</label>
	{/if}

	<textarea
		bind:value
		placeholder={component.placeholder || ''}
		rows={component.rows || 3}
		class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
	></textarea>

	{#if component.hint}
		<p class="text-xs text-gray-500 mt-1">
			{component.hint}
		</p>
	{/if}
</div>
