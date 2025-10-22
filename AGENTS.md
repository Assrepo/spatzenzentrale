# Repository Guidelines

## Project Structure & Module Organization
- Root contains two apps: `api/` (Express) and `frontend/` (SvelteKit).
- Backend: `api/app.js`, plugins in `api/plugins/<PluginName>/` with `plugin.json` and `main.js` (mounted via `classes/pluginLoader.js`). Shared helpers live in `api/classes/`.
- Frontend: Svelte sources in `frontend/src`, static assets in `frontend/static`.
- Node dependencies live per app (`api/node_modules`, `frontend/node_modules`).

## Build, Test, and Development Commands
- API
  - `cd api && npm run dev:3000` — start API on port 3000 (set `PORT` variants available: `dev:3001`).
  - `cd api && npm start` — start without debug logs.
- Frontend
  - `cd frontend && npm run dev` — start Vite dev server.
  - `cd frontend && npm run build` — production build.
  - `cd frontend && npm run preview` — preview production build.
  - Quality: `npm run check` (type/diagnostics), `npm run lint`, `npm run format`.

## Coding Style & Naming Conventions
- Frontend is enforced by Prettier/ESLint: tabs, single quotes, trailingComma none, print width 100. Run `npm run lint` and `npm run format` in `frontend/` before pushing.
- API follows the same conventions where possible; prefer single quotes and consistent formatting.
- Plugins: use PascalCase directory names (e.g., `DatabaseViewer`) and expose `register(ctx)` in `main.js`.

## Testing Guidelines
- No formal unit test runner is configured yet.
- Frontend: use `npm run check` and `npm run lint` to catch issues; add component tests alongside files under `src/` when introduced.
- API: validate endpoints manually during development; add tests under `api/tests/` if a framework is introduced.

## Commit & Pull Request Guidelines
- Prefer Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, with optional scopes (e.g., `feat(API): ...`). Keep subjects imperative and concise.
- PRs should include: clear description, screenshots/GIFs for UI changes, steps to reproduce/test, and linked issues (e.g., `Closes #123`). Keep diffs focused.

## Security & Configuration Tips
- Plugins may read configuration from environment variables defined in `plugin.json` (`manifest.env`). Provide sane defaults and document required vars in the PR.
- Do not commit secrets. Use environment variables (e.g., export locally or use a `.env` loader if added later).
