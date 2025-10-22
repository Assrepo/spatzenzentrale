<script lang="ts">
  import { onMount } from 'svelte';

  let tables: string[] = [];
  let selectedTable = '';
  let tableData: any[] = [];
  let loading = false;

  onMount(async () => {
    await loadTables();
  });

  async function loadTables() {
    try {
      const res = await fetch('/api/db-admin/tables');
      const data = await res.json();
      tables = data.data || [];
      if (tables.length > 0) {
        selectedTable = tables[0];
        await loadTableData();
      }
    } catch (e) {
      console.error('Failed to load tables', e);
    }
  }

  async function loadTableData() {
    if (!selectedTable) return;

    loading = true;
    try {
      const res = await fetch(`/api/db-admin/table/${selectedTable}`);
      const data = await res.json();
      tableData = data.data || [];
    } catch (e) {
      console.error('Failed to load table data', e);
    } finally {
      loading = false;
    }
  }
</script>

<div class="db-viewer">
  <header>
    <h1>🗄️ Database Admin</h1>
    <p>Datenbank-Verwaltung und -ansicht</p>
  </header>

  <div class="controls">
    <label>
      Tabelle wählen:
      <select bind:value={selectedTable} on:change={loadTableData}>
        {#each tables as table}
          <option value={table}>{table}</option>
        {/each}
      </select>
    </label>
  </div>

  {#if loading}
    <div class="loading">Lade Daten...</div>
  {:else if tableData.length === 0}
    <div class="empty">Keine Daten in dieser Tabelle</div>
  {:else}
    <div class="table-container">
      <table>
        <thead>
          <tr>
            {#each Object.keys(tableData[0] || {}) as key}
              <th>{key}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each tableData as row}
            <tr>
              {#each Object.values(row) as value}
                <td>{value}</td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .db-viewer {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  header h1 {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  header p {
    color: #6b7280;
    margin-bottom: 2rem;
  }

  .controls {
    margin-bottom: 2rem;
  }

  label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  select {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    min-width: 200px;
  }

  .loading, .empty {
    text-align: center;
    padding: 3rem;
    color: #6b7280;
  }

  .table-container {
    overflow-x: auto;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }

  th {
    background: #f9fafb;
    font-weight: 600;
    font-size: 0.875rem;
    color: #374151;
  }

  td {
    font-size: 0.875rem;
    color: #6b7280;
  }

  tr:hover {
    background: #f9fafb;
  }
</style>
