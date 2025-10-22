<script lang="ts">
	import StatusBadge from './StatusBadge.svelte';
	import type { Plugin } from '$lib/api/types';

	interface Props {
		plugin: Plugin;
	}

	let { plugin }: Props = $props();

	function getCategoryIcon(category: string | undefined): string {
		const icons: Record<string, string> = {
			api: '🔌',
			realtime: '📡',
			scraper: '🤖',
			utility: '🛠️',
			integration: '🔗',
			default: '📦'
		};
		return icons[category ?? 'default'] ?? icons.default;
	}

	function getCategoryColor(category: string | undefined): string {
		const colors: Record<string, string> = {
			api: 'bg-blue-100 text-blue-800',
			realtime: 'bg-green-100 text-green-800',
			scraper: 'bg-purple-100 text-purple-800',
			utility: 'bg-yellow-100 text-yellow-800',
			integration: 'bg-pink-100 text-pink-800',
			default: 'bg-gray-100 text-gray-800'
		};
		return colors[category ?? 'default'] ?? colors.default;
	}
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
	<div class="p-6">
		<div class="flex items-start justify-between mb-4">
			<div class="flex items-center gap-3">
				<span class="text-2xl">
					{getCategoryIcon(plugin.category)}
				</span>
				<div>
					<h3 class="text-lg font-semibold text-gray-900">{plugin.name}</h3>
					<p class="text-sm text-gray-500">v{plugin.version}</p>
				</div>
			</div>
			<StatusBadge status={plugin.enabled ? 'active' : 'disabled'} />
		</div>

		{#if plugin.description}
			<p class="text-gray-600 text-sm mb-4">{plugin.description}</p>
		{/if}

		<div class="flex items-center justify-between">
			<span
				class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getCategoryColor(
					plugin.category
				)}"
			>
				{plugin.category || 'default'}
			</span>
			{#if plugin.route}
				<span class="text-xs text-gray-400 font-mono">{plugin.route}</span>
			{/if}
		</div>
	</div>
</div>
