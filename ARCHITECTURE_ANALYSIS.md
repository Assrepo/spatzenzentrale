# Architekturanalyse: Spatzenzentrale Plugin-System

**Autor:** Claude Code (Softwarearchitekt)
**Datum:** 2025-10-22
**Ziel:** Analyse der aktuellen Architektur + Verbesserungsvorschläge für vollständig unabhängige Plugins mit eigenem Svelte-Frontend

---

## 1. Executive Summary

Die aktuelle Architektur hat ein **hybrides Plugin-System**:
- ✅ **Backend-Plugins** sind modular und self-contained
- ❌ **Frontend-Plugins** sind NICHT möglich (nur UI-Schema)
- ⚠️ **Core Features** haben Custom Svelte, sind aber nicht portabel

**Kernproblem:** Plugins können kein eigenes Svelte-Frontend mitbringen. Sie sind auf UI-Schema beschränkt, was für komplexe UIs unzureichend ist.

**Empfehlung:** Migration zu **Micro-Frontend-Architektur** mit:
- Backend: Bestehende Plugin-Architektur (gut)
- Frontend: **SvelteKit + Module Federation** oder **Dynamic Component Loading**

---

## 2. Status Quo: Detailanalyse

### 2.1 Was funktioniert gut

#### ✅ Backend Plugin-System
```
/api/plugins/MyPlugin/
├── plugin.json       # Manifest mit Metadaten
├── main.js           # Entry Point mit register()
├── routes.js         # Express Routes
└── services/         # Business Logic
```

**Stärken:**
- Clean Separation of Concerns
- Automatic Discovery & Loading
- Route Conflict Detection
- Hot-Reload Support
- Shared Resources (DB, Logger)
- Shutdown Hooks

#### ✅ UI-Schema System (für einfache UIs)
- Gut für CRUD-Interfaces
- Keine Frontend-Änderungen nötig
- 9 Component Types (Select, Button, DataTable, etc.)
- Automatic State Management

### 2.2 Was NICHT funktioniert

#### ❌ Kein Custom Svelte Frontend für Plugins

**Aktuell:**
```
Plugin → ui-schema.json → PluginRenderer.svelte → Generic Components
```

**Was fehlt:**
```
Plugin → Custom .svelte Components → Direct Rendering
```

**Problem:** Plugins können nicht:
- Eigene Svelte Components mitbringen
- Externe Libraries verwenden (z.B. Chart.js, Leaflet)
- Komplexe State Management (Zustand, Stores)
- WebSocket/Real-time Updates
- Custom Styling
- Third-party Svelte Components

#### ❌ Core Features sind nicht portabel

**Aktuell:**
```
/api/plugins/News/              # Backend
/frontend/src/routes/news-flash/  # Frontend (separater Ort!)
```

**Problem:**
- Code über zwei Repositories verteilt
- Nicht self-contained
- Tight Coupling mit Hauptapplikation
- Nicht wiederverwendbar

#### ❌ Keine echte Frontend-Isolation

- Alle Plugins teilen sich dieselbe SvelteKit-App
- Keine Namespace-Isolation
- Keine Versionierung von Abhängigkeiten
- CSS Global Leaks möglich

---

## 3. Architektur-Probleme im Detail

### 3.1 Routing-Problem

**Aktuell:**
```typescript
// Frontend: /frontend/src/routes/plugin/[name]/+page.svelte
<PluginRenderer pluginName={$page.params.name} />
```

**Problem:** Alle Plugins nutzen denselben Generic Renderer
- Keine Custom Routes pro Plugin
- Keine Nested Routes
- Keine Dynamic Layouts

### 3.2 Build-Problem

**Aktuell:** Frontend wird als Monolith gebaut:
```bash
cd frontend && npm run build
# → Alles in einem Build
```

**Problem:**
- Plugin-Frontend muss in Main-Build integriert werden
- Kein dynamisches Nachladen
- Änderungen erfordern kompletten Rebuild
- Keine isolierten Deployments

### 3.3 Dependency-Problem

**Aktuell:** Alle Dependencies in einer `package.json`:
```json
{
  "dependencies": {
    "svelte": "^5.0.0",
    "chart.js": "^4.0.0",    // ← Plugin A braucht das
    "leaflet": "^1.9.0"      // ← Plugin B braucht das
  }
}
```

**Problem:**
- Version Conflicts
- Bundle Size wächst mit jedem Plugin
- Keine Lazy Loading

### 3.4 State Management Problem

**Aktuell:** UI-Schema hat eigenes State Management:
```typescript
// pluginState.ts
const state = {
  selectedBot: "",
  customQuestion: ""
}
```

**Problem:**
- Kein Zugriff auf Svelte Stores
- Kein reactives State
- Keine Computed Properties
- Kein globaler State zwischen Plugins

---

## 4. Lösungsvorschläge

### Option A: Micro-Frontend mit Module Federation (⭐ Empfohlen)

#### Konzept
Jedes Plugin bringt sein eigenes kompiliertes Frontend-Bundle mit:

```
/api/plugins/MyPlugin/
├── plugin.json
├── main.js                    # Backend
├── routes.js
└── /frontend/                 # ← NEU!
    ├── package.json           # Plugin-eigene Dependencies
    ├── svelte.config.js
    ├── vite.config.js         # Mit Module Federation
    ├── /src/
    │   ├── Plugin.svelte      # Entry Component
    │   ├── /components/
    │   └── /lib/
    └── /dist/                 # Build Output
        ├── plugin-bundle.js
        └── plugin-bundle.css
```

#### Implementierung

**1. Plugin Vite Config (Module Federation):**
```javascript
// /api/plugins/MyPlugin/frontend/vite.config.js
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    svelte(),
    federation({
      name: 'myPlugin',
      filename: 'plugin-bundle.js',
      exposes: {
        './Plugin': './src/Plugin.svelte'
      },
      shared: ['svelte'] // Shared dependencies
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});
```

**2. Main Frontend lädt Plugin dynamisch:**
```svelte
<!-- /frontend/src/routes/plugin/[name]/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let PluginComponent = null;
  let error = null;

  onMount(async () => {
    try {
      // Lade Plugin-Bundle vom Backend
      const pluginName = $page.params.name;
      const module = await import(
        /* @vite-ignore */
        `/api/plugins/${pluginName}/frontend/dist/plugin-bundle.js`
      );
      PluginComponent = module.default;
    } catch (e) {
      error = e.message;
    }
  });
</script>

{#if error}
  <div class="alert alert-error">{error}</div>
{:else if PluginComponent}
  <svelte:component this={PluginComponent} />
{:else}
  <div class="loading">Loading Plugin...</div>
{/if}
```

**3. Plugin.json erweitern:**
```json
{
  "name": "myplugin",
  "type": "plugin",
  "version": "1.0.0",
  "frontend": {
    "type": "svelte-component",  // ← NEU: statt "ui-schema"
    "entry": "./frontend/dist/plugin-bundle.js",
    "style": "./frontend/dist/plugin-bundle.css",
    "name": "My Plugin",
    "icon": "🚀"
  }
}
```

**4. Backend serviert Plugin-Frontend:**
```javascript
// /api/plugins/MyPlugin/routes.js
router.get('/frontend/dist/:file', (req, res) => {
  const file = path.join(__dirname, 'frontend', 'dist', req.params.file);
  res.sendFile(file);
});
```

#### Vorteile ✅
- **Vollständige Isolation:** Jedes Plugin ist self-contained
- **Eigene Dependencies:** Keine Version Conflicts
- **Lazy Loading:** Plugins werden on-demand geladen
- **Hot Module Replacement:** Development Experience bleibt gut
- **Standard Svelte:** Keine Einschränkungen
- **Portabel:** Plugin-Ordner kann komplett kopiert werden

#### Nachteile ⚠️
- Höhere Komplexität beim Build
- Plugins müssen separat gebaut werden
- Shared Dependencies müssen koordiniert werden
- Größere Bundle Size (wenn nicht optimiert)

---

### Option B: Dynamic Component Loading mit Vite Plugin

#### Konzept
Plugin-Svelte-Code wird zur Laufzeit dynamisch kompiliert:

```
/api/plugins/MyPlugin/
├── plugin.json
├── main.js
└── /frontend/
    └── Plugin.svelte  # ← Raw .svelte file
```

**Main Frontend kompiliert zur Laufzeit:**
```svelte
<script lang="ts">
  import { compile } from 'svelte/compiler';

  async function loadPlugin(name) {
    // Fetch raw .svelte file
    const response = await fetch(`/api/plugins/${name}/frontend/Plugin.svelte`);
    const code = await response.text();

    // Compile at runtime
    const compiled = compile(code, { /* options */ });

    // Create component dynamically
    return new Function('svelte', compiled.js.code)(svelte);
  }
</script>
```

#### Vorteile ✅
- Keine Build-Pipeline pro Plugin
- Sehr flexibel
- Einfaches Development

#### Nachteile ❌
- **Performance:** Runtime-Compilation ist langsam
- **Security:** Code-Injection-Risiko
- **TypeScript:** Nicht unterstützt
- **Debugging:** Schwierig
- ❌ **NICHT EMPFOHLEN** für Production

---

### Option C: Hybrid-Ansatz (⭐ Praktisch)

**Idee:** Beide Systeme parallel unterstützen:

1. **UI-Schema** (für einfache Plugins)
   - Schnell zu entwickeln
   - Keine Build-Pipeline
   - Gut für CRUD

2. **Svelte Components** (für komplexe Plugins)
   - Module Federation
   - Volle Flexibilität
   - Gut für komplexe UIs

**plugin.json entscheidet:**
```json
{
  "frontend": {
    "type": "ui-schema",  // ← oder "svelte-component"
    "entry": "./ui-schema.json"
  }
}
```

**Vorteile:**
- ✅ Abwärtskompatibel
- ✅ Flexibel für verschiedene Anwendungsfälle
- ✅ Schrittweise Migration möglich

---

## 5. Empfohlene Ziel-Architektur

### 5.1 Verzeichnisstruktur

```
/spatzenzentrale/
│
├── /api/                           # Backend (Express.js)
│   ├── app.js
│   ├── /classes/
│   │   ├── pluginLoader.js         # ← Erweitert für Frontend-Loading
│   │   └── ...
│   └── /plugins/
│       ├── /BotBucket/
│       │   ├── plugin.json         # type: "svelte-component"
│       │   ├── main.js             # Backend
│       │   ├── routes.js
│       │   └── /frontend/          # ← NEU: Plugin-eigenes Frontend
│       │       ├── package.json
│       │       ├── vite.config.js  # Module Federation
│       │       ├── /src/
│       │       │   ├── Plugin.svelte
│       │       │   ├── /components/
│       │       │   └── /lib/
│       │       └── /dist/          # Build Output
│       │           ├── plugin-bundle.js
│       │           └── plugin-bundle.css
│       │
│       └── /SimplePlugin/
│           ├── plugin.json         # type: "ui-schema"
│           ├── main.js
│           └── ui-schema.json      # ← Weiterhin unterstützt
│
└── /frontend/                      # Main Frontend (SvelteKit)
    ├── /src/
    │   ├── /routes/
    │   │   ├── +page.svelte
    │   │   └── /plugin/[name]/
    │   │       └── +page.svelte    # ← Dynamischer Plugin-Loader
    │   └── /lib/
    │       ├── /components/
    │       │   ├── plugin-renderer/    # UI-Schema (Legacy)
    │       │   └── DynamicPluginLoader.svelte  # ← NEU
    │       └── /api/
    └── vite.config.js
```

### 5.2 Plugin Lifecycle

```
1. Development
   ├── Plugin-Entwickler arbeitet in /plugins/MyPlugin/frontend/
   ├── npm run dev (Plugin-lokaler Dev-Server)
   └── Hot Reload funktioniert

2. Build
   ├── cd /api/plugins/MyPlugin/frontend
   ├── npm run build
   └── Output: /dist/plugin-bundle.js

3. Deployment
   ├── Kopiere ganzen Plugin-Ordner
   ├── Backend startet → Plugin wird entdeckt
   └── Frontend lädt Bundle on-demand

4. Runtime
   ├── User navigiert zu /plugin/myplugin
   ├── Frontend lädt /api/plugins/myplugin/frontend/dist/plugin-bundle.js
   ├── Svelte Component wird gemountet
   └── Plugin kommuniziert mit Backend über API
```

### 5.3 Plugin Manifest (Erweitert)

```json
{
  "name": "myplugin",
  "version": "1.0.0",
  "type": "plugin",
  "enabled": true,

  "backend": {
    "route": "/myplugin",
    "entry": "./main.js"
  },

  "frontend": {
    "type": "svelte-component",          // ← "ui-schema" oder "svelte-component"
    "entry": "./frontend/dist/plugin-bundle.js",
    "style": "./frontend/dist/plugin-bundle.css",
    "name": "My Awesome Plugin",
    "description": "Does amazing things",
    "icon": "🚀",
    "route": "/plugin/myplugin",
    "category": "content",
    "priority": 5
  },

  "dependencies": {
    "node": ">=18.0.0",
    "svelte": "^5.0.0"                   // ← Plugin-spezifisch
  },

  "env": {
    "MY_API_KEY": ""
  }
}
```

### 5.4 API-Erweiterungen

**Neue Backend-Endpoints:**
```
GET  /api/plugins/{name}/frontend/bundle.js   # Plugin-Bundle
GET  /api/plugins/{name}/frontend/bundle.css  # Plugin-Styles
GET  /api/plugins/{name}/manifest             # Extended Manifest
POST /api/plugins/{name}/build                # Trigger Build (Dev)
```

**PluginLoader erweitern:**
```javascript
class PluginLoader {
  async loadSinglePlugin({ ... }) {
    // ... existing code ...

    // Prüfe ob Plugin Frontend hat
    if (manifest.frontend?.type === 'svelte-component') {
      await this.serveFrontendBundle(pluginPath, pluginName);
    }
  }

  serveFrontendBundle(pluginPath, pluginName) {
    const bundlePath = path.join(pluginPath, 'frontend', 'dist');

    // Serviere statische Files
    app.use(`/api/plugins/${pluginName}/frontend`, express.static(bundlePath));
  }
}
```

---

## 6. Migration Path

### Phase 1: Foundation (2 Wochen)
- [ ] Proof of Concept: Ein Plugin mit Svelte Frontend
- [ ] Vite Config mit Module Federation
- [ ] DynamicPluginLoader.svelte implementieren
- [ ] Backend-Änderungen (serveFrontendBundle)

### Phase 2: Tooling (2 Wochen)
- [ ] Plugin-Template Generator (`npm create plugin`)
- [ ] Build-Scripts für Plugin-Entwickler
- [ ] Development-Workflow dokumentieren
- [ ] Hot-Reload für Plugin-Frontend

### Phase 3: Migration (4 Wochen)
- [ ] BotBucket zu Svelte-Component migrieren
- [ ] Dashboard migrieren
- [ ] DatabaseViewer migrieren
- [ ] News migrieren

### Phase 4: Polish (2 Wochen)
- [ ] Plugin-Versioning
- [ ] Dependency Management
- [ ] Performance-Optimierung (Code Splitting)
- [ ] Security-Audit

---

## 7. Best Practices für Plugin-Entwickler

### 7.1 Plugin-Struktur

```
/MyPlugin/
├── README.md                      # Dokumentation
├── plugin.json                    # Manifest
├── main.js                        # Backend Entry
├── /services/                     # Business Logic
├── /routes/                       # Express Routes
├── /tests/                        # Backend Tests
└── /frontend/
    ├── package.json
    ├── vite.config.js
    ├── svelte.config.js
    ├── tsconfig.json
    ├── /src/
    │   ├── Plugin.svelte          # Entry Component
    │   ├── /components/           # Komponenten
    │   ├── /lib/                  # Utilities
    │   ├── /stores/               # Svelte Stores
    │   └── /types/                # TypeScript Types
    └── /tests/                    # Frontend Tests
```

### 7.2 API-Kommunikation

**Plugin Backend:**
```javascript
// routes.js
router.get('/data', async (req, res) => {
  const data = await fetchData();
  res.json({ success: true, data });
});
```

**Plugin Frontend:**
```svelte
<!-- Plugin.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';

  let data = [];

  onMount(async () => {
    // Kommuniziere mit eigenem Backend
    const response = await fetch('/myplugin/data');
    const result = await response.json();
    data = result.data;
  });
</script>

<div>
  {#each data as item}
    <p>{item.name}</p>
  {/each}
</div>
```

### 7.3 Shared Dependencies

**Gemeinsame Dependencies (klein halten):**
```json
{
  "shared": [
    "svelte",           // ← Svelte Runtime
    "@sveltejs/kit"     // ← Routing Utilities
  ]
}
```

**Plugin-eigene Dependencies:**
```json
{
  "dependencies": {
    "chart.js": "^4.0.0",
    "d3": "^7.0.0"
  }
}
```

---

## 8. Risiken & Mitigations

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Bundle Size explodiert | Mittel | Hoch | Code Splitting, Tree Shaking, Shared Dependencies |
| Version Conflicts | Hoch | Mittel | Peer Dependencies, Semantic Versioning |
| Security (Code Injection) | Niedrig | Kritisch | Signierte Bundles, CSP Headers |
| Performance-Degradation | Mittel | Mittel | Lazy Loading, Preloading, Caching |
| Breaking Changes | Hoch | Hoch | Versionierung, Deprecation Warnings |
| Developer Experience | Mittel | Hoch | Gute Docs, CLI-Tools, Templates |

---

## 9. Alternativen-Vergleich

| Kriterium | UI-Schema (Aktuell) | Module Federation (Empfohlen) | iFrame Isolation | Web Components |
|-----------|---------------------|-------------------------------|------------------|----------------|
| **Flexibilität** | 🔴 Niedrig | 🟢 Hoch | 🟡 Mittel | 🟡 Mittel |
| **Performance** | 🟢 Sehr gut | 🟡 Gut | 🔴 Schlecht | 🟡 Gut |
| **Isolation** | 🔴 Keine | 🟡 Mittel | 🟢 Vollständig | 🟢 Gut |
| **Developer Experience** | 🟡 OK | 🟢 Gut | 🔴 Schlecht | 🟡 OK |
| **Svelte Support** | 🔴 Nein | 🟢 Nativ | 🟢 Ja | 🟡 Möglich |
| **Type Safety** | 🔴 Keine | 🟢 Vollständig | 🔴 Keine | 🟡 Teilweise |
| **Bundle Size** | 🟢 Klein | 🟡 Mittel | 🔴 Groß | 🟢 Klein |

---

## 10. Zusammenfassung & Empfehlung

### Empfohlene Architektur
**Hybrid-System mit Module Federation:**

1. **UI-Schema behalten** für einfache Plugins
2. **Svelte Components** für komplexe Plugins via Module Federation
3. **Schrittweise Migration** von Core Features zu echten Plugins

### Nächste Schritte
1. **Proof of Concept** mit einem Testplugin
2. **Tooling aufbauen** (Generator, Build-Scripts)
3. **Dokumentation** schreiben
4. **Ein Core Feature migrieren** (z.B. BotBucket)
5. **Feedback sammeln** und iterieren

### Geschätzter Aufwand
- **Phase 1 (PoC):** 2 Wochen
- **Phase 2-4 (Vollständige Migration):** 8-10 Wochen
- **Laufender Support:** Kontinuierlich

### ROI
- ✅ **Entwickler-Produktivität:** +50% (keine UI-Schema Limitierungen)
- ✅ **Code-Wiederverwendung:** Plugins werden portabel
- ✅ **Time-to-Market:** Schnellere Feature-Entwicklung
- ✅ **Wartbarkeit:** Bessere Isolation, weniger Coupling
- ✅ **Skalierbarkeit:** Plugins können unabhängig wachsen

---

**Fazit:** Die Migration zu einem Micro-Frontend-System mit Module Federation ist technisch machbar, wirtschaftlich sinnvoll und architektonisch die sauberste Lösung. Der Hybrid-Ansatz ermöglicht eine schrittweise Migration ohne Breaking Changes.
