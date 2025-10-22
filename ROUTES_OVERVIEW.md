# Routes Übersicht

## Aktuelle Situation

### Frontend Routes (Svelte)

Alte, manuell erstellte Plugin-UIs:

```
frontend/src/routes/
├── +page.svelte              # Homepage (Index Plugin)
├── dashboard/                # Dashboard Plugin
│   └── +page.svelte
├── bot-management/           # BotBucket Plugin (ALT)
│   └── +page.svelte
├── db-admin/                 # DatabaseViewer Plugin
│   └── +page.svelte
├── news-flash/               # News Plugin
│   └── +page.svelte
├── qr-proxy/                 # QR-Proxy Plugin
│   └── +page.svelte
└── plugin/[name]/            # 🆕 Generic Plugin Route (NEU)
    └── +page.svelte
```

### API Routes (Backend)

```
Port: 3001 (via npm run dev:3001)
Port: 3000 (via npm start)

/api                          # API Plugin
├── /plugins                  # Plugin-Liste
├── /plugins/:name            # Plugin-Details
├── /plugins/:name/ui-schema  # 🆕 UI-Schema
└── /services                 # Frontend Service Discovery

/botbucket                    # BotBucket Plugin
├── /bots
├── /fetch
├── /scrape
└── /history

/dashboard                    # Dashboard Plugin (Backend?)
/api/db-admin                 # DatabaseViewer Plugin
/api/news                     # News Plugin
/qr-proxy                     # QR-Proxy Plugin
```

## Migration Path

### Phase 1: Koexistenz (JETZT)
- ✅ Alte Svelte-Routes bleiben bestehen
- ✅ Neue `/plugin/[name]` Route verfügbar
- ✅ Service Discovery liefert automatisch richtige Route

### Phase 2: Schrittweise Migration
Für jedes Plugin:
1. `ui-schema.json` erstellen
2. Testen unter `/plugin/{name}`
3. Alte Route als Fallback behalten
4. Wenn stabil: Alte Route entfernen

### Phase 3: Cleanup
- Alte Svelte-Routes entfernen
- Nur noch `/plugin/[name]` verwenden

## Route-Zuordnung

### Mit UI-Schema (automatisch)
```
Plugin: botbucket
→ Route: /plugin/botbucket
→ Schema: api/plugins/BotBucket/ui-schema.json
```

### Ohne UI-Schema (manuell)
```
Plugin: botbucket
→ Route: /bot-management (aus plugin.json frontend.route)
→ Template: frontend/src/routes/bot-management/+page.svelte
```

## Zu entfernende Routes (später)

Nach erfolgreicher Migration können gelöscht werden:

```
❌ /bot-management          → /plugin/botbucket
❌ /db-admin               → /plugin/database-viewer (wenn UI-Schema vorhanden)
❌ /news-flash             → /plugin/news (wenn UI-Schema vorhanden)
❌ /qr-proxy               → /plugin/qr-proxy (wenn UI-Schema vorhanden)
```

**Behalten:**
```
✅ /                       # Homepage
✅ /dashboard              # Dashboard (System-UI)
✅ /plugin/[name]          # Generic Plugin Route
```

## Port-Konfiguration

### Development
```bash
# API Backend
cd api
npm run dev:3001          # Port 3001

# Frontend
cd frontend
npm run dev               # Port 5173
```

### Production
```bash
# API Backend
cd api
npm start                 # Port 3000 (default)

# Frontend
cd frontend
npm run build
npm run preview           # Port 4173
```

### Proxy-Konfiguration

Frontend proxied alle API-Requests:

```typescript
// vite.config.ts
proxy: {
  '/api': 'http://sus-web-01-lp:3001',
  '/botbucket': 'http://sus-web-01-lp:3001'
}
```

**Wichtig:** Bei neuen Plugins mit Backend-Routes, Proxy erweitern!

## Service Discovery

```javascript
// Automatische Route-Erkennung
GET /api/services

Response:
{
  "success": true,
  "data": [
    {
      "name": "Bot Management",
      "route": "/plugin/botbucket",    // Auto-generiert!
      "hasUISchema": true,
      "renderMode": "schema-driven"
    },
    {
      "name": "News Flash",
      "route": "/news-flash",          // Manuell aus plugin.json
      "hasUISchema": false,
      "renderMode": "custom"
    }
  ]
}
```

## Next Steps

1. ✅ Teste `/plugin/botbucket`
2. ⏳ Erstelle UI-Schemas für andere Plugins
3. ⏳ Migriere Schritt für Schritt
4. ⏳ Entferne alte Routes wenn stabil
