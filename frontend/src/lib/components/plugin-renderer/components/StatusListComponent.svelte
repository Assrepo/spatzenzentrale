<script lang="ts">
	export let component: any;
</script>

<div class="space-y-3">
	{#each component.items as item}
		<div class="flex justify-between items-center">
			<span class="text-sm text-gray-600">{item.label}:</span>
			<span class="font-semibold {item.status === 'online' || item.status === 'ready' || item.status === 'connected' ? 'text-green-600' : ''}">
				{#if item.icon}{item.icon}{/if}
				{item.status || item.dataSource || ''}
			</span>
		</div>
	{/each}
</div>
