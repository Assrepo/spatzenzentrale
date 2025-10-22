# Plugin Frontend Guide

## ⚠️ WICHTIG: Plugin-Klassifizierung

Es gibt **zwei Arten von Modulen** im System:

### 1. **Echte Plugins** (UI-Schema - Self-Contained)
- **NUR UI-Schema erlaubt** - keine Custom Svelte Components
- Komplett im Plugin-Ordner
- Entwickler haben **keinen Zugriff auf Frontend-Ordner**
- `"type": "plugin"` in plugin.json

### 2. **Core Features** (Custom Svelte - Core Team)
- Komplexe UIs mit Custom Svelte Components
- Im Frontend-Ordner gepflegt
- Nur vom Core-Team entwickelt
- `"type": "core-feature"` in plugin.json

---

## Echte Plugins: UI-Schema (Self-Contained)

**Wann nutzen:**
- CRUD-Operationen
- Formulare & Buttons
- Listen & Tabellen
- Status-Anzeigen
- 90% der Standard-Use-Cases

**Vorteile:**
✅ Komplett im Plugin-Ordner
✅ Keine Frontend-Änderungen nötig
✅ Automatisches Routing
✅ Konsistente UX
✅ Schnelle Entwicklung

**Struktur:**
```
api/plugins/MyPlugin/
├── plugin.json
├── main.js
├── routes.js
└── ui-schema.json    # Frontend-Definition
```

**Route:** `/plugin/{plugin-name}` (automatisch)

**Beispiel:** BotBucket Plugin (`api/plugins/BotBucket/ui-schema.json`)

---

## Core Features: Custom Svelte (Core Team Only)

**⚠️ NICHT FÜR PLUGIN-ENTWICKLER ZUGÄNGLICH**

Core Features sind **keine echten Plugins** - sie sind Teil der Hauptanwendung.

**Wann als Core Feature klassifizieren:**
- Komplexe Interaktionen
- Custom Layouts
- Spezielle UI-Logik
- Drittanbieter-Libraries
- System-kritische UIs

**Charakteristiken:**
✅ Volle Flexibilität
✅ Beliebige Svelte/JavaScript-Features
✅ Custom Styling
✅ Externe Libraries
❌ **Nicht self-contained** (Frontend + Backend getrennt)
❌ **Nur Core-Team-Zugriff**
❌ **KEIN Plugin im eigentlichen Sinne**

**Struktur:**
```
api/plugins/MyFeature/
├── plugin.json        # Mit "type": "core-feature"
├── main.js
└── routes.js

frontend/src/
├── lib/components/
│   └── MyFeatureComponent.svelte    # Logik
└── routes/
    └── my-feature/
        └── +page.svelte            # Wrapper
```

**Route:** Manuell in `plugin.json` definiert

**Beispiele:**
- DatabaseViewer (`/db-admin`) - SQL-Editor, zu komplex für Schema
- News (`/news-flash`) - Auto-Refresh, komplexe Artikel-Anzeige
- QR-Proxy (`/qr-proxy`) - CRUD mit vielen Features
- Dashboard (`/dashboard`) - System-UI

---

## Entscheidungsbaum für Plugin-Entwickler

```
Ist mein Feature...
├─ Einfache Forms/Listen/Buttons? → ✅ Echtes Plugin (UI-Schema)
├─ Standard CRUD-Operationen? → ✅ Echtes Plugin (UI-Schema)
├─ Button-Trigger für Backend-Actions? → ✅ Echtes Plugin (UI-Schema)
├─ Tabellen mit Daten anzeigen? → ✅ Echtes Plugin (UI-Schema)
│
└─ Komplex (SQL-Editor, Custom Tabs, Externe Libraries, Drag & Drop)?
   → ❌ KEIN Plugin → Core Feature (Core-Team kontaktieren)
```

**Als Plugin-Entwickler:** Du kannst **NUR UI-Schema-Plugins** erstellen.
**Für komplexe UIs:** Feature-Request an Core-Team stellen.

---

## Plugin-Entwickler: Was du tun kannst

### Neues Plugin erstellen

**Du MUSST UI-Schema verwenden:**
1. Erstelle Ordner in `api/plugins/MeinPlugin/`
2. Erstelle `plugin.json` mit `"type": "plugin"`
3. Erstelle `ui-schema.json` für dein Frontend
4. Teste unter `/plugin/meinplugin`

**Du darfst NICHT:**
- Dateien in `frontend/` Ordner erstellen oder ändern
- Custom Svelte Components verwenden
- Symlinks oder Pfade außerhalb deines Plugin-Ordners nutzen

### Wenn UI-Schema nicht ausreicht

**Feature-Request an Core-Team:**
1. Beschreibe dein Use-Case
2. Erkläre warum UI-Schema nicht ausreicht
3. Core-Team entscheidet ob Feature als "Core Feature" aufgenommen wird

---

## Automatisches Routing

Die Service Discovery API (`/api/services`) erkennt automatisch:

```javascript
// Plugin MIT ui-schema.json
{
  "route": "/plugin/myplugin",  // Auto-generiert
  "hasUISchema": true,
  "renderMode": "schema-driven"
}

// Plugin OHNE ui-schema.json
{
  "route": "/my-custom-route",  // Aus plugin.json
  "hasUISchema": false,
  "renderMode": "custom"
}
```

---

## Best Practices

### UI-Schema Plugins
1. Starte einfach mit Button + Info
2. Erweitere inkrementell
3. Teste jeden Component einzeln
4. Nutze vorhandene Patterns (siehe BotBucket)

### Custom Component Plugins
1. Component-Logik in `$lib/components/{PluginName}.svelte`
2. Route als dünner Wrapper: `import Component from '$lib/components/{PluginName}.svelte'`
3. Einheitliches Styling mit TailwindCSS + DaisyUI
4. Error Handling & Loading States

---

## Aktuelle Modul-Übersicht

| Name | Klassifizierung | Type | Route | Begründung |
|------|----------------|------|-------|------------|
| **BotBucket** | ✅ **Echtes Plugin** | UI-Schema | `/plugin/botbucket` | Buttons, Forms, Listen → Perfekt für Schema |
| DatabaseViewer | ❌ Core Feature | Custom Svelte | `/db-admin` | SQL-Editor, dynamische Tabellen → Zu komplex |
| News | ❌ Core Feature | Custom Svelte | `/news-flash` | Auto-Refresh, komplexe Artikel-Anzeige → Core Team |
| QR-Proxy | ❌ Core Feature | Custom Svelte | `/qr-proxy` | CRUD, Forms, Image-Display → Core Team |
| Dashboard | ❌ Core Feature | Custom Svelte | `/dashboard` | System-UI, Plugin-Management → Core System |

**Nur BotBucket ist ein echtes Plugin im Sinne der Self-Contained-Architektur.**

---

## Zukunft

**Geplant:**
- Mehr UI-Schema Components (Charts, File-Upload, etc.)
- Hot-Reload für UI-Schemas
- UI-Schema Editor/Builder

**Nicht geplant:**
- Svelte-im-Plugin (zu komplex, keine Vorteile)
- Symlinks (nicht portabel)
- Automatische Migration (zu riskant)

---

## Fazit

**Für Plugin-Entwickler:**
- Du kannst **NUR UI-Schema-Plugins** erstellen
- Dein Code bleibt komplett in `api/plugins/DeinPlugin/`
- Kein Zugriff auf Frontend-Repository nötig
- Dein Plugin ist portabel und self-contained ✅

**Für Core-Team:**
- Core Features dürfen Custom Svelte nutzen
- Diese sind **keine echten Plugins** sondern Teil der Hauptanwendung
- Sie liegen im Frontend-Repository und sind nicht self-contained

Diese strikte Trennung ermöglicht:
- ✅ Echte Plugin-Isolation
- ✅ Entwickler ohne Frontend-Zugriff können Plugins schreiben
- ✅ Portabilität (Plugin-Ordner reicht)
- ✅ Klare Verantwortlichkeiten
