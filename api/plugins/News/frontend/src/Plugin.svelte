<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  type NewsArticle = {
    id: number;
    title: string;
    summary: string;
    source: string;
    timestamp: string;
  };

  let news: NewsArticle[] = [];
  let loading = true;
  let error = '';
  let lastUpdate = new Date();
  let interval: number;

  onMount(async () => {
    await loadNews();
    // Auto-update alle 30 Sekunden
    interval = window.setInterval(loadNews, 30000);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });

  async function loadNews() {
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      news = data.data || [];
      lastUpdate = new Date();
      loading = false;
    } catch (e: any) {
      error = e.message;
      loading = false;
    }
  }
</script>

<div class="news-container">
  <header>
    <h1>📰 News Flash</h1>
    <p>Aktuelle Nachrichten aus Ulm - Live aktualisiert</p>
    <div class="status">
      <span>Letztes Update: {lastUpdate.toLocaleTimeString('de-DE')}</span>
      {#if loading}
        <span class="loading-indicator">Aktualisiere...</span>
      {/if}
    </div>
  </header>

  {#if error}
    <div class="alert alert-error">
      <span>❌</span>
      <p>{error}</p>
      <button on:click={loadNews} class="btn">Erneut versuchen</button>
    </div>
  {:else if news.length === 0}
    <div class="empty-state">
      <div>📰</div>
      <p>Keine News verfügbar</p>
    </div>
  {:else}
    <div class="news-grid">
      {#each news as article}
        <div class="news-card">
          <div class="news-header">
            <span class="news-source">{article.source}</span>
            <span class="news-time">{new Date(article.timestamp).toLocaleString('de-DE')}</span>
          </div>
          <h3>{article.title}</h3>
          <p>{article.summary}</p>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .news-container {
    padding: 2rem;
    max-width: 1200px;
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

  .status {
    margin-top: 1rem;
    font-size: 0.875rem;
    color: #9ca3af;
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .loading-indicator {
    color: #3b82f6;
    animation: pulse 2s infinite;
  }

  .alert {
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .alert-error {
    background: #fee2e2;
    color: #991b1b;
  }

  .btn {
    padding: 0.5rem 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
  }

  .btn:hover {
    background: #2563eb;
  }

  .empty-state {
    text-align: center;
    padding: 4rem;
    color: #6b7280;
  }

  .empty-state div {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .news-card {
    background: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    transition: transform 0.2s;
  }

  .news-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .news-header {
    display: flex;
    justify-between;
    align-items: center;
    margin-bottom: 0.75rem;
    font-size: 0.75rem;
  }

  .news-source {
    font-weight: 600;
    color: #3b82f6;
  }

  .news-time {
    color: #9ca3af;
  }

  .news-card h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #111827;
  }

  .news-card p {
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.5;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
