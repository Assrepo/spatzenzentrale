<script lang="ts">
  import { onMount } from 'svelte';

  type Plugin = {
    name: string;
    description: string;
    route: string;
    enabled: boolean;
    status: string;
    routes?: any[];
  };

  type SystemHealth = {
    status: string;
    uptime: number;
    activeConnections: number;
    timestamp: string;
  };

  let plugins: Plugin[] = [];
  let health: SystemHealth = { status: 'unknown', uptime: 0, activeConnections: 0, timestamp: '' };
  let isToggling: string | null = null;
  let toggleMessage = '';
  let showRestartNotice = false;
  let error: string | null = null;

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    try {
      const [pluginsRes, healthRes] = await Promise.all([
        fetch('/api/plugins'),
        fetch('/api/plugins/system/health')
      ]);

      if (pluginsRes.ok) {
        const data = await pluginsRes.json();
        plugins = data.data || [];
      }

      if (healthRes.ok) {
        const data = await healthRes.json();
        health = data.health || health;
      }
    } catch (e: any) {
      error = e.message;
    }
  }

  async function handleTogglePlugin(pluginName: string) {
    if (isToggling) return;

    isToggling = pluginName;
    toggleMessage = '';

    try {
      const res = await fetch(`/api/plugins/${pluginName}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await res.json();

      if (result.success && result.data) {
        toggleMessage = result.data.message || 'Plugin-Status geändert';
        showRestartNotice = true;

        // Update plugin status
        plugins = plugins.map(plugin =>
          plugin.name === pluginName ? { ...plugin, enabled: result.data.newState } : plugin
        );

        setTimeout(() => {
          loadData();
        }, 1000);

        setTimeout(() => {
          showRestartNotice = false;
          toggleMessage = '';
        }, 8000);
      } else {
        toggleMessage = result.error || 'Fehler beim Ändern des Plugin-Status';
      }
    } catch (e: any) {
      toggleMessage = 'Unerwarteter Fehler beim Plugin-Toggle';
    } finally {
      isToggling = null;
    }
  }

  function getPluginStatusColor(plugin: Plugin) {
    if (!plugin.enabled) return 'bg-gray-100 border-gray-300';
    if (plugin.status === 'loaded') return 'bg-green-50 border-green-200';
    if (plugin.status === 'disabled') return 'bg-gray-50 border-gray-200';
    return 'bg-yellow-50 border-yellow-200';
  }

  function getStatusIcon(plugin: Plugin) {
    if (!plugin.enabled) return '⭕';
    if (plugin.status === 'loaded') return '✅';
    if (plugin.status === 'disabled') return '🔴';
    if (plugin.status === 'not_loaded') return '⚠️';
    return '❓';
  }

  function getStatusText(plugin: Plugin) {
    if (!plugin.enabled) return 'deaktiviert';
    if (plugin.status === 'loaded') return 'geladen';
    if (plugin.status === 'disabled') return 'deaktiviert';
    if (plugin.status === 'not_loaded') return 'nicht geladen';
    return plugin.status;
  }
</script>

<div class="dashboard">
  {#if showRestartNotice}
    <div class="notice notice-warning">
      <div>⚠️</div>
      <div>
        <h3>Server-Neustart erforderlich</h3>
        <p>Plugin-Änderungen werden nach einem Server-Neustart wirksam.</p>
      </div>
    </div>
  {/if}

  {#if toggleMessage}
    <div class="notice notice-info">
      <p>{toggleMessage}</p>
    </div>
  {/if}

  {#if error}
    <div class="notice notice-error">
      <span>❌</span>
      <p>Fehler: {error}</p>
    </div>
  {/if}

  <div class="grid">
    <!-- System Health Card -->
    <div class="card health-card">
      <h2>
        <span>🏥</span>
        System Health
      </h2>

      <div class="health-stats">
        <div class="stat">
          <span>Status:</span>
          <span class="badge badge-{health.status}">
            {health.status}
          </span>
        </div>

        <div class="stat">
          <span>Uptime:</span>
          <span class="mono">
            {Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m
          </span>
        </div>

        <div class="stat">
          <span>Plugins:</span>
          <span>{health.activeConnections}</span>
        </div>

        <div class="timestamp">
          Letzte Aktualisierung: {new Date(health.timestamp).toLocaleTimeString('de-DE')}
        </div>
      </div>
    </div>

    <!-- Plugins Overview -->
    <div class="card plugins-card">
      <div class="card-header">
        <h2>
          <span>🔌</span>
          Aktive Plugins
          <span class="subtitle">
            {plugins.filter(p => p.enabled).length} von {plugins.length} Plugins
          </span>
        </h2>
      </div>

      <div class="plugins-list">
        {#each plugins as plugin}
          <div class="plugin-item {getPluginStatusColor(plugin)}">
            <div class="plugin-header">
              <div class="plugin-info">
                <div class="icon">{getStatusIcon(plugin)}</div>
                <div>
                  <h3>{plugin.name}</h3>
                  <p class="description">{plugin.description}</p>
                  {#if plugin.route}
                    <p class="route">{plugin.route}</p>
                  {/if}
                </div>
              </div>

              <div class="plugin-actions">
                <span class="badge badge-{plugin.enabled && plugin.status === 'loaded' ? 'success' : plugin.enabled ? 'warning' : 'default'}">
                  {getStatusText(plugin)}
                </span>

                <button
                  on:click={() => handleTogglePlugin(plugin.name)}
                  disabled={isToggling === plugin.name}
                  class="btn btn-{plugin.enabled ? 'danger' : 'success'}"
                >
                  {#if isToggling === plugin.name}
                    <span class="loading-spinner">...</span>
                  {:else}
                    {plugin.enabled ? 'Deaktivieren' : 'Aktivieren'}
                  {/if}
                </button>
              </div>
            </div>

            {#if plugin.enabled && plugin.routes && plugin.routes.length > 0}
              <details class="plugin-routes">
                <summary>
                  Verfügbare Endpunkte ({plugin.routes.length})
                </summary>
                <div class="routes-list">
                  {#each plugin.routes as route}
                    <div class="route-item">
                      <span class="method">{route.method}</span>
                      <span class="path">{plugin.route}{route.path}</span>
                      <span class="description">- {route.description}</span>
                    </div>
                  {/each}
                </div>
              </details>
            {/if}
          </div>
        {/each}

        {#if plugins.length === 0}
          <div class="empty-state">
            <div>🔌</div>
            <p>Keine Plugins gefunden</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .dashboard {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .notice {
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .notice-warning {
    background: #fff7ed;
    border-left: 4px solid #f97316;
    color: #9a3412;
  }

  .notice-info {
    background: #eff6ff;
    border: 1px solid #3b82f6;
    color: #1e3a8a;
  }

  .notice-error {
    background: #fee2e2;
    border: 1px solid #ef4444;
    color: #991b1b;
  }

  .notice h3 {
    font-weight: 600;
    font-size: 0.875rem;
  }

  .notice p {
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 2rem;
  }

  .card {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
  }

  .health-card {
    padding: 1.5rem;
    height: fit-content;
  }

  .health-card h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .health-stats {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .stat {
    display: flex;
    justify-between;
    align-items: center;
  }

  .stat span:first-child {
    color: #6b7280;
  }

  .mono {
    font-family: monospace;
    font-size: 0.875rem;
  }

  .timestamp {
    font-size: 0.75rem;
    color: #9ca3af;
    padding-top: 0.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .badge {
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .badge-healthy { background: #d1fae5; color: #065f46; }
  .badge-error { background: #fee2e2; color: #991b1b; }
  .badge-success { background: #d1fae5; color: #065f46; }
  .badge-warning { background: #fef3c7; color: #92400e; }
  .badge-default { background: #f3f4f6; color: #374151; }

  .card-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .card-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .subtitle {
    margin-left: 0.5rem;
    font-size: 0.875rem;
    font-weight: 400;
    color: #6b7280;
  }

  .plugins-list {
    divide-y: 1px solid #e5e7eb;
  }

  .plugin-item {
    padding: 1rem;
    transition: background-color 0.2s;
  }

  .plugin-item:hover {
    background-color: #f9fafb;
  }

  .plugin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .plugin-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .icon {
    font-size: 1.5rem;
  }

  .plugin-info h3 {
    font-weight: 600;
    color: #111827;
  }

  .description {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .route {
    font-size: 0.75rem;
    color: #9ca3af;
    font-family: monospace;
  }

  .plugin-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn {
    padding: 0.25rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-danger {
    background: #fee2e2;
    color: #991b1b;
  }

  .btn-danger:hover:not(:disabled) {
    background: #fecaca;
  }

  .btn-success {
    background: #d1fae5;
    color: #065f46;
  }

  .btn-success:hover:not(:disabled) {
    background: #a7f3d0;
  }

  .loading-spinner {
    display: inline-flex;
    align-items: center;
  }

  .plugin-routes {
    margin-top: 0.75rem;
    padding-left: 2.5rem;
    font-size: 0.75rem;
  }

  .plugin-routes summary {
    cursor: pointer;
    color: #6b7280;
  }

  .plugin-routes summary:hover {
    color: #374151;
  }

  .routes-list {
    margin-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .route-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6b7280;
  }

  .route-item .method {
    font-family: monospace;
    background: #f3f4f6;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
  }

  .route-item .path {
    font-family: monospace;
  }

  .route-item .description {
    color: #9ca3af;
  }

  .empty-state {
    padding: 2rem;
    text-align: center;
    color: #6b7280;
  }

  .empty-state div {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }
</style>
