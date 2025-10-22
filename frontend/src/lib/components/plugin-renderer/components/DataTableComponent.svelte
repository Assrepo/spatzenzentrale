<script lang="ts">
	import { onMount } from 'svelte';

	export let component: any;
	export let pluginName: string;

	let data: any[] = [];
	let loading = false;
	let error = '';
	let showConfirmModal = false;
	let pendingAction: any = null;

	async function loadData() {
		if (!component.dataSource?.endpoint) return;

		loading = true;
		error = '';

		try {
			let url = component.dataSource.endpoint;
			if (component.dataSource.params) {
				const params = new URLSearchParams(component.dataSource.params);
				url += `?${params.toString()}`;
			}

			const response = await fetch(url);
			const result = await response.json();

			if (result.success) {
				data = result.history || result.data || [];
			} else {
				error = result.error || 'Fehler beim Laden der Daten';
			}
		} catch (err: any) {
			error = `Netzwerkfehler: ${err.message}`;
		} finally {
			loading = false;
		}
	}

	async function executeAction(action: any) {
		if (action.confirm) {
			pendingAction = action;
			showConfirmModal = true;
			return;
		}

		await doExecuteAction(action);
	}

	async function doExecuteAction(action: any) {
		loading = true;
		error = '';

		try {
			if (action.type === 'api') {
				const response = await fetch(action.endpoint, {
					method: action.method || 'GET'
				});

				const result = await response.json();

				if (result.success || response.ok) {
					// Reload data after successful action
					await loadData();
				} else {
					error = result.error || 'Aktion fehlgeschlagen';
				}
			} else if (action.type === 'refresh') {
				await loadData();
			}
		} catch (err: any) {
			error = `Fehler: ${err.message}`;
		} finally {
			loading = false;
			showConfirmModal = false;
			pendingAction = null;
		}
	}

	function formatValue(value: any, type: string | undefined): string {
		if (value === null || value === undefined) return '-';

		if (type === 'datetime') {
			return new Date(value).toLocaleString('de-DE');
		} else if (type === 'badge') {
			return value;
		}

		return String(value);
	}

	function getBadgeClass(status: string): string {
		const classes: Record<string, string> = {
			success: 'bg-green-100 text-green-800',
			error: 'bg-red-100 text-red-800',
			warning: 'bg-yellow-100 text-yellow-800',
			info: 'bg-blue-100 text-blue-800'
		};
		return classes[status] || 'bg-gray-100 text-gray-800';
	}

	onMount(() => {
		loadData();

		// Listen for refresh events
		const handleRefresh = () => loadData();
		window.addEventListener('refreshHistory', handleRefresh);
		return () => window.removeEventListener('refreshHistory', handleRefresh);
	});
</script>

<div>
	{#if loading && data.length === 0}
		<div class="text-center py-8">
			<div class="text-4xl mb-2">⏳</div>
			<p class="text-gray-600">Lade Daten...</p>
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded p-4 mb-4">
			<p class="text-red-800">{error}</p>
		</div>
	{:else if data.length === 0}
		{#if component.emptyState}
			<div class="text-center text-gray-500 py-8">
				<div class="text-4xl mb-2">{component.emptyState.icon || '📭'}</div>
				<p class="font-medium">{component.emptyState.title}</p>
				{#if component.emptyState.subtitle}
					<p class="text-sm mt-1">{component.emptyState.subtitle}</p>
				{/if}
			</div>
		{/if}
	{:else}
		<div class="space-y-3" style={component.maxHeight ? `max-height: ${component.maxHeight}; overflow-y: auto;` : ''}>
			{#each data as row}
				<div class="bg-gray-50 rounded-lg border">
					<div class="flex items-center justify-between p-3">
						<div class="flex-1">
							<div class="flex items-center space-x-3">
								{#if row.method}
									<span class="text-lg">
										{row.method === 'API' ? '🌐' : '🎭'}
									</span>
								{/if}
								<div class="flex-1">
									<div class="flex items-center space-x-2">
										<span class="font-medium text-gray-900">
											{row.method || ''} Scraping
										</span>
										{#if row.status}
											<span class="px-2 py-1 text-xs rounded-full {getBadgeClass(row.status)}">
												{row.status}
											</span>
										{/if}
									</div>
									<div class="text-sm text-gray-600 mt-1">
										{row.newsCount || 0} Artikel gefunden • {row.saved || 0} gespeichert
										{#if row.error}
											• Fehler: {row.error}
										{/if}
									</div>
								</div>
							</div>
						</div>
						<div class="text-xs text-gray-500 text-right">
							{new Date(row.timestamp).toLocaleString('de-DE')}
						</div>
					</div>

					<!-- Expandable Details -->
					{#if row.newsData && row.newsData.length > 0}
						<details class="px-3 pb-3">
							<summary class="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium">
								📄 {row.newsData.length} gefundene Artikel anzeigen
							</summary>
							<div class="mt-2 space-y-2 max-h-60 overflow-y-auto">
								{#each row.newsData as newsItem}
									<div class="bg-white p-3 rounded border text-sm">
										<div class="flex items-start justify-between mb-2">
											<h4 class="font-medium text-gray-900 pr-2">
												{newsItem.title || 'Ohne Titel'}
											</h4>
											{#if newsItem.date}
												<span class="text-xs text-gray-500 whitespace-nowrap">
													{newsItem.date}
												</span>
											{/if}
										</div>
										{#if newsItem.content}
											<p class="text-gray-700 text-xs leading-relaxed">
												{newsItem.content.length > 200
													? newsItem.content.substring(0, 200) + '...'
													: newsItem.content}
											</p>
										{/if}
									</div>
								{/each}
							</div>
						</details>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Actions -->
	{#if component.actions}
		<div class="mt-4 pt-4 border-t flex justify-between items-center">
			<span class="text-sm text-gray-500">
				{data.length} Einträge
			</span>
			<div class="flex items-center gap-4">
				{#each component.actions as action}
					<button
						on:click={() => executeAction(action)}
						disabled={loading}
						class="text-sm transition-colors disabled:opacity-50
							{action.variant === 'danger' ? 'text-red-600 hover:text-red-800' : 'text-blue-600 hover:text-blue-800'}"
					>
						{action.label}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<!-- Confirm Modal -->
{#if showConfirmModal && pendingAction}
	<div class="fixed inset-0 bg-black/50 z-40"></div>
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-lg shadow-xl max-w-md w-full border">
			<div class="p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-2">
					{pendingAction.confirm.title}
				</h3>
				<p class="text-sm text-gray-600">
					{pendingAction.confirm.message}
				</p>
			</div>
			<div class="px-6 pb-6 flex justify-end gap-3">
				<button
					class="px-4 py-2 rounded border text-gray-700 hover:bg-gray-50"
					on:click={() => {
						showConfirmModal = false;
						pendingAction = null;
					}}
				>
					{pendingAction.confirm.cancelText || 'Abbrechen'}
				</button>
				<button
					class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
					on:click={() => doExecuteAction(pendingAction)}
				>
					{pendingAction.confirm.confirmText || 'Bestätigen'}
				</button>
			</div>
		</div>
	</div>
{/if}
