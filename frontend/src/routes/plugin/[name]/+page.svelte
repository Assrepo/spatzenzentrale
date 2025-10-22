<script lang="ts">
	import DynamicPluginLoader from '$lib/components/DynamicPluginLoader.svelte';
	import { page } from '$app/stores';

	$: pluginName = $page.params.name;
</script>

<DynamicPluginLoader {pluginName} />
