const logger = require('../../classes/logger');

function buildRouter({ express, manifest, app }) {
  const router = express.Router();

  // Legacy QR-Code Generator (für Rückwärtskompatibilität)
  router.get('/', async (req, res) => {
    const QRCode = require('qrcode');
    const urlToEncode = req.query.url;

    if (!urlToEncode) {
      return res.status(400).send('URL is required');
    }

    try {
      const qrImage = await QRCode.toBuffer(urlToEncode, { type: 'image/png' });
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(qrImage);
    } catch (err) {
      logger.error('QR Code generation error:', err);
      res.status(500).send('Error generating QR code');
    }
  });

  // QR-Code mit Proxy-URL erstellen
  router.post('/create-proxy', async (req, res) => {
    try {
      const { targetUrl, name, description } = req.body;

      if (!targetUrl) {
        return res.status(400).json({ 
          success: false, 
          error: 'Ziel-URL ist erforderlich' 
        });
      }

      // QR-Code Proxy Plugin aufrufen
      const proxyResponse = await fetch(`${req.protocol}://${req.get('host')}/qr-proxy/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetUrl,
          name: name || `QR-Code ${Date.now()}`,
          description: description || ''
        })
      });

      const proxyResult = await proxyResponse.json();

      if (proxyResult.success) {
        res.json({
          success: true,
          data: {
            qrCode: proxyResult.data,
            message: 'QR-Code mit Proxy-URL erfolgreich erstellt'
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: proxyResult.error || 'Fehler beim Erstellen des QR-Code Proxys'
        });
      }

    } catch (error) {
      logger.error('Fehler beim Erstellen des QR-Code Proxys:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Fehler beim Erstellen des QR-Code Proxys' 
      });
    }
  });

  return router;
}

module.exports.register = function register({ express, mount, manifest, app }) {
  const mountPath = manifest?.route || `/${manifest?.name || 'plugin'}`;
  const enabled = manifest?.enabled !== false;

  if (!enabled) {
    logger.warn(`[plugin:${manifest?.name}] is disabled – not mounted`);
    return;
  }

  const router = buildRouter({ express, manifest, app });

  router.use((req, _res, next) => {
    req.plugin = { name: manifest?.name || 'unknown' };
    next();
  });

  mount(mountPath, router);
  logger.success(`[plugin:${manifest?.name}] mounted at "${mountPath}"`);
};

module.exports.onShutdown = async function onShutdown({ manifest }) {
  logger.info(`[plugin:${manifest?.name}] onShutdown called`);
};
