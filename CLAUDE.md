# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

This is a news aggregation system with a plugin-based architecture consisting of:

- **API Backend** (`/api`): Express.js server with modular plugin system
- **Frontend** (`/frontend`): SvelteKit application with TailwindCSS and DaisyUI
- **Plugin System**: Extensible architecture where each plugin has its own routes, services, and database operations

### Plugin Architecture

⚠️ **WICHTIG:** Es gibt zwei Arten von Modulen:

1. **Echte Plugins** (`"type": "plugin"` in plugin.json)
   - **NUR UI-Schema erlaubt** - keine Custom Svelte Components
   - Komplett self-contained im Plugin-Ordner
   - Entwickler haben **keinen Zugriff auf Frontend-Ordner**
   - Route: `/plugin/{name}` (automatisch)
   - Beispiel: BotBucket

2. **Core Features** (`"type": "core-feature"` in plugin.json)
   - Custom Svelte Components erlaubt
   - Frontend-Code in `frontend/src/` (nicht self-contained)
   - Nur vom Core-Team entwickelt
   - Beispiele: DatabaseViewer, News, QR-Proxy, Dashboard

**Plugin-Struktur (UI-Schema):**
```
/api/plugins/MyPlugin/
├── plugin.json      # Mit "type": "plugin"
├── main.js          # Backend entry point
├── routes.js        # Express routes (optional)
├── ui-schema.json   # Frontend UI definition
└── services/        # Business logic
```

The plugin loader (`/api/classes/pluginLoader.js`) automatically discovers and mounts plugins with conflict resolution.

## Development Commands

### API Backend
```bash
cd api
npm run dev:3001    # Development server on port 3001 (recommended)
npm run dev:3000    # Development server on port 3000
npm start           # Production server (port 3000)
```

### Frontend
```bash
cd frontend
npm run dev         # Development server with hot reload
npm run build       # Production build
npm run preview     # Preview production build
npm run check       # Type checking
npm run lint        # ESLint + Prettier
npm run format      # Format code with Prettier
```

## Database

Uses MySQL with X DevAPI (`@mysql/xdevapi`) for modern document/JSON operations. Database operations are handled through `/api/classes/database.js` with methods like:
- `readNews()`, `writeNews()` for news articles
- `readScrapingHistory()`, `writeScrapingHistory()` for operation logs

## Plugin UI System

**Für Plugin-Entwickler: NUR UI-Schema erlaubt!**

Echte Plugins MÜSSEN UI-Schema verwenden:

```
api/plugins/MyPlugin/
├── plugin.json       # Mit "type": "plugin"
├── main.js
├── routes.js
└── ui-schema.json    # Frontend-Definition (PFLICHT)
```

**Route:** `/plugin/{plugin-name}` (automatisch)
**Vorteile:** Self-contained, portabel, keine Frontend-Änderungen nötig

### Verfügbare UI-Schema Components
- `select`, `textarea`, `checkbox` (Input)
- `button`, `buttongroup` (Actions)
- `info`, `keyvalue`, `statuslist` (Display)
- `datatable` (Listen mit Expandable Rows)

### Wenn UI-Schema nicht ausreicht
→ Feature-Request an Core-Team → Wird als "Core Feature" implementiert (nicht als Plugin)

**Siehe:** `PLUGIN_FRONTEND_GUIDE.md` für Details und Beispiele

## Key Examples

### BotBucket (Echtes Plugin ✅)
- `type: "plugin"` - Self-contained mit UI-Schema
- Integrates with external chatbots for news retrieval
- Uses Puppeteer for web scraping as fallback
- **UI-Schema:** `api/plugins/BotBucket/ui-schema.json`
- **Route:** `/plugin/botbucket`
- Located at `/api/plugins/BotBucket/`

### Core Features (Keine Plugins ❌)

**News** (`type: "core-feature"`)
- Custom Svelte UI in `frontend/src/routes/news-flash/`
- Core news management functionality
- Auto-refresh, komplexe Artikel-Anzeige

**DatabaseViewer** (`type: "core-feature"`)
- Custom Svelte UI in `frontend/src/routes/db-admin/`
- SQL-Editor, dynamische Tabellen

**Dashboard** (`type: "core-feature"`)
- System-UI für Plugin-Management
- Plugin registry und health checks

## Environment Configuration

Plugin-specific environment variables are defined in `plugin.json` under the `env` key. The plugin loader automatically loads these from process.env with fallbacks to default values.

## Development Notes

- Plugin hot-reloading is supported via the PluginLoader class
- All plugins have access to shared database instance via `app.get("database")`
- Frontend plugin metadata in `plugin.json` controls dashboard appearance
- Routes are automatically registered and conflict detection is built-in
- Background jobs and scheduling use BullMQ with Redis (ioredis)
- Puppeteer is used for web scraping with proper cleanup handling

🎨 Development Philosophy

Fundamental Principles
Declarative Code: Express what to do, not how to do it

Composition over Inheritance: Small components that combine together

Immutability: Predictable and traceable state via Zustand

Type Safety: Strict TypeScript without any throughout the project

Performance First: Optimizations from the start, not afterwards

KISS (Keep It Simple): Simplicity over complexity, always

Code Practices
Single Responsibility: Each module has a single responsibility

DRY (Don't Repeat Yourself): Reuse through composition

YAGNI (You Aren't Gonna Need It): No premature abstractions

Fail Fast: Validation and explicit errors immediately

Sprich deutsch