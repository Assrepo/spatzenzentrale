<script lang="ts">
    import type { PageData } from './$types.js';
    import { togglePlugin } from '$lib/api/plugins.js';
    import { invalidateAll } from '$app/navigation';
    
    export let data: PageData;
    
    let isToggling: string | null = null;
    let toggleMessage = '';
    let showRestartNotice = false;
    
    async function handleTogglePlugin(pluginName: string) {
        if (isToggling) return;
        
        isToggling = pluginName;
        toggleMessage = '';
        
        try {
            const result = await togglePlugin(pluginName);
            
            if (result.success && result.data) {
                toggleMessage = result.data.message || 'Plugin-Status geändert';
                showRestartNotice = true;
                
                // Plugin-Status sofort im Frontend aktualisieren
                data.plugins = data.plugins.map(plugin => {
                    if (plugin.name === pluginName) {
                        return { ...plugin, enabled: result.data!.newState };
                    }
                    return plugin;
                });
                
                // Daten nach kurzer Verzögerung vom Server neu laden
                setTimeout(() => {
                    invalidateAll();
                }, 1000);
                
                // Notice nach 8 Sekunden verstecken
                setTimeout(() => {
                    showRestartNotice = false;
                    toggleMessage = '';
                }, 8000);
            } else {
                toggleMessage = result.error || 'Fehler beim Ändern des Plugin-Status';
            }
        } catch (error) {
            console.error('Toggle error:', error);
            toggleMessage = 'Unerwarteter Fehler beim Plugin-Toggle';
        } finally {
            isToggling = null;
        }
    }
    
    function getPluginStatusColor(plugin: any) {
        if (!plugin.enabled) return 'bg-gray-100 border-gray-300';
        if (plugin.status === 'loaded') return 'bg-green-50 border-green-200';
        if (plugin.status === 'disabled') return 'bg-gray-50 border-gray-200';
        return 'bg-yellow-50 border-yellow-200';
    }
    
    function getStatusIcon(plugin: any) {
        if (!plugin.enabled) return '⭕';
        if (plugin.status === 'loaded') return '✅';
        if (plugin.status === 'disabled') return '🔴';
        if (plugin.status === 'not_loaded') return '⚠️';
        return '❓';
    }
    
    function getStatusText(plugin: any) {
        if (!plugin.enabled) return 'deaktiviert';
        if (plugin.status === 'loaded') return 'geladen';
        if (plugin.status === 'disabled') return 'deaktiviert';
        if (plugin.status === 'not_loaded') return 'nicht geladen';
        return plugin.status;
    }
</script>

<svelte:head>
    <title>Dashboard - Spatzenzentrale</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">

    <!-- Restart Notice -->
    {#if showRestartNotice}
        <div class="mb-6 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
            <div class="flex items-center">
                <div class="text-orange-600 mr-3">⚠️</div>
                <div>
                    <h3 class="text-sm font-medium text-orange-800">Server-Neustart erforderlich</h3>
                    <p class="text-sm text-orange-700 mt-1">
                        Plugin-Änderungen werden nach einem Server-Neustart wirksam.
                    </p>
                </div>
            </div>
        </div>
    {/if}

    <!-- Toggle Message -->
    {#if toggleMessage}
        <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="text-blue-800 text-sm">{toggleMessage}</p>
        </div>
    {/if}

    <!-- Error Display -->
    {#if data.error}
        <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center">
                <span class="text-red-600 mr-2">❌</span>
                <p class="text-red-800">Fehler: {data.error}</p>
            </div>
        </div>
    {/if}

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- System Health Card -->
        <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-sm border p-6">
                <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span class="text-2xl">🏥</span>
                    System Health
                </h2>
                
                <div class="space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">Status:</span>
                        <span class="px-2 py-1 rounded-full text-xs font-medium
                            {data.health.status === 'healthy' ? 'bg-green-100 text-green-800' : 
                              data.health.status === 'error' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'}">
                            {data.health.status}
                        </span>
                    </div>
                    
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">Uptime:</span>
                        <span class="font-mono text-sm">
                            {Math.floor(data.health.uptime / 3600)}h {Math.floor((data.health.uptime % 3600) / 60)}m
                        </span>
                    </div>
                    
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">Plugins:</span>
                        <span class="font-medium">{data.health.activeConnections}</span>
                    </div>
                    
                    <div class="text-xs text-gray-500 pt-2 border-t">
                        Letzte Aktualisierung: {new Date(data.health.timestamp).toLocaleTimeString('de-DE')}
                    </div>
                </div>
            </div>
        </div>

        <!-- Plugins Overview -->
        <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow-sm border">
                <div class="p-6 border-b">
                    <h2 class="text-xl font-semibold flex items-center gap-2">
                        <span class="text-2xl">🔌</span>
                        Aktive Plugins
                        <span class="ml-2 text-sm font-normal text-gray-500">
                            {data.plugins.filter(p => p.enabled).length} von {data.plugins.length} Plugins
                        </span>
                    </h2>
                </div>
                
                <div class="divide-y">
                    {#each data.plugins as plugin}
                        <div class="p-4 transition-colors hover:bg-gray-50 {getPluginStatusColor(plugin)}">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <div class="text-2xl">{getStatusIcon(plugin)}</div>
                                    <div>
                                        <h3 class="font-semibold text-gray-900">{plugin.name}</h3>
                                        <p class="text-sm text-gray-600">{plugin.description}</p>
                                        {#if plugin.route}
                                            <p class="text-xs text-gray-500 font-mono">{plugin.route}</p>
                                        {/if}
                                    </div>
                                </div>
                                
                                <div class="flex items-center space-x-2">
                                    <!-- Status Badge -->
                                    <span class="px-2 py-1 rounded-full text-xs font-medium
                                        {plugin.enabled 
                                            ? (plugin.status === 'loaded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')
                                            : 'bg-gray-100 text-gray-800'
                                        }">
                                        {getStatusText(plugin)}
                                    </span>
                                    
                                    <!-- Toggle Button -->
                                    <button
                                        onclick={() => handleTogglePlugin(plugin.name)}
                                        disabled={isToggling === plugin.name}
                                        class="px-3 py-1 rounded-md text-xs font-medium transition-colors
                                            {plugin.enabled 
                                                ? 'bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50' 
                                                : 'bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50'
                                            }
                                            disabled:cursor-not-allowed"
                                    >
                                        {#if isToggling === plugin.name}
                                            <span class="inline-flex items-center">
                                                <svg class="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                ...
                                            </span>
                                        {:else}
                                            {plugin.enabled ? 'Deaktivieren' : 'Aktivieren'}
                                        {/if}
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Plugin Details -->
                            {#if plugin.enabled && plugin.routes && plugin.routes.length > 0}
                                <div class="mt-3 pl-8">
                                    <details class="text-xs">
                                        <summary class="cursor-pointer text-gray-500 hover:text-gray-700">
                                            Verfügbare Endpunkte ({plugin.routes.length})
                                        </summary>
                                        <div class="mt-2 space-y-1">
                                            {#each plugin.routes as route}
                                                <div class="flex items-center space-x-2 text-gray-600">
                                                    <span class="font-mono bg-gray-100 px-1 rounded text-xs">{route.method}</span>
                                                    <span class="font-mono">{plugin.route}{route.path}</span>
                                                    <span class="text-gray-500">- {route.description}</span>
                                                </div>
                                            {/each}
                                        </div>
                                    </details>
                                </div>
                            {/if}
                        </div>
                    {/each}
                    
                    {#if data.plugins.length === 0}
                        <div class="p-8 text-center text-gray-500">
                            <div class="text-4xl mb-2">🔌</div>
                            <p>Keine Plugins gefunden</p>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>


</div>