<script lang="ts">
  import { onMount } from 'svelte';

  // State
  let bots: any[] = [];
  let selectedBot = 'a43b3038-423e-47ab-8226-a8714418c88f';
  let customQuestion = '';
  let saveToDatabase = true;
  let history: any[] = [];
  let loading = false;
  let message = '';

  onMount(async () => {
    await loadBots();
    await loadHistory();
  });

  async function loadBots() {
    const res = await fetch('/botbucket/bots');
    const data = await res.json();
    bots = data.data || [];
  }

  async function loadHistory() {
    const res = await fetch('/botbucket/history');
    const data = await res.json();
    history = data.data || [];
  }

  async function testBot() {
    loading = true;
    message = '';
    try {
      const res = await fetch('/botbucket/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedBot })
      });
      const data = await res.json();
      message = data.success ? '✅ Bot-Verbindung erfolgreich!' : '❌ ' + data.error;
    } catch (e: any) {
      message = '❌ Bot-Test fehlgeschlagen';
    } finally {
      loading = false;
    }
  }

  async function fetchViaAPI() {
    loading = true;
    message = '';
    try {
      const res = await fetch('/botbucket/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedBot, customQuestion, saveToDatabase })
      });
      const data = await res.json();
      message = data.success ? '✅ API-Scraping erfolgreich!' : '❌ ' + data.error;
      await loadHistory();
    } catch (e: any) {
      message = '❌ API-Scraping fehlgeschlagen';
    } finally {
      loading = false;
    }
  }

  async function fetchViaPuppeteer() {
    loading = true;
    message = '';
    try {
      const res = await fetch('/botbucket/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customQuestion, saveToDatabase })
      });
      const data = await res.json();
      message = data.success ? '✅ Puppeteer-Scraping erfolgreich!' : '❌ ' + data.error;
      await loadHistory();
    } catch (e: any) {
      message = '❌ Puppeteer-Scraping fehlgeschlagen';
    } finally {
      loading = false;
    }
  }
</script>

<div class="bot-management">
  <header>
    <h1>🤖 Bot Management</h1>
    <p>Multi-Bot News-Scraping verwalten, Bots testen und konfigurieren</p>
  </header>

  {#if message}
    <div class="alert {message.includes('✅') ? 'alert-success' : 'alert-error'}">
      {message}
    </div>
  {/if}

  <div class="grid">
    <!-- Left Column -->
    <div class="card">
      <h2>🎯 Bot-Auswahl</h2>
      <label>
        Verfügbare ChatBots
        <select bind:value={selectedBot} class="select select-bordered w-full">
          {#each bots as bot}
            <option value={bot.id}>{bot.name}</option>
          {/each}
        </select>
      </label>
      <button on:click={testBot} disabled={loading} class="btn btn-primary w-full">
        🧪 Bot-Verbindung testen
      </button>
    </div>

    <div class="card">
      <h2>⚙️ Scraping-Konfiguration</h2>
      <label>
        Eigene Frage (optional)
        <textarea
          bind:value={customQuestion}
          placeholder="Berichte über die neuesten News..."
          rows="3"
          class="textarea textarea-bordered w-full"
        ></textarea>
        <span class="hint">Leer lassen für Standard-Frage</span>
      </label>
      <label class="cursor-pointer flex items-center gap-2">
        <input type="checkbox" bind:checked={saveToDatabase} class="checkbox" />
        <span>News automatisch in Datenbank speichern</span>
      </label>
    </div>

    <div class="card">
      <h2>🚀 Scraping-Aktionen</h2>
      <button on:click={fetchViaAPI} disabled={loading} class="btn btn-success w-full">
        🌐 Scraping via API starten
      </button>
      <button on:click={fetchViaPuppeteer} disabled={loading} class="btn btn-secondary w-full">
        🎭 Scraping via Puppeteer starten
      </button>
    </div>

    <!-- Right Column -->
    <div class="card history">
      <h2>📜 Scraping History</h2>
      <div class="history-list">
        {#each history as entry}
          <div class="history-item">
            <div class="history-header">
              <span class="badge {entry.success ? 'badge-success' : 'badge-error'}">
                {entry.success ? '✓' : '✗'}
              </span>
              <span class="method">{entry.method}</span>
              <span class="time">{new Date(entry.timestamp).toLocaleString()}</span>
            </div>
            {#if entry.error}
              <div class="error">{entry.error}</div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .bot-management {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  header {
    margin-bottom: 2rem;
  }

  header h1 {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  header p {
    color: #6b7280;
  }

  .alert {
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .alert-success {
    background: #d1fae5;
    color: #065f46;
  }

  .alert-error {
    background: #fee2e2;
    color: #991b1b;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .card {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .card h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .card.history {
    grid-column: 2;
    grid-row: 1 / 4;
  }

  label {
    display: block;
    margin-bottom: 1rem;
    font-weight: 500;
  }

  label > :global(*) {
    margin-top: 0.5rem;
  }

  .hint {
    font-size: 0.875rem;
    color: #6b7280;
  }

  button {
    margin-top: 0.5rem;
  }

  .history-list {
    max-height: 600px;
    overflow-y: auto;
  }

  .history-item {
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .history-item:last-child {
    border-bottom: none;
  }

  .history-header {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .badge-success {
    background: #d1fae5;
    color: #065f46;
  }

  .badge-error {
    background: #fee2e2;
    color: #991b1b;
  }

  .method {
    font-weight: 600;
  }

  .time {
    margin-left: auto;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .error {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #991b1b;
  }
</style>
