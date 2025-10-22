<script lang="ts">
	import { pluginState } from '../pluginState';

	export let component: any;
	export let pluginName: string;

	let checked = component.defaultValue !== undefined ? component.defaultValue : false;

	$: pluginState.set(component.id, checked);
</script>

<div class="flex items-center">
	<input
		type="checkbox"
		bind:checked
		id={component.id}
		class="mr-2 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
	/>
	<label for={component.id} class="text-sm text-gray-700">
		{component.label}
	</label>
</div>
