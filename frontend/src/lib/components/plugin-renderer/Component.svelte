<script lang="ts">
	import SelectComponent from './components/SelectComponent.svelte';
	import TextareaComponent from './components/TextareaComponent.svelte';
	import CheckboxComponent from './components/CheckboxComponent.svelte';
	import ButtonComponent from './components/ButtonComponent.svelte';
	import InfoComponent from './components/InfoComponent.svelte';
	import KeyValueComponent from './components/KeyValueComponent.svelte';
	import StatusListComponent from './components/StatusListComponent.svelte';
	import ButtonGroupComponent from './components/ButtonGroupComponent.svelte';
	import DataTableComponent from './components/DataTableComponent.svelte';

	export let component: any;
	export let pluginName: string;
</script>

{#if component.type === 'select'}
	<SelectComponent {component} {pluginName} />
{:else if component.type === 'textarea'}
	<TextareaComponent {component} {pluginName} />
{:else if component.type === 'checkbox'}
	<CheckboxComponent {component} {pluginName} />
{:else if component.type === 'button'}
	<ButtonComponent {component} {pluginName} />
{:else if component.type === 'info'}
	<InfoComponent {component} />
{:else if component.type === 'keyvalue'}
	<KeyValueComponent {component} />
{:else if component.type === 'statuslist'}
	<StatusListComponent {component} />
{:else if component.type === 'buttongroup'}
	<ButtonGroupComponent {component} />
{:else if component.type === 'datatable'}
	<DataTableComponent {component} {pluginName} />
{:else}
	<div class="p-4 bg-yellow-50 border border-yellow-200 rounded">
		<p class="text-sm text-yellow-800">
			Unbekannter Component-Type: <code>{component.type}</code>
		</p>
	</div>
{/if}
