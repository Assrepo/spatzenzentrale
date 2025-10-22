<script lang="ts">
	export let component: any;
</script>

<div class="text-xs text-gray-500 space-y-1">
	{#each component.items as item}
		<p>{@html item}</p>
	{/each}
</div>
