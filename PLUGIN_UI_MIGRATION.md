# Plugin UI System - Migration Guide

## Übersicht

Das neue Plugin-System ermöglicht es, Plugin-UIs vollständig im Plugin-Ordner zu definieren, ohne manuell Frontend-Code hinzufügen zu müssen.

## Wie es funktioniert

### Old Way (Manuell)
```
api/plugins/BotBucket/      # Backend
frontend/src/routes/        # Frontend (separat!)
  └── bot-management/
      └── +page.svelte
```

### New Way (Self-Contained)
```
api/plugins/BotBucket/
  ├── plugin.json          # Plugin-Konfiguration
  ├── main.js              # Backend-Logik
  ├── routes.js            # API-Routes
  └── ui-schema.json       # 🆕 UI-Definition
```

## Migration Steps

### 1. UI-Schema erstellen

Erstelle `ui-schema.json` in deinem Plugin-Ordner:

```json
{
  "title": "Mein Plugin",
  "description": "Plugin-Beschreibung",
  "icon": "🔌",
  "layout": "two-column",
  "sections": [
    {
      "id": "config",
      "title": "Konfiguration",
      "icon": "⚙️",
      "column": "left",
      "components": [
        {
          "type": "select",
          "id": "option",
          "label": "Wähle eine Option",
          "dataSource": {
            "endpoint": "/my-plugin/options",
            "valueField": "id",
            "labelField": "name"
          }
        },
        {
          "type": "button",
          "label": "Aktion ausführen",
          "action": {
            "type": "api",
            "endpoint": "/my-plugin/action",
            "method": "POST",
            "params": ["option"],
            "successMessage": "Erfolgreich!",
            "errorMessage": "Fehler!"
          }
        }
      ]
    }
  ]
}
```

### 2. Verfügbare UI-Komponenten

#### Input Components
- **select**: Dropdown-Menü mit API-Datenquelle
- **textarea**: Mehrzeilige Texteingabe
- **checkbox**: Checkbox mit Label

#### Display Components
- **info**: Informationstext (HTML erlaubt)
- **keyvalue**: Key-Value Paare anzeigen
- **statuslist**: Status-Listen mit Icons
- **datatable**: Dynamische Tabellen mit Expandable Rows

#### Action Components
- **button**: Button mit API-Action
- **buttongroup**: Gruppe von Buttons

### 3. Layout-Optionen

#### Single Column
```json
{
  "layout": "single",
  "sections": [...]
}
```

#### Two Column
```json
{
  "layout": "two-column",
  "sections": [
    {"column": "left", ...},
    {"column": "right", ...},
    {"column": "full", ...}  // Full width section
  ]
}
```

### 4. Action Types

#### API Call
```json
{
  "type": "button",
  "action": {
    "type": "api",
    "endpoint": "/my-plugin/action",
    "method": "POST",
    "params": ["param1", "param2"],
    "successMessage": "Success!",
    "errorMessage": "Error!",
    "onSuccess": "refreshHistory"  // Optional callback
  }
}
```

#### Navigation
```json
{
  "type": "button",
  "action": {
    "type": "navigate",
    "target": "/other-page"
  }
}
```

#### Refresh
```json
{
  "type": "button",
  "action": {
    "type": "refresh",
    "target": "dataTableId"  // Optional: specific component
  }
}
```

### 5. DataTable Component

Komplexestes Component - für Listen mit Expandable Details:

```json
{
  "type": "datatable",
  "id": "myTable",
  "dataSource": {
    "endpoint": "/my-plugin/data",
    "params": {"limit": 20}
  },
  "columns": [
    {"field": "name", "header": "Name", "width": "200px"},
    {"field": "status", "header": "Status", "type": "badge"},
    {"field": "date", "header": "Datum", "type": "datetime"}
  ],
  "expandable": {
    "field": "details",
    "template": "custom"
  },
  "actions": [
    {
      "label": "🔄 Aktualisieren",
      "action": {"type": "refresh"}
    },
    {
      "label": "🗑️ Löschen",
      "action": {
        "type": "api",
        "endpoint": "/my-plugin/delete",
        "method": "DELETE",
        "confirm": {
          "title": "Wirklich löschen?",
          "message": "Diese Aktion kann nicht rückgängig gemacht werden.",
          "confirmText": "Ja, löschen",
          "cancelText": "Abbrechen"
        }
      },
      "variant": "danger"
    }
  ],
  "emptyState": {
    "icon": "📭",
    "title": "Keine Daten",
    "subtitle": "Es gibt noch keine Einträge"
  }
}
```

## Routing

### Automatisches Routing

Das System erkennt automatisch ob ein Plugin ein UI-Schema hat:

- **Mit UI-Schema**: Route = `/plugin/{plugin-name}`
- **Ohne UI-Schema**: Route = `{frontend.route}` aus plugin.json

### Service Discovery API

Die `/api/services` API liefert automatisch:
```json
{
  "route": "/plugin/botbucket",  // Auto-generiert wenn UI-Schema vorhanden
  "hasUISchema": true,
  "renderMode": "schema-driven"
}
```

## Migration Checklist

- [ ] `ui-schema.json` im Plugin-Ordner erstellen
- [ ] UI-Komponenten aus altem Svelte-Template übertragen
- [ ] API-Endpoints prüfen und ggf. anpassen
- [ ] Altes Svelte-Template als Backup behalten
- [ ] Testen: `/plugin/{plugin-name}` aufrufen
- [ ] Wenn alles funktioniert: Altes Template löschen

## Beispiel: BotBucket Plugin

Siehe `/api/plugins/BotBucket/ui-schema.json` für ein vollständiges Beispiel.

### Alte Route (behalten für Kompatibilität)
- `/bot-management` → Manuelles Svelte-Template

### Neue Route (automatisch generiert)
- `/plugin/botbucket` → Schema-basiert

## Troubleshooting

### UI wird nicht geladen
1. Prüfe ob `ui-schema.json` valides JSON ist
2. Prüfe ob API-Endpoint `/api/plugins/{name}/ui-schema` funktioniert
3. Browser-Konsole auf Fehler prüfen

### API-Calls funktionieren nicht
1. Prüfe ob Endpoints korrekt sind
2. Prüfe Parameter-Mapping in ButtonComponent.svelte:288
3. Network-Tab in DevTools prüfen

### Komponenten werden nicht gerendert
1. Prüfe ob Component-Type unterstützt wird (siehe Component.svelte)
2. Prüfe ob alle Required-Fields vorhanden sind

## Best Practices

1. **Starte einfach**: Beginne mit Button + Info-Components
2. **Inkrementell erweitern**: Füge nach und nach komplexere Components hinzu
3. **API-First**: Stelle sicher, dass Backend-Endpoints funktionieren
4. **Testen**: Teste jeden Component einzeln

## Vorteile des neuen Systems

✅ Plugin ist wirklich standalone
✅ Keine Frontend-Änderungen nötig
✅ Einfache Distribution
✅ Konsistente UX
✅ Schnelle Entwicklung
✅ Hot-Reload fähig

## Limitierungen

❌ Nur vordefinierte Components
❌ Kein freies Svelte/HTML
❌ Limitierte Styling-Optionen

→ Für 95% der Use Cases ausreichend!
→ Bei Bedarf: Custom Components später ergänzbar
