<script lang="ts">
	export let component: any;

	function handleAction(action: any) {
		if (action.type === 'navigate') {
			window.location.href = action.target;
		} else if (action.type === 'refresh') {
			window.location.reload();
		}
	}
</script>

<div class="grid grid-cols-2 gap-3">
	{#each component.buttons as button}
		<button
			on:click={() => handleAction(button.action)}
			class="px-3 py-2 text-sm bg-blue-600 text-white rounded text-center hover:bg-blue-700 transition-colors"
		>
			{button.label}
		</button>
	{/each}
</div>
