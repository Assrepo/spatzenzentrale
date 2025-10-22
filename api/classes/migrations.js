"use strict";

async function columnExists(session, schema, table, column) {
  const sql = `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`;
  const res = await session.sql(sql).bind(schema, table, column).execute();
  const [[count]] = res.fetchAll();
  return Number(count) > 0;
}

async function indexExists(session, schema, table, indexName) {
  const sql = `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`;
  const res = await session.sql(sql).bind(schema, table, indexName).execute();
  const [[count]] = res.fetchAll();
  return Number(count) > 0;
}

async function ensureSchemaMigrationsTable(session, schema) {
  await session.sql(`
    CREATE TABLE IF NOT EXISTS \`${schema}\`.\`schema_migrations\` (
      version VARCHAR(64) PRIMARY KEY,
      description TEXT,
      applied_at BIGINT
    )
  `).execute();
}

async function getAppliedVersions(session, schema) {
  const res = await session.sql(`SELECT version FROM \`${schema}\`.\`schema_migrations\``).execute();
  return new Set(res.fetchAll().map(r => String(r[0])));
}

const MIGRATIONS = [
  {
    version: '001_news_interview_id_and_index',
    description: 'Add interview_id to news and index (title,publishDate)',
    up: async (session, schema, logger) => {
      const table = 'news';
      if (!(await columnExists(session, schema, table, 'interview_id'))) {
        await session.sql(`ALTER TABLE \`${schema}\`.\`${table}\` ADD COLUMN \`interview_id\` VARCHAR(64) NULL`).execute();
      }
      const idxName = 'idx_news_title_publishdate';
      if (!(await indexExists(session, schema, table, idxName))) {
        await session.sql(`CREATE INDEX \`${idxName}\` ON \`${schema}\`.\`${table}\` (\`title\`, \`publishDate\`)`).execute();
      }
    }
  },
  {
    version: '002_views_normalized',
    description: 'Create normalized views for news and scraping_history',
    up: async (session, schema, logger) => {
      await session.sql(`
        CREATE OR REPLACE VIEW \`${schema}\`.\`news_articles\` AS
        SELECT 
          id,
          title,
          \`news\` AS content,
          publishDate AS publish_date,
          created AS created_at,
          COALESCE(interview_id, '') AS interview_id
        FROM \`${schema}\`.\`news\`
      `).execute();

      await session.sql(`
        CREATE OR REPLACE VIEW \`${schema}\`.\`scraping_history_view\` AS
        SELECT 
          id,
          timestamp,
          method,
          chatbotId AS chatbot_id,
          question,
          newsCount AS news_count,
          saved,
          status,
          error,
          newsData AS news_data
        FROM \`${schema}\`.\`scraping_history\`
      `).execute();
    }
  }
  ,
  {
    version: '003_news_generated_datetimes',
    description: 'Add generated DATETIME columns publish_at and created_at; update views to use them',
    up: async (session, schema, logger) => {
      const hasColumn = async (col) => columnExists(session, schema, 'news', col);
      if (!(await hasColumn('publish_at'))) {
        await session
          .sql(`ALTER TABLE \`${schema}\`.\`news\` ADD COLUMN \`publish_at\` DATETIME GENERATED ALWAYS AS (FROM_UNIXTIME(\`publishDate\`/1000)) STORED`)
          .execute();
      }
      if (!(await hasColumn('created_at'))) {
        await session
          .sql(`ALTER TABLE \`${schema}\`.\`news\` ADD COLUMN \`created_at\` DATETIME GENERATED ALWAYS AS (FROM_UNIXTIME(\`created\`/1000)) STORED`)
          .execute();
      }
      const idxName2 = 'idx_news_publish_at';
      if (!(await indexExists(session, schema, 'news', idxName2))) {
        await session.sql(`CREATE INDEX \`${idxName2}\` ON \`${schema}\`.\`news\` (\`publish_at\`)`).execute();
      }
      await session.sql(`
        CREATE OR REPLACE VIEW \`${schema}\`.\`news_articles\` AS
        SELECT 
          id,
          title,
          \`news\` AS content,
          COALESCE(publish_at, FROM_UNIXTIME(publishDate/1000)) AS publish_date,
          COALESCE(created_at, FROM_UNIXTIME(created/1000)) AS created_at,
          COALESCE(interview_id, '') AS interview_id
        FROM \`${schema}\`.\`news\`
      `).execute();
    }
  }
];

async function runMigrations(session, logger = console, schema = 'UlmNewsFlash') {
  await ensureSchemaMigrationsTable(session, schema);
  const applied = await getAppliedVersions(session, schema);
  const appliedNow = [];
  for (const m of MIGRATIONS) {
    if (applied.has(m.version)) continue;
    try {
      await m.up(session, schema, logger);
      await session.sql(`INSERT INTO \`${schema}\`.\`schema_migrations\` (version, description, applied_at) VALUES (?, ?, ?)`)
        .bind(m.version, m.description, Date.now())
        .execute();
      appliedNow.push(`${m.version}: ${m.description}`);
    } catch (e) {
      logger.warn(`Migration ${m.version} failed:`, e?.message);
    }
  }
  return appliedNow;
}

module.exports = {
  runMigrations
};
