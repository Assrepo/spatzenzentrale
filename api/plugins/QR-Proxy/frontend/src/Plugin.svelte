<script lang="ts">
  import { onMount } from 'svelte';

  type QRCode = {
    id: string;
    name: string;
    targetUrl: string;
    shortCode: string;
    created: string;
  };

  let qrCodes: QRCode[] = [];
  let newName = '';
  let newUrl = '';
  let loading = false;

  onMount(async () => {
    await loadQRCodes();
  });

  async function loadQRCodes() {
    try {
      const res = await fetch('/qr-proxy/codes');
      const data = await res.json();
      qrCodes = data.data || [];
    } catch (e) {
      console.error('Failed to load QR codes', e);
    }
  }

  async function createQRCode() {
    if (!newName || !newUrl) return;

    loading = true;
    try {
      const res = await fetch('/qr-proxy/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, targetUrl: newUrl })
      });

      if (res.ok) {
        newName = '';
        newUrl = '';
        await loadQRCodes();
      }
    } catch (e) {
      console.error('Failed to create QR code', e);
    } finally {
      loading = false;
    }
  }
</script>

<div class="qr-proxy">
  <header>
    <h1>🌶️ QR-Code Proxy</h1>
    <p>QR-Codes erstellen und verwalten</p>
  </header>

  <div class="create-form">
    <h2>Neuen QR-Code erstellen</h2>
    <div class="form-group">
      <label>
        Name
        <input type="text" bind:value={newName} placeholder="Mein QR-Code" />
      </label>
      <label>
        Ziel-URL
        <input type="url" bind:value={newUrl} placeholder="https://example.com" />
      </label>
      <button on:click={createQRCode} disabled={loading || !newName || !newUrl}>
        {loading ? 'Erstelle...' : 'QR-Code erstellen'}
      </button>
    </div>
  </div>

  <div class="qr-list">
    <h2>Vorhandene QR-Codes ({qrCodes.length})</h2>
    {#if qrCodes.length === 0}
      <div class="empty">Keine QR-Codes vorhanden</div>
    {:else}
      <div class="grid">
        {#each qrCodes as qr}
          <div class="qr-card">
            <h3>{qr.name}</h3>
            <p class="url">{qr.targetUrl}</p>
            <p class="code">Code: {qr.shortCode}</p>
            <p class="date">{new Date(qr.created).toLocaleDateString('de-DE')}</p>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .qr-proxy {
    padding: 2rem;
    max-width: 1200px;
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

  .create-form {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  .create-form h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-weight: 500;
  }

  input {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
  }

  button {
    padding: 0.75rem 1.5rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 500;
  }

  button:hover:not(:disabled) {
    background: #2563eb;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .qr-list h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .empty {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .qr-card {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
  }

  .qr-card h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .url {
    font-size: 0.875rem;
    color: #3b82f6;
    word-break: break-all;
    margin-bottom: 0.5rem;
  }

  .code {
    font-family: monospace;
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
  }

  .date {
    font-size: 0.75rem;
    color: #9ca3af;
  }
</style>
