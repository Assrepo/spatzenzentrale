<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// Redirect zu neuer UI-Schema Route
	onMount(() => {
		goto('/plugin/botbucket', { replaceState: true });
	});
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
	<div class="text-center">
		<div class="text-6xl mb-4">🔄</div>
		<p class="text-gray-600">Weiterleitung zu neuem Plugin-System...</p>
	</div>
</div>
