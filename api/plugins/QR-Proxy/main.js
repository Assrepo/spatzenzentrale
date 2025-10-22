const logger = require('../../classes/logger');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

function buildRouter({ express, manifest, app }) {
  const router = express.Router();
  const database = app.get('database');

  // QR-Code erstellen
  router.post('/create', async (req, res) => {
    try {
      const { targetUrl, name, description } = req.body;

      if (!targetUrl) {
        return res.status(400).json({ 
          success: false, 
          error: 'Ziel-URL ist erforderlich' 
        });
      }

      const qrId = uuidv4();
      const proxyUrl = `${req.protocol}://${req.get('host')}/qr-proxy/redirect/${qrId}`;

      const qrCodeData = {
        id: qrId,
        name: name || `QR-Code ${qrId.slice(0, 8)}`,
        description: description || '',
        targetUrl: targetUrl,
        proxyUrl: proxyUrl,
        isActive: true,
        clickCount: 0
      };

      database.createQRProxy(qrCodeData, (error, result) => {
        if (error) {
          logger.error('Fehler beim Erstellen des QR-Codes:', error);
          return res.status(500).json({ 
            success: false, 
            error: 'Fehler beim Erstellen des QR-Codes' 
          });
        }

        logger.info(`QR-Code erstellt: ${qrId} -> ${targetUrl}`);

        res.json({
          success: true,
          data: result
        });
      });

    } catch (error) {
      logger.error('Fehler beim Erstellen des QR-Codes:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Fehler beim Erstellen des QR-Codes' 
      });
    }
  });

  // Alle QR-Codes abrufen
  router.get('/list', (req, res) => {
    database.readQRProxies((error, codes) => {
      if (error) {
        logger.error('Fehler beim Abrufen der QR-Codes:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Fehler beim Abrufen der QR-Codes' 
        });
      }

      res.json({
        success: true,
        data: codes
      });
    });
  });

  // Einzelnen QR-Code abrufen
  router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    database.readQRProxy(id, (error, qrCode) => {
      if (error) {
        if (error.message === 'QR-Code not found') {
          return res.status(404).json({ 
            success: false, 
            error: 'QR-Code nicht gefunden' 
          });
        }
        
        logger.error('Fehler beim Abrufen des QR-Codes:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Fehler beim Abrufen des QR-Codes' 
        });
      }

      res.json({
        success: true,
        data: qrCode
      });
    });
  });

  // QR-Code aktualisieren
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { targetUrl, name, description, isActive } = req.body;

    const updateData = {};
    if (targetUrl !== undefined) updateData.targetUrl = targetUrl;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    database.updateQRProxy(id, updateData, (error, qrCode) => {
      if (error) {
        if (error.message === 'QR-Code not found') {
          return res.status(404).json({ 
            success: false, 
            error: 'QR-Code nicht gefunden' 
          });
        }
        
        logger.error('Fehler beim Aktualisieren des QR-Codes:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Fehler beim Aktualisieren des QR-Codes' 
        });
      }

      logger.info(`QR-Code aktualisiert: ${id}`);

      res.json({
        success: true,
        data: qrCode
      });
    });
  });

  // QR-Code löschen
  router.delete('/:id', (req, res) => {
    const { id } = req.params;

    database.deleteQRProxy(id, (error, result) => {
      if (error) {
        if (error.message === 'QR-Code not found') {
          return res.status(404).json({ 
            success: false, 
            error: 'QR-Code nicht gefunden' 
          });
        }
        
        logger.error('Fehler beim Löschen des QR-Codes:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Fehler beim Löschen des QR-Codes' 
        });
      }

      logger.info(`QR-Code gelöscht: ${id}`);

      res.json({
        success: true,
        message: 'QR-Code erfolgreich gelöscht'
      });
    });
  });

  // Proxy-Redirect (wird von QR-Code aufgerufen)
  router.get('/redirect/:id', (req, res) => {
    const { id } = req.params;

    database.readQRProxy(id, (error, qrCode) => {
      if (error) {
        if (error.message === 'QR-Code not found') {
          return res.status(404).send(`
            <html>
              <head><title>QR-Code nicht gefunden</title></head>
              <body>
                <h1>QR-Code nicht gefunden</h1>
                <p>Der angeforderte QR-Code existiert nicht oder wurde gelöscht.</p>
              </body>
            </html>
          `);
        }
        
        logger.error('Fehler beim Redirect:', error);
        return res.status(500).send(`
          <html>
            <head><title>Fehler</title></head>
            <body>
              <h1>Fehler</h1>
              <p>Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.</p>
            </body>
          </html>
        `);
      }

      if (!qrCode.isActive) {
        return res.status(410).send(`
          <html>
            <head><title>QR-Code deaktiviert</title></head>
            <body>
              <h1>QR-Code deaktiviert</h1>
              <p>Dieser QR-Code wurde deaktiviert.</p>
            </body>
          </html>
        `);
      }

      // Click-Counter erhöhen
      database.incrementQRProxyClicks(id, (error, result) => {
        if (error) {
          logger.error('Fehler beim Inkrementieren der Klicks:', error);
        } else {
          logger.info(`QR-Code Redirect: ${id} -> ${qrCode.targetUrl} (Clicks: ${qrCode.clickCount + 1})`);
        }
      });

      // Weiterleitung zur Ziel-URL
      res.redirect(302, qrCode.targetUrl);
    });
  });

  // QR-Code als Bild abrufen
  router.get('/:id/qr-image', async (req, res) => {
    const { id } = req.params;

    database.readQRProxy(id, async (error, qrCode) => {
      if (error) {
        if (error.message === 'QR-Code not found') {
          return res.status(404).json({ 
            success: false, 
            error: 'QR-Code nicht gefunden' 
          });
        }
        
        logger.error('Fehler beim Generieren des QR-Code Bildes:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Fehler beim Generieren des QR-Code Bildes' 
        });
      }

      try {
        const qrImage = await QRCode.toBuffer(qrCode.proxyUrl, { 
          type: 'image/png',
          width: 256,
          margin: 2
        });

        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(qrImage);
      } catch (error) {
        logger.error('Fehler beim Generieren des QR-Code Bildes:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Fehler beim Generieren des QR-Code Bildes' 
        });
      }
    });
  });

  return router;
}

module.exports.register = function register({ express, manifest, app, mount }) {
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
