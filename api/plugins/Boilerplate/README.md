# Beispiel Plugin

Dieses Plugin demonstriert die minimalen Anforderungen:

- `plugin.json` definiert Name, Route, Flags und optionale ENV-Doku.
- `main.js` exportiert `register(ctx)` (Pflicht) und `onShutdown?(ctx)` (optional).
- Routen liegen in `routes/` und bauen ihren eigenen `express.Router()`.

## Manifest-Felder

- **name**: Eindeutiger Plugin-Name (Pflicht).
- **route**: Mount-Pfad unter dem das Plugin erreichbar ist (z. B. `/example`).
- **enabled**: `true/false` – erlaubt Deaktivierung ohne Codeänderung.
- **env**: Optionale Doku/Defaults für benötigte Umgebungsvariablen.