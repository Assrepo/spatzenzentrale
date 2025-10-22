<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		createQRCode as createQRCodeAPI, 
		getQRCodes, 
		updateQRCode as updateQRCodeAPI, 
		deleteQRCode as deleteQRCodeAPI, 
		getQRCodeImageUrl,
		type QRCode,
		type CreateQRCodeRequest 
	} from '$lib/api/qr-proxy';

	let qrCodes: QRCode[] = [];
	let loading = true;
	let error = '';
	let showCreateForm = false;
	let editingQR: QRCode | null = null;
	let toggleSuccess: string | null = null;

	// Form-Daten
	let formData = {
		name: '',
		description: '',
		targetUrl: ''
	};

	onMount(() => {
		loadQRCodes();
	});

	async function loadQRCodes() {
		try {
			loading = true;
			qrCodes = await getQRCodes();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Fehler beim Laden der QR-Codes';
			console.error('Fehler:', err);
		} finally {
			loading = false;
		}
	}

	async function createQRCode() {
		try {
			const newQRCode = await createQRCodeAPI(formData as CreateQRCodeRequest);
			qrCodes.unshift(newQRCode);
			showCreateForm = false;
			resetForm();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Fehler beim Erstellen des QR-Codes';
			console.error('Fehler:', err);
		}
	}

	async function updateQRCode(qrCode: QRCode) {
		try {
			const updatedQRCode = await updateQRCodeAPI(qrCode.id, {
				name: qrCode.name,
				description: qrCode.description,
				targetUrl: qrCode.targetUrl,
				isActive: qrCode.isActive
			});
			
			const index = qrCodes.findIndex(qr => qr.id === qrCode.id);
			if (index !== -1) {
				qrCodes[index] = updatedQRCode;
			}
			editingQR = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Fehler beim Aktualisieren des QR-Codes';
			console.error('Fehler:', err);
		}
	}

	async function deleteQRCode(id: string) {
		if (!confirm('Möchten Sie diesen QR-Code wirklich löschen?')) return;

		try {
			await deleteQRCodeAPI(id);
			qrCodes = qrCodes.filter(qr => qr.id !== id);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Fehler beim Löschen des QR-Codes';
			console.error('Fehler:', err);
		}
	}

	async function toggleActive(qrCode: QRCode) {
		// Sofortige UI-Aktualisierung (optimistic update)
		const originalState = qrCode.isActive;
		qrCode.isActive = !qrCode.isActive;
		
		// Erfolgsmeldung anzeigen
		toggleSuccess = qrCode.isActive ? 'QR-Code aktiviert' : 'QR-Code deaktiviert';
		setTimeout(() => toggleSuccess = null, 2000);
		
		try {
			// Server-Update im Hintergrund
			await updateQRCode(qrCode);
		} catch (err) {
			// Bei Fehler: Zustand zurücksetzen
			qrCode.isActive = originalState;
			error = 'Fehler beim Ändern des Status';
			toggleSuccess = null;
			console.error('Toggle error:', err);
		}
	}

	function startEdit(qrCode: QRCode) {
		editingQR = { ...qrCode };
	}

	function cancelEdit() {
		editingQR = null;
	}

	function resetForm() {
		formData = {
			name: '',
			description: '',
			targetUrl: ''
		};
	}

	async function copyToClipboard(text: string, event?: Event) {
		try {
			await navigator.clipboard.writeText(text);
			// Zeige kurze Bestätigung
			const button = event?.target as HTMLElement;
			if (button) {
				const originalContent = button.innerHTML;
				button.innerHTML = '✓';
				button.classList.add('text-green-600');
				setTimeout(() => {
					button.innerHTML = originalContent;
					button.classList.remove('text-green-600');
				}, 1000);
			}
		} catch (err) {
			console.error('Fehler beim Kopieren:', err);
			// Fallback für ältere Browser
			const textArea = document.createElement('textarea');
			textArea.value = text;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('de-DE', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>QR-Code Proxy - Spatzenzentrale</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Action Button -->
		<div class="mb-6 flex justify-end">
			<button
				on:click={() => showCreateForm = !showCreateForm}
				class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
			>
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Neuer QR-Code
			</button>
		</div>

		<!-- Error Message -->
		{#if error}
			<div class="mb-6 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg">
				{error}
			</div>
		{/if}

		<!-- Success Message -->
		{#if toggleSuccess}
			<div class="mb-6 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg animate-pulse">
				{toggleSuccess}
			</div>
		{/if}

		<!-- Create Form -->
		{#if showCreateForm}
			<div class="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h2 class="text-xl font-semibold text-gray-900 mb-4">Neuen QR-Code erstellen</h2>
				<form on:submit|preventDefault={createQRCode} class="space-y-4">
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
						<input
							type="text"
							id="name"
							bind:value={formData.name}
							placeholder="z.B. Produktseite XYZ"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							required
						/>
					</div>
					<div>
						<label for="description" class="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
						<textarea
							id="description"
							bind:value={formData.description}
							placeholder="Optionale Beschreibung..."
							rows="2"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						></textarea>
					</div>
					<div>
						<label for="targetUrl" class="block text-sm font-medium text-gray-700 mb-1">Ziel-URL</label>
						<input
							type="url"
							id="targetUrl"
							bind:value={formData.targetUrl}
							placeholder="https://example.com"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							required
						/>
					</div>
					<div class="flex space-x-3">
						<button
							type="submit"
							class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							QR-Code erstellen
						</button>
						<button
							type="button"
							on:click={() => { showCreateForm = false; resetForm(); }}
							class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
						>
							Abbrechen
						</button>
					</div>
				</form>
			</div>
		{/if}

		<!-- Loading State -->
		{#if loading}
			<div class="text-center py-12">
				<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				<p class="mt-2 text-gray-600">Lade QR-Codes...</p>
			</div>
		{:else if qrCodes.length === 0}
			<div class="text-center py-12">
				<div class="text-gray-400 mb-4">
					<svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
				</div>
				<h3 class="text-lg font-medium text-gray-900 mb-2">Keine QR-Codes vorhanden</h3>
				<p class="text-gray-600 mb-4">Erstellen Sie Ihren ersten QR-Code, um loszulegen.</p>
				<button
					on:click={() => showCreateForm = true}
					class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					Ersten QR-Code erstellen
				</button>
			</div>
		{:else}
			<!-- QR-Codes Grid -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each qrCodes as qrCode (qrCode.id)}
					<div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
						<!-- QR-Code Image -->
						<div class="p-6 text-center border-b border-gray-200">
							<img
								src={getQRCodeImageUrl(qrCode.id)}
								alt="QR-Code"
								class="mx-auto w-32 h-32 rounded-lg border border-gray-200"
							/>
						</div>

						<!-- Content -->
						<div class="p-6">
							<!-- Header -->
							<div class="flex items-start justify-between mb-4">
								<div class="flex-1">
									{#if editingQR && editingQR.id === qrCode.id}
										<input
											type="text"
											bind:value={editingQR.name}
											class="w-full text-lg font-semibold text-gray-900 bg-gray-50 border border-gray-300 rounded px-2 py-1"
										/>
									{:else}
										<h3 class="text-lg font-semibold text-gray-900">{qrCode.name}</h3>
									{/if}
								</div>
								<div class="flex items-center space-x-2">
									<!-- Toggle Switch -->
									<button
										on:click={() => toggleActive(qrCode)}
										class="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:scale-105 {qrCode.isActive ? 'bg-green-600 shadow-lg shadow-green-200' : 'bg-gray-200 hover:bg-gray-300'}"
										title={qrCode.isActive ? 'Deaktivieren' : 'Aktivieren'}
									>
										<span class="sr-only">{qrCode.isActive ? 'Deaktivieren' : 'Aktivieren'}</span>
										<span class="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-all duration-200 ease-in-out {qrCode.isActive ? 'translate-x-6' : 'translate-x-1'}"></span>
									</button>
									
									<!-- Status Label -->
									<span class="text-xs font-medium {qrCode.isActive ? 'text-green-600' : 'text-gray-500'}">
										{qrCode.isActive ? 'Aktiv' : 'Inaktiv'}
									</span>
									<button
										on:click={() => startEdit(qrCode)}
										class="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
										title="Bearbeiten"
										aria-label="QR-Code bearbeiten"
									>
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
										</svg>
									</button>
									<button
										on:click={() => deleteQRCode(qrCode.id)}
										class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
										title="Löschen"
										aria-label="QR-Code löschen"
									>
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									</button>
								</div>
							</div>

							<!-- Description -->
							{#if editingQR && editingQR.id === qrCode.id}
								<textarea
									bind:value={editingQR.description}
									placeholder="Beschreibung..."
									rows="2"
									class="w-full text-sm text-gray-600 bg-gray-50 border border-gray-300 rounded px-2 py-1 mb-4"
								></textarea>
							{:else if qrCode.description}
								<p class="text-sm text-gray-600 mb-4">{qrCode.description}</p>
							{/if}

							<!-- Target URL -->
							<div class="mb-4">
								<label class="block text-xs font-medium text-gray-500 mb-1">Ziel-URL</label>
								{#if editingQR && editingQR.id === qrCode.id}
									<input
										type="url"
										bind:value={editingQR.targetUrl}
										class="w-full text-sm bg-gray-50 border border-gray-300 rounded px-2 py-1"
									/>
								{:else}
									<div class="flex items-center space-x-2">
										<a
											href={qrCode.targetUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="text-sm text-blue-600 hover:text-blue-800 truncate flex-1"
										>
											{qrCode.targetUrl}
										</a>
										<button
											on:click={(e) => copyToClipboard(qrCode.targetUrl, e)}
											class="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
											title="URL kopieren"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
											</svg>
										</button>
										<a
											href={qrCode.targetUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
											title="URL öffnen"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
											</svg>
										</a>
									</div>
								{/if}
							</div>

							<!-- Proxy URL -->
							<div class="mb-4">
								<label class="block text-xs font-medium text-gray-500 mb-1">
									Proxy-URL 
									<span class="text-gray-400">(QR-Code zeigt auf diese URL)</span>
								</label>
								<div class="flex items-center space-x-2">
									<span class="text-sm text-gray-600 truncate flex-1">{qrCode.proxyUrl}</span>
									<button
										on:click={(e) => copyToClipboard(qrCode.proxyUrl, e)}
										class="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
										title="Proxy-URL kopieren"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
										</svg>
									</button>
								</div>
								<p class="text-xs text-gray-400 mt-1">
									Diese URL leitet weiter zu: <span class="font-medium">{qrCode.targetUrl}</span>
								</p>
							</div>

							<!-- Stats -->
							<div class="flex items-center justify-between text-xs text-gray-500 mb-4">
								<span>Klicks: {qrCode.clickCount || 0}</span>
								<span>Erstellt: {formatDate(qrCode.createdAt)}</span>
							</div>

							<!-- Status Badge -->
							<div class="flex items-center justify-between">
								<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {qrCode.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
									{qrCode.isActive ? 'Aktiv' : 'Deaktiviert'}
								</span>

								<!-- Edit Actions -->
								{#if editingQR && editingQR.id === qrCode.id}
									<div class="flex space-x-2">
										<button
											on:click={() => updateQRCode(editingQR)}
											class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
										>
											Speichern
										</button>
										<button
											on:click={cancelEdit}
											class="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
										>
											Abbrechen
										</button>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
