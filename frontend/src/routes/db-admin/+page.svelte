<script lang="ts">
    import { onMount } from 'svelte';

    let tables: string[] = [];
    let selectedTable = '';
    let tableData: any = null;
    let tableStructure: any = null;
    let currentOffset = 0;
    let limit = 50;
    let loading = false;
    let error = '';
    let queryText = 'SELECT * FROM news LIMIT 10;';
    let queryResults: any = null;
    let activeTab = 'tables';

    onMount(() => {
        loadTables();
    });

    async function loadTables() {
        try {
            loading = true;
            const response = await fetch('/api/db-admin/tables');
            const data = await response.json();
            if (data.error) {
                error = data.error;
            } else {
                tables = data.tables;
            }
        } catch (err) {
            error = `Error loading tables: ${err instanceof Error ? err.message : String(err)}`;
        } finally {
            loading = false;
        }
    }

    async function selectTable(table: string) {
        selectedTable = table;
        currentOffset = 0;
        await loadTableData();
    }

    async function loadTableData() {
        if (!selectedTable) return;

        try {
            loading = true;
            const [dataResponse, structureResponse] = await Promise.all([
                fetch(`/api/db-admin/table/${selectedTable}?limit=${limit}&offset=${currentOffset}`),
                fetch(`/api/db-admin/table/${selectedTable}/structure`)
            ]);

            const data = await dataResponse.json();
            const structure = await structureResponse.json();

            if (data.error) {
                error = data.error;
            } else {
                tableData = data;
                tableStructure = structure;
            }
        } catch (err) {
            error = `Error loading table data: ${err instanceof Error ? err.message : String(err)}`;
        } finally {
            loading = false;
        }
    }

    async function executeQuery() {
        try {
            loading = true;
            const response = await fetch('/api/db-admin/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: queryText })
            });

            const data = await response.json();
            if (data.error) {
                error = data.error;
                queryResults = null;
            } else {
                queryResults = data;
                error = '';
            }
        } catch (err) {
            error = `Query error: ${err instanceof Error ? err.message : String(err)}`;
            queryResults = null;
        } finally {
            loading = false;
        }
    }

    function nextPage() {
        currentOffset += limit;
        loadTableData();
    }

    function prevPage() {
        currentOffset = Math.max(0, currentOffset - limit);
        loadTableData();
    }
</script>

<svelte:head>
    <title>Database Admin - Spatzenzentrale</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-4">

    <!-- Tabs -->
    <div class="bg-white/95 backdrop-blur-lg rounded-2xl mb-6 shadow-lg">
        <div class="flex">
            <button 
                class="flex-1 py-3 px-6 text-black font-medium transition-all {activeTab === 'tables' ? 'bg-blue-100' : 'hover:bg-gray-100'} rounded-l-2xl"
                on:click={() => activeTab = 'tables'}
            >
                📋 Tabellen
            </button>
            <button 
                class="flex-1 py-3 px-6 text-black font-medium transition-all {activeTab === 'query' ? 'bg-blue-100' : 'hover:bg-gray-100'} rounded-r-2xl"
                on:click={() => activeTab = 'query'}
            >
                🔍 SQL Query
            </button>
        </div>
    </div>

    <!-- Error Display -->
    {#if error}
        <div class="bg-red-100 border border-red-300 text-red-800 p-4 rounded-xl mb-6">
            <strong>Fehler:</strong> {error}
        </div>
    {/if}

    <!-- Tables Tab -->
    {#if activeTab === 'tables'}
        <div class="bg-white backdrop-blur-lg rounded-2xl p-6 shadow-lg">
            <h2 class="text-2xl font-bold mb-6 text-black">Verfügbare Tabellen</h2>
            
            {#if loading && !tables.length}
                <div class="text-center py-8">
                    <div class="loading loading-spinner loading-lg mb-4"></div>
                    <p class="text-black">Lade Tabellen...</p>
                </div>
            {:else}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {#each tables as table}
                        <button
                            class="bg-white border-2 border-blue-600 text-blue-600 p-4 rounded-xl hover:bg-blue-600 hover:text-white hover:shadow-lg transform hover:-translate-y-1 transition-all"
                            on:click={() => selectTable(table)}
                        >
                            <h3 class="font-bold text-lg mb-2">{table}</h3>
                            <p class="opacity-90">Klicken zum Anzeigen</p>
                        </button>
                    {/each}
                </div>
            {/if}

            {#if selectedTable && tableData}
                <div class="mt-8">
                    <div class="bg-gray-100 p-4 rounded-xl mb-4">
                        <h3 class="font-bold text-lg mb-2 text-black">{selectedTable}</h3>
                        <p class="text-black"><strong>Spalten:</strong> {tableStructure?.columns?.length || 0}</p>
                        <p class="text-black"><strong>Angezeigte Zeilen:</strong> {tableData.count} (ab Zeile {currentOffset + 1})</p>
                    </div>

                    {#if tableData.rows.length === 0}
                        <p class="text-center py-4 text-black">Keine Daten in dieser Tabelle.</p>
                    {:else}
                        <div class="overflow-x-auto">
                            <table class="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
                                <thead>
                                    <tr class="bg-gradient-to-r from-blue-600 to-purple-700 text-black">
                                        {#each Object.keys(tableData.rows[0]) as column}
                                            <th class="p-3 text-left font-semibold border-b border-blue-500">{column}</th>
                                        {/each}
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each tableData.rows as row, i}
                                        <tr class="{i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 border-b border-gray-200">
                                            {#each Object.entries(row) as [key, value]}
                                                <td class="p-3 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-black border-r border-gray-200 last:border-r-0" title={String(value || '')}>
                                                    {value === null ? '(NULL)' : value}
                                                </td>
                                            {/each}
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>

                        <!-- Pagination -->
                        <div class="flex justify-center items-center gap-4 mt-6">
                            <button 
                                class="btn btn-primary" 
                                disabled={currentOffset === 0}
                                on:click={prevPage}
                            >
                                ← Vorherige
                            </button>
                            <span class="text-black">Zeilen {currentOffset + 1}-{currentOffset + tableData.count}</span>
                            <button 
                                class="btn btn-primary" 
                                disabled={tableData.count < limit}
                                on:click={nextPage}
                            >
                                Nächste →
                            </button>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}

    <!-- Query Tab -->
    {#if activeTab === 'query'}
        <div class="bg-white backdrop-blur-lg rounded-2xl p-6 shadow-lg">
            <h2 class="text-2xl font-bold mb-6 text-black">SQL Query Ausführen</h2>
            
            <div class="mb-4">
                <textarea
                    bind:value={queryText}
                    class="w-full h-32 p-4 border border-gray-300 rounded-xl font-mono text-sm resize-none text-black bg-white"
                    placeholder="SELECT * FROM news LIMIT 10;"
                ></textarea>
                <button 
                    class="btn btn-primary mt-4"
                    on:click={executeQuery}
                    disabled={loading}
                >
                    {#if loading}
                        <span class="loading loading-spinner loading-sm"></span>
                    {/if}
                    Query Ausführen
                </button>
            </div>

            {#if queryResults}
                <div class="mt-6">
                    <div class="bg-green-100 border border-green-300 p-4 rounded-xl mb-4">
                        <strong class="text-black">Erfolgreich:</strong> <span class="text-black">{queryResults.count} Zeilen zurückgegeben</span>
                    </div>

                    {#if queryResults.rows.length > 0}
                        <div class="overflow-x-auto">
                            <table class="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
                                <thead>
                                    <tr class="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
                                        {#each queryResults.columns as column}
                                            <th class="p-3 text-left font-semibold border-b border-blue-500">{column.name}</th>
                                        {/each}
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each queryResults.rows as row, i}
                                        <tr class="{i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 border-b border-gray-200">
                                            {#each queryResults.columns as column}
                                                <td class="p-3 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-black border-r border-gray-200 last:border-r-0" title={String(row[column.name] || '')}>
                                                    {row[column.name] === null ? '(NULL)' : row[column.name]}
                                                </td>
                                            {/each}
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}
</div>