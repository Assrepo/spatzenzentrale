<script lang="ts">
	import '../app.css';
	import Navigation from '$lib/components/Navigation.svelte';
	import { page } from '$app/stores';

	let { children } = $props();
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Navigation nur auf bestimmten Seiten anzeigen -->
	{#if !$page.url.pathname.startsWith('/news-flash')}
		<Navigation />
	{/if}

	<main>
		{@render children()}
	</main>
</div>
