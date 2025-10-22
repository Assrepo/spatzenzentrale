# Database Setup & Maintenance

## Configuration

- Env vars (api/.env):
  - `DB_HOST`, `DB_PORT` (default 33060)
  - `DB_USER`, `DB_PASSWORD`
  - `DB_SCHEMA` (default `newsflash`)
- The API loads `.env` from `api/.env` (dotenv).

## Migrations

- Versioned migrations live in `api/classes/migrations.js`.
- Run via Database Admin UI: open `/db-admin` → Tab „Wartung“ → „Migration ausführen“.
- Or API: `POST /api/db-admin/maintenance/migrate`.
- Applied versions are tracked in `schema_migrations`.

## Schema Highlights

- Table `articles`:
  - Adds `interview_id` (string), index on (`title`, `publishDate`).
  - Generated columns: `publish_at`, `created_at` (DATETIME from ms timestamps).
- Views:
  - `news_articles` (id, title, content, publish_date, created_at, interview_id)
  - `scraping_history_view` (normalized columns)

## History Maintenance

- Fast clear: `POST /api/db-admin/maintenance/truncate-history` (TRUNCATE with fallback).
- Or `DELETE /botbucket/history?confirm=true`.

## Tips

- Keep credentials out of VCS; use `api/.env` or process env.
- For large datasets, consider pruning `scraping_history` (e.g., 90 days) and indexing frequent queries.
