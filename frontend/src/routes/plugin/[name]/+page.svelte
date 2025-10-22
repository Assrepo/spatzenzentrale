<script lang="ts">
	import PluginRenderer from '$lib/components/plugin-renderer/PluginRenderer.svelte';
	import { page } from '$app/stores';

	$: pluginName = $page.params.name;
</script>

<PluginRenderer {pluginName} />
