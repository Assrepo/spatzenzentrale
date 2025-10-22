<script lang="ts">
	export let component: any;
</script>

<div class="space-y-3">
	{#each component.fields as field}
		<div class="flex justify-between items-center">
			<span class="text-sm text-gray-600">{field.label}:</span>
			<span class="font-semibold">
				{field.key}
				{#if field.suffix}{field.suffix}{/if}
			</span>
		</div>
	{/each}
</div>
