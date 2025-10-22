const logger = require('../../classes/logger');

function buildRouter({ express, manifest, app, config, logger }) {
  const router = express.Router();

  // EventSource connections verwalten
  const connections = new Set();

  // GET /event - Server-Sent Events Endpoint
  router.get('/', function(req, res, next) {
    // SSE Headers setzen
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    // Verbindung zur Liste hinzufügen
    connections.add(res);
    
    // Initiale Verbindungsbestätigung
    res.write(`data: ${JSON.stringify({
      type: 'connection',
      message: 'Mit Event-Stream verbunden',
      timestamp: new Date().toISOString()
    })}\n\n`);

    let checkedLastTime = new Date().getTime();
    const intervalId = setInterval(async () => {
      try {
        const database = req.app.get("database");
        
        if (!database) {
          logger.warn('Datenbank nicht verfügbar für Event-Stream');
          return;
        }

        // Neue Artikel seit der letzten Prüfung abrufen
        const newArticles = await new Promise((resolve, reject) => {
          database.getDifferencesFrom(checkedLastTime, (result) => {
            try {
              const newNewsFromDB = result.fetchAll();
              const articles = newNewsFromDB.map(element => ({
                id: element[0],
                title: element[5],
                content: element[4],
                publishDate: element[2],
                created: element[1]
              }));
              resolve(articles);
            } catch (err) {
              reject(err);
            }
          });
        });

        checkedLastTime = new Date().getTime();

        // Neue Artikel an alle verbundenen Clients senden
        if (newArticles.length > 0) {
          const eventData = {
            type: 'news_update',
            data: newArticles,
            timestamp: new Date().toISOString(),
            count: newArticles.length
          };

          // An alle aktiven Verbindungen senden
          connections.forEach(connection => {
            try {
              connection.write(`data: ${JSON.stringify(eventData)}\n\n`);
            } catch (err) {
              // Verbindung ist nicht mehr aktiv
              connections.delete(connection);
            }
          });

          logger.info(`${newArticles.length} neue Artikel an ${connections.size} Clients gesendet`);
        }
      } catch (error) {
        logger.error('Fehler beim Event-Stream Update:', error);
      }
    }, parseInt(config.EVENT_INTERVAL || 60000));

    // Heartbeat für Verbindung am Leben halten
    const heartbeatInterval = setInterval(() => {
      try {
        res.write(`data: ${JSON.stringify({
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        })}\n\n`);
      } catch (err) {
        clearInterval(heartbeatInterval);
        clearInterval(intervalId);
        connections.delete(res);
      }
    }, 30000);

    // Connection cleanup bei Client-Disconnect
    req.on('close', () => {
      clearInterval(intervalId);
      clearInterval(heartbeatInterval);
      connections.delete(res);
      logger.info('Event-Stream Verbindung geschlossen');
    });

    req.on('error', () => {
      clearInterval(intervalId);
      clearInterval(heartbeatInterval);
      connections.delete(res);
    });
  });

  // GET /event/status - Event-Stream Status
  router.get('/status', (req, res) => {
    res.json({
      success: true,
      activeConnections: connections.size,
      uptime: process.uptime(),
      lastCheck: new Date().toISOString()
    });
  });

  // POST /event/broadcast - Manuelle Broadcast-Nachricht (für Testing)
  router.post('/broadcast', (req, res) => {
    const { message, type = 'broadcast' } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Nachricht erforderlich'
      });
    }

    const eventData = {
      type,
      message,
      timestamp: new Date().toISOString()
    };

    let sent = 0;
    connections.forEach(connection => {
      try {
        connection.write(`data: ${JSON.stringify(eventData)}\n\n`);
        sent++;
      } catch (err) {
        connections.delete(connection);
      }
    });

    res.json({
      success: true,
      message: 'Broadcast gesendet',
      sentTo: sent,
      totalConnections: connections.size
    });
  });

  return router;
}

module.exports.register = function register({ express, mount, manifest, app, getConfig, logger }) {
  const mountPath = manifest?.route || `/${manifest?.name || 'plugin'}`;
  const enabled = manifest?.enabled !== false;

  if (!enabled) {
    logger.warn(`Plugin ${manifest?.name} ist deaktiviert`);
    return;
  }

  const config = getConfig();
  const router = buildRouter({ express, manifest, app, config, logger });

  mount(mountPath, router);
  logger.success(`Plugin ${manifest?.name} gemountet auf "${mountPath}"`);
};

module.exports.onShutdown = async function onShutdown({ manifest, logger }) {
  logger.info(`Plugin ${manifest?.name} wird heruntergefahren`);
  // Alle offenen Verbindungen schließen
  // connections.forEach(conn => conn.end());
};