const logger = require('../../classes/logger');
const { promisifyDb, sendError, sendSuccess, asyncHandler, getDatabase } = require('../../classes/utils');

function buildRouter({ express, manifest, app, config, logger }) {
  const router = express.Router();

  // GET /api/news - Alle News als JSON abrufen
  router.get('/', asyncHandler(async (req, res) => {
    try {
      const database = getDatabase(app);
      const newsResult = await promisifyDb(database.readNews.bind(database), null);
      
      const newsToShow = newsResult.fetchAll().map(element => ({
        id: element[0],
        title: element[5],
        content: element[4],
        publishDate: preparePublishDate(element[2]),
        created: element[1]
      }));

      // Sortierung nach Datum (neueste zuerst)
      newsToShow.sort((a, b) => new Date(b.created) - new Date(a.created));

      sendSuccess(res, newsToShow, `${newsToShow.length} News geladen`);
    } catch (error) {
      logger.error('Fehler beim Laden der News:', error);
      sendError(res, error, 500, 'Laden der News');
    }
  }));

  // GET /api/news/:id - Einzelne News abrufen
  router.get('/:id', asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const database = getDatabase(app);
      const newsResult = await promisifyDb(database.readNews.bind(database), { id });
      
      const newsFromDb = newsResult.fetchAll();
      
      if (newsFromDb.length === 0) {
        return sendError(res, 'News nicht gefunden', 404, 'Suchen der News');
      }

      const element = newsFromDb[0];
      const newsData = {
        id: element[0],
        title: element[5],
        content: element[4],
        publishDate: preparePublishDate(element[2]),
        created: element[1]
      };
      
      sendSuccess(res, newsData);
    } catch (error) {
      logger.error('Fehler beim Laden der einzelnen News:', error);
      sendError(res, error, 500, 'Laden der einzelnen News');
    }
  }));

  // GET /api/news/search - News durchsuchen
  router.get('/search', asyncHandler(async (req, res) => {
    try {
      const { q, limit = 10, offset = 0 } = req.query;
      
      if (!q) {
        return sendError(res, 'Suchbegriff erforderlich', 400, 'Validierung');
      }

      const database = getDatabase(app);
      const newsResult = await promisifyDb(database.readNews.bind(database), null);

      const allNews = newsResult.fetchAll();
      const filteredNews = allNews
        .filter(element => 
          element[5].toLowerCase().includes(q.toLowerCase()) ||
          element[4].toLowerCase().includes(q.toLowerCase())
        )
        .slice(offset, offset + parseInt(limit))
        .map(element => ({
          id: element[0],
          title: element[5],
          content: element[4],
          publishDate: preparePublishDate(element[2]),
          created: element[1]
        }));

      const responseData = {
        query: q,
        count: filteredNews.length,
        results: filteredNews
      };
      
      sendSuccess(res, responseData, `${filteredNews.length} Suchergebnisse für "${q}"`);
    } catch (error) {
      logger.error('Fehler bei der Suche:', error);
      sendError(res, error, 500, 'Durchführung der Suche');
    }
  }));

  return router;
}

function preparePublishDate(publishDate) {
  const publishDateObject = new Date(publishDate);
  const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", 
                     "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const dayNames = ["Sonntag", "Montag", "Dienstag", "Mittwoch", 
                   "Donnerstag", "Freitag", "Samstag"];
  
  return `${dayNames[publishDateObject.getDay()]}, ${publishDateObject.getDate()}. ${monthNames[publishDateObject.getMonth()]} ${publishDateObject.getFullYear()}`;
}

module.exports.register = function register({ express, mount, manifest, app, getConfig, logger }) {
  const mountPath = manifest?.route || `/${manifest?.name || 'plugin'}`;
  const enabled = manifest?.enabled !== false;

  if (!enabled) {
    logger.warn(`Plugin ${manifest?.name} ist deaktiviert - nicht gemountet`);
    return;
  }

  // Database is already initialized as singleton in app.js

  const config = getConfig();
  const router = buildRouter({ express, manifest, app, config, logger });

  // Plugin-Kontext Middleware
  router.use((req, res, next) => {
    req.plugin = { 
      name: manifest?.name || 'unknown',
      version: manifest?.version
    };
    next();
  });

  // Error Handler
  router.use((err, req, res, next) => {
    logger.error(`[${manifest?.name}] Fehler:`, err);
    res.status(500).json({
      success: false,
      error: `Plugin ${manifest?.name}: ${err.message}`
    });
  });

  mount(mountPath, router);
  logger.success(`Plugin ${manifest?.name} gemountet auf "${mountPath}"`);
};

module.exports.onShutdown = async function onShutdown({ manifest, logger }) {
  logger.info(`Plugin ${manifest?.name} wird heruntergefahren`);
  // Database cleanup is handled centrally in app.js
};