<script lang="ts">
	import { pluginState } from '../pluginState';

	export let component: any;
	export let pluginName: string;

	let loading = false;

	async function handleClick() {
		if (!component.action || loading) return;

		const action = component.action;
		loading = true;
		pluginState.clearMessages();

		try {
			if (action.type === 'api') {
				// Sammle Parameter aus dem State
				const params: Record<string, any> = {};
				if (action.params) {
					for (const paramKey of action.params) {
						const value = pluginState.get(paramKey);
						// Map parameter names for API
						if (paramKey === 'selectedBot') {
							params.chatbotId = value;
						} else if (paramKey === 'customQuestion') {
							params.question = value || undefined;
						} else if (paramKey === 'saveToDatabase') {
							params.saveToDb = value;
						} else {
							params[paramKey] = value;
						}
					}
				}

				const response = await fetch(action.endpoint, {
					method: action.method || 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(params)
				});

				const result = await response.json();

				if (result.success || response.ok) {
					pluginState.addMessage('success', action.successMessage || 'Aktion erfolgreich');

					// OnSuccess actions
					if (action.onSuccess === 'refreshHistory') {
						// Trigger refresh (könnte über Event besser gelöst werden)
						window.dispatchEvent(new CustomEvent('refreshHistory'));
					}
				} else {
					pluginState.addMessage(
						'error',
						`${action.errorMessage || 'Aktion fehlgeschlagen'}: ${result.error || 'Unbekannter Fehler'}`
					);
				}
			} else if (action.type === 'navigate') {
				window.location.href = action.target;
			} else if (action.type === 'refresh') {
				window.location.reload();
			}
		} catch (err: any) {
			pluginState.addMessage('error', `Fehler: ${err.message}`);
		} finally {
			loading = false;
		}
	}

	function getVariantClasses(variant: string): string {
		const variants: Record<string, string> = {
			primary: 'bg-blue-600 text-white hover:bg-blue-700',
			success: 'bg-green-600 text-white hover:bg-green-700',
			secondary: 'bg-purple-600 text-white hover:bg-purple-700',
			danger: 'bg-red-600 text-white hover:bg-red-700'
		};
		return variants[variant] || variants.primary;
	}

	$: variantClasses = getVariantClasses(component.variant || 'primary');
	$: widthClass = component.fullWidth ? 'w-full' : '';
</script>

<button
	on:click={handleClick}
	disabled={loading}
	class="px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors {variantClasses} {widthClass}"
>
	{#if loading}
		{#if component.icon}
			<span class="inline-block animate-spin">{component.icon}</span>
		{:else}
			🔄
		{/if}
		{component.loadingLabel || 'Lädt...'}
	{:else}
		{#if component.icon}
			{component.icon}
		{/if}
		{component.label}
	{/if}
</button>
