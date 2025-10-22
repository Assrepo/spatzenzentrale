<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { getNews, type NewsArticle } from '$lib/api/news';

    export let data;

    let updateInterval: number;
    let lastUpdate = new Date();
    let isLoading = false;
    let newsData: NewsArticle[] = [];
    let error = '';

    // Auto-Update alle 30 Sekunden
    const UPDATE_INTERVAL = 30000;

    async function fetchLatestNews() {
        if (isLoading) return;

        try {
            isLoading = true;
            error = '';

            newsData = await getNews();
            lastUpdate = new Date();
            console.log(`${newsData.length} News-Artikel geladen`);
        } catch (err) {
            console.error('Fehler beim Laden der News:', err);
            error = err instanceof Error ? err.message : 'Fehler beim Laden der News';
        } finally {
            isLoading = false;
        }
    }
    
    onMount(() => {
        // News initial laden
        fetchLatestNews();
        
        // News automatisch alle 30 Sekunden aktualisieren
        updateInterval = window.setInterval(fetchLatestNews, UPDATE_INTERVAL);
        
        return () => {
            if (updateInterval) clearInterval(updateInterval);
        };
    });
    
    onDestroy(() => {
        if (updateInterval) clearInterval(updateInterval);
    });
</script>

<svelte:head>
    <title>News Flash - Spatzenzentrale</title>
    <meta name="description" content="Aktuelle Nachrichten aus Ulm - Live und automatisch aktualisiert">
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- News Content -->
    <div class="container mx-auto px-4 py-8">
        <!-- Status Info -->
        <div class="mb-6 text-xs text-gray-500 flex items-center justify-between">
            <div class="flex items-center space-x-4">
                <span>Auto-Update alle {UPDATE_INTERVAL / 1000}s</span>
                <span>Letztes Update: {lastUpdate.toLocaleTimeString('de-DE')}</span>
            </div>
            {#if isLoading}
                <div class="flex items-center space-x-2 text-blue-600">
                    <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Wird aktualisiert...</span>
                </div>
            {/if}
        </div>
        {#if error}
            <!-- Error State -->
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                <div class="text-center">
                    <div class="text-4xl mb-4">❌</div>
                    <h2 class="text-xl font-semibold mb-2 text-red-900">Fehler beim Laden der News</h2>
                    <p class="text-red-700 mb-4">{error}</p>
                    <button 
                        on:click={fetchLatestNews}
                        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                        Erneut versuchen
                    </button>
                </div>
            </div>
        {:else if isLoading && newsData.length === 0}
            <!-- Loading State -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
                <div class="text-center">
                    <div class="text-4xl mb-4">📰</div>
                    <h2 class="text-xl font-semibold mb-2">News werden geladen...</h2>
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                </div>
            </div>
        {:else if newsData.length === 0}
            <!-- No News State -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
                <div class="text-center">
                    <div class="text-4xl mb-4">📰</div>
                    <h2 class="text-xl font-semibold mb-2">Keine News verfügbar</h2>
                    <p class="text-gray-600 mb-4">
                        Es sind aktuell keine Nachrichten in der Datenbank vorhanden.
                    </p>
                    <button 
                        on:click={fetchLatestNews}
                        class="px-4 py-2 bg-brand text-white rounded hover:bg-brand-dark transition-colors"
                    >
                        Neu laden
                    </button>
                </div>
            </div>
        {:else}
            <!-- News List -->
            <div class="space-y-6">
                {#each newsData as article, index}
                    <article class="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-4">
                                <h2 class="text-xl font-semibold text-gray-900 leading-tight flex-1 mr-4">
                                    {article.title}
                                </h2>
                                <span class="text-sm text-gray-500 whitespace-nowrap">
                                    {article.publishDate}
                                </span>
                            </div>
                            
                            <div class="prose max-w-none text-gray-700 leading-relaxed mb-4">
                                {article.content}
                            </div>
                            
                            <div class="flex items-center justify-between text-xs text-gray-500">
                                <span>Artikel #{index + 1}</span>
                                <span>ID: {article.id?.substring(0, 8)}...</span>
                            </div>
                        </div>
                    </article>
                {/each}
            </div>
            
            <!-- News Stats -->
            <div class="mt-8 text-center text-sm text-gray-500">
                <p>{newsData.length} News-Artikel angezeigt</p>
            </div>
        {/if}
        
        <!-- System Info -->
        <div class="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 class="font-semibold text-green-900 mb-2">✅ System-Status</h3>
            <div class="text-green-800 text-sm space-y-1">
                <p>• Automatische Updates: Aktiv ({UPDATE_INTERVAL / 1000}s Intervall)</p>
                <p>• API-Verbindung: {error ? '❌ Fehler' : '✅ OK'}</p>
                <p>• Datenbank: {newsData.length > 0 ? '✅ Verbunden' : '⚠️ Keine Daten'}</p>
                <p>• Letztes Update: {lastUpdate.toLocaleString('de-DE')}</p>
            </div>
        </div>
    </div>
</div>