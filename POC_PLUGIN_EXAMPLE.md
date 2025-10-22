# Proof of Concept: Plugin mit eigenem Svelte-Frontend

Dieses Dokument zeigt, wie ein Plugin mit eigenem Svelte-Frontend konkret umgesetzt werden könnte.

---

## Beispiel: "Weather Dashboard" Plugin

Ein Plugin, das Wetterdaten anzeigt mit Charts, Maps und Echtzeit-Updates.
(Unmöglich mit UI-Schema - perfekt für Svelte Components)

---

## Verzeichnisstruktur

```
/api/plugins/Weather/
├── plugin.json                    # Manifest
├── main.js                        # Backend Entry Point
├── routes.js                      # Express Routes
├── /services/
│   └── weatherService.js          # Business Logic
│
└── /frontend/                     # ← Plugin-eigenes Frontend
    ├── package.json
    ├── vite.config.js             # Mit Module Federation
    ├── svelte.config.js
    ├── tsconfig.json
    │
    ├── /src/
    │   ├── Plugin.svelte          # Entry Component
    │   │
    │   ├── /components/
    │   │   ├── WeatherCard.svelte
    │   │   ├── TemperatureChart.svelte
    │   │   └── WeatherMap.svelte
    │   │
    │   ├── /lib/
    │   │   ├── api.ts             # API Client
    │   │   └── utils.ts
    │   │
    │   └── /stores/
    │       └── weather.ts         # Svelte Store
    │
    └── /dist/                     # Build Output
        ├── plugin-bundle.js
        └── plugin-bundle.css
```

---

## 1. Plugin Manifest (`plugin.json`)

```json
{
  "name": "weather",
  "version": "1.0.0",
  "type": "plugin",
  "enabled": true,
  "description": "Weather Dashboard with real-time updates",

  "backend": {
    "route": "/weather",
    "entry": "./main.js"
  },

  "frontend": {
    "type": "svelte-component",
    "entry": "./frontend/dist/plugin-bundle.js",
    "style": "./frontend/dist/plugin-bundle.css",

    "name": "Weather Dashboard",
    "description": "Echtzei-Wetterdaten mit Charts und Karten",
    "icon": "🌤️",
    "route": "/plugin/weather",
    "category": "monitoring",
    "priority": 7,

    "capabilities": [
      "real-time-updates",
      "charts",
      "maps"
    ]
  },

  "dependencies": {
    "node": ">=18.0.0",
    "svelte": "^5.0.0"
  },

  "env": {
    "WEATHER_API_KEY": "",
    "WEATHER_UPDATE_INTERVAL": "300000"
  }
}
```

---

## 2. Backend (`main.js`)

```javascript
/**
 * Weather Plugin - Backend Entry Point
 */
const weatherService = require('./services/weatherService');

async function register({ express, mount, manifest, logger }) {
  const router = express.Router();

  // API Routes
  router.get('/current', async (req, res) => {
    try {
      const { city } = req.query;
      const data = await weatherService.getCurrentWeather(city);
      res.json({ success: true, data });
    } catch (error) {
      logger.error('Failed to fetch weather:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/forecast', async (req, res) => {
    try {
      const { city, days = 5 } = req.query;
      const data = await weatherService.getForecast(city, days);
      res.json({ success: true, data });
    } catch (error) {
      logger.error('Failed to fetch forecast:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // WebSocket für Echtzeit-Updates (optional)
  router.get('/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const interval = setInterval(async () => {
      const data = await weatherService.getCurrentWeather('Berlin');
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }, 10000);

    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  });

  // Serviere Frontend-Bundle
  mount('/weather', router);

  logger.success('Weather Plugin registered successfully');
}

// Cleanup
function onShutdown({ logger }) {
  logger.info('Weather Plugin shutting down');
}

module.exports = { register, onShutdown };
```

---

## 3. Frontend Vite Config (`frontend/vite.config.js`)

```javascript
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    svelte(),
    federation({
      name: 'weatherPlugin',
      filename: 'plugin-bundle.js',

      // Expose Plugin Component
      exposes: {
        './Plugin': './src/Plugin.svelte'
      },

      // Shared Dependencies mit Main App
      shared: {
        'svelte': {
          singleton: true,
          requiredVersion: '^5.0.0'
        }
      }
    })
  ],

  build: {
    target: 'esnext',
    minify: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: 'plugin-bundle.js',
        chunkFileNames: '[name].js',
        assetFileNames: 'plugin-bundle.[ext]'
      }
    }
  },

  server: {
    port: 5174, // Plugin-eigener Dev-Server
    proxy: {
      '/weather': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
```

---

## 4. Frontend Entry Component (`frontend/src/Plugin.svelte`)

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import WeatherCard from './components/WeatherCard.svelte';
  import TemperatureChart from './components/TemperatureChart.svelte';
  import WeatherMap from './components/WeatherMap.svelte';
  import { weatherStore } from './stores/weather';
  import { fetchCurrentWeather, fetchForecast } from './lib/api';

  let city = 'Berlin';
  let loading = true;
  let error: string | null = null;

  // Echtzeit-Updates via EventSource
  let eventSource: EventSource | null = null;

  onMount(async () => {
    try {
      // Initial Load
      await loadWeatherData();

      // Setup Real-time Updates
      setupRealtimeUpdates();

      loading = false;
    } catch (e) {
      error = e.message;
      loading = false;
    }
  });

  onDestroy(() => {
    if (eventSource) {
      eventSource.close();
    }
  });

  async function loadWeatherData() {
    const [current, forecast] = await Promise.all([
      fetchCurrentWeather(city),
      fetchForecast(city, 5)
    ]);

    weatherStore.set({
      current,
      forecast
    });
  }

  function setupRealtimeUpdates() {
    eventSource = new EventSource('/weather/stream');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      weatherStore.update(state => ({
        ...state,
        current: data
      }));
    };

    eventSource.onerror = () => {
      console.error('EventSource error');
      eventSource?.close();
    };
  }

  async function handleCityChange() {
    loading = true;
    await loadWeatherData();
    loading = false;
  }
</script>

<div class="weather-dashboard">
  <!-- Header -->
  <header class="dashboard-header">
    <h1>🌤️ Weather Dashboard</h1>
    <div class="city-selector">
      <input
        type="text"
        bind:value={city}
        placeholder="Enter city..."
        class="input input-bordered"
      />
      <button
        on:click={handleCityChange}
        class="btn btn-primary"
        disabled={loading}
      >
        Update
      </button>
    </div>
  </header>

  {#if loading}
    <div class="loading-state">
      <div class="loading loading-spinner loading-lg"></div>
      <p>Loading weather data...</p>
    </div>
  {:else if error}
    <div class="alert alert-error">
      <span>Error: {error}</span>
    </div>
  {:else}
    <!-- Weather Grid -->
    <div class="weather-grid">
      <!-- Current Weather Card -->
      <div class="card">
        <WeatherCard data={$weatherStore.current} />
      </div>

      <!-- Temperature Chart -->
      <div class="card">
        <TemperatureChart forecast={$weatherStore.forecast} />
      </div>

      <!-- Weather Map -->
      <div class="card map-container">
        <WeatherMap location={$weatherStore.current.location} />
      </div>
    </div>
  {/if}
</div>

<style>
  .weather-dashboard {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .dashboard-header h1 {
    font-size: 2rem;
    font-weight: bold;
  }

  .city-selector {
    display: flex;
    gap: 1rem;
  }

  .weather-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
  }

  .card {
    background: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .map-container {
    grid-column: 1 / -1;
    min-height: 400px;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 1rem;
  }
</style>
```

---

## 5. Svelte Store (`frontend/src/stores/weather.ts`)

```typescript
import { writable } from 'svelte/store';

interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    condition: string;
    location: {
      lat: number;
      lon: number;
    };
  };
  forecast: Array<{
    date: string;
    temperature: number;
    condition: string;
  }>;
}

export const weatherStore = writable<WeatherData>({
  current: {
    temperature: 0,
    humidity: 0,
    condition: '',
    location: { lat: 0, lon: 0 }
  },
  forecast: []
});
```

---

## 6. API Client (`frontend/src/lib/api.ts`)

```typescript
const BASE_URL = '/weather';

export async function fetchCurrentWeather(city: string) {
  const response = await fetch(`${BASE_URL}/current?city=${city}`);

  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  const result = await response.json();
  return result.data;
}

export async function fetchForecast(city: string, days: number = 5) {
  const response = await fetch(`${BASE_URL}/forecast?city=${city}&days=${days}`);

  if (!response.ok) {
    throw new Error('Failed to fetch forecast');
  }

  const result = await response.json();
  return result.data;
}
```

---

## 7. Subkomponente (`frontend/src/components/TemperatureChart.svelte`)

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';

  export let forecast: Array<{
    date: string;
    temperature: number;
  }> = [];

  let canvas: HTMLCanvasElement;
  let chart: Chart;

  onMount(() => {
    const ctx = canvas.getContext('2d');

    chart = new Chart(ctx!, {
      type: 'line',
      data: {
        labels: forecast.map(f => f.date),
        datasets: [{
          label: 'Temperature (°C)',
          data: forecast.map(f => f.temperature),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });

    return () => {
      chart.destroy();
    };
  });

  // Update Chart wenn forecast sich ändert
  $: if (chart && forecast) {
    chart.data.labels = forecast.map(f => f.date);
    chart.data.datasets[0].data = forecast.map(f => f.temperature);
    chart.update();
  }
</script>

<div class="chart-container">
  <h3>5-Day Forecast</h3>
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .chart-container {
    height: 300px;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  canvas {
    max-height: 250px;
  }
</style>
```

---

## 8. Plugin Package.json (`frontend/package.json`)

```json
{
  "name": "@spatzenzentrale/weather-plugin",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-check --tsconfig ./tsconfig.json"
  },
  "dependencies": {
    "chart.js": "^4.4.0",
    "leaflet": "^1.9.4"
  },
  "devDependencies": {
    "@originjs/vite-plugin-federation": "^1.3.5",
    "@sveltejs/vite-plugin-svelte": "^4.0.0",
    "@tsconfig/svelte": "^5.0.0",
    "svelte": "^5.0.0",
    "svelte-check": "^4.0.0",
    "tslib": "^2.6.0",
    "typescript": "^5.0.0",
    "vite": "^6.0.0"
  },
  "peerDependencies": {
    "svelte": "^5.0.0"
  }
}
```

---

## 9. Main Frontend: Dynamic Plugin Loader

### `/frontend/src/lib/components/DynamicPluginLoader.svelte`

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  export let pluginName: string;

  let PluginComponent: any = null;
  let loading = true;
  let error: string | null = null;
  let manifest: any = null;

  onMount(async () => {
    try {
      // 1. Load Plugin Manifest
      const manifestRes = await fetch(`/api/plugins/${pluginName}`);
      const manifestData = await manifestRes.json();
      manifest = manifestData.data;

      // 2. Check Plugin Type
      if (manifest.frontend?.type === 'svelte-component') {
        // Load Svelte Component Bundle
        await loadSvelteComponent();
      } else if (manifest.frontend?.type === 'ui-schema') {
        // Load UI-Schema (Legacy)
        const { default: PluginRenderer } = await import('./plugin-renderer/PluginRenderer.svelte');
        PluginComponent = PluginRenderer;
      } else {
        throw new Error('Unknown plugin type');
      }

      loading = false;
    } catch (e) {
      error = e.message;
      loading = false;
    }
  });

  async function loadSvelteComponent() {
    // Dynamically import plugin bundle
    const bundleUrl = `/api/plugins/${pluginName}/frontend/dist/plugin-bundle.js`;

    // Load CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = `/api/plugins/${pluginName}/frontend/dist/plugin-bundle.css`;
    document.head.appendChild(cssLink);

    // Load JS Module
    const module = await import(
      /* @vite-ignore */
      bundleUrl
    );

    PluginComponent = module.default;
  }
</script>

<div class="plugin-loader">
  {#if loading}
    <div class="loading-container">
      <div class="loading loading-spinner loading-lg"></div>
      <p>Loading {manifest?.frontend?.name || pluginName}...</p>
    </div>
  {:else if error}
    <div class="alert alert-error">
      <h3>Failed to load plugin</h3>
      <p>{error}</p>
    </div>
  {:else if PluginComponent}
    {#if manifest?.frontend?.type === 'svelte-component'}
      <!-- Render Custom Svelte Component -->
      <svelte:component this={PluginComponent} />
    {:else}
      <!-- Render UI-Schema (Legacy) -->
      <svelte:component this={PluginComponent} {pluginName} />
    {/if}
  {/if}
</div>

<style>
  .plugin-loader {
    min-height: 400px;
    width: 100%;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 1rem;
  }
</style>
```

### `/frontend/src/routes/plugin/[name]/+page.svelte`

```svelte
<script lang="ts">
  import DynamicPluginLoader from '$lib/components/DynamicPluginLoader.svelte';
  import { page } from '$app/stores';

  $: pluginName = $page.params.name;
</script>

<DynamicPluginLoader {pluginName} />
```

---

## 10. Development Workflow

### Für Plugin-Entwickler:

```bash
# 1. Plugin erstellen
cd /api/plugins/Weather/frontend

# 2. Dependencies installieren
npm install

# 3. Development Server starten
npm run dev
# → Läuft auf http://localhost:5174
# → Hot Reload funktioniert

# 4. Testen im Main Frontend
# Öffne: http://localhost:5173/plugin/weather

# 5. Build für Production
npm run build
# → Output: /dist/plugin-bundle.js + .css

# 6. Deploy
# Kopiere ganzen /Weather Ordner auf Server
```

---

## 11. Vorteile dieser Architektur

### ✅ Vollständige Isolation
- Plugin kann **alle Svelte Features** nutzen
- **Eigene Dependencies** (Chart.js, Leaflet, etc.)
- **Eigene Stores** und State Management
- **Custom Styling** ohne Conflicts

### ✅ Echte Modularität
- **Self-contained**: Alles in einem Ordner
- **Portabel**: Ordner kopieren = Plugin deployed
- **Versioniert**: Jedes Plugin eigene Version
- **Hot Reload**: Development Experience wie Hauptapp

### ✅ Performance
- **Lazy Loading**: Plugin wird nur geladen, wenn benötigt
- **Code Splitting**: Shared Dependencies (Svelte) nur einmal
- **Tree Shaking**: Unbenutzter Code wird entfernt
- **Caching**: Browser cached Bundle

### ✅ Developer Experience
- **Standard Svelte**: Keine neue Syntax lernen
- **TypeScript Support**: Volle Type Safety
- **Svelte DevTools**: Funktionieren out-of-the-box
- **Testing**: Standard Vitest/Playwright

---

## 12. Vergleich: UI-Schema vs Svelte Component

### UI-Schema (Alt)
```json
{
  "sections": [{
    "components": [
      {
        "type": "info",
        "text": "Temperature: 22°C"
      }
    ]
  }]
}
```
❌ Keine Charts
❌ Keine Maps
❌ Keine Real-time Updates
❌ Limitierte Component Types

### Svelte Component (Neu)
```svelte
<script>
  import Chart from 'chart.js';
  import Leaflet from 'leaflet';

  // Beliebiger Code!
</script>

<TemperatureChart />
<WeatherMap />
```
✅ Alle Libraries nutzbar
✅ Volle Svelte Power
✅ Real-time Updates
✅ Keine Limitierungen

---

## Fazit

Dieses Beispiel zeigt, wie ein Plugin mit **eigenem Svelte-Frontend** funktionieren würde:

1. **Backend**: Bleibt wie gehabt (Express Routes)
2. **Frontend**: Vollwertiges Svelte-Projekt mit eigenem Build
3. **Integration**: Module Federation lädt Plugin on-demand
4. **Isolation**: Keine Konflikte mit Main App oder anderen Plugins

**Nächster Schritt:** PoC implementieren und testen!
