const logger = require('../../classes/logger');
const fs = require('fs');
const path = require('path');

function buildRouter({ express, manifest, app }) {
  const router = express.Router();

  // Middleware für korrekte Headers
  router.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // GET /api - Basic API info
  router.get('/', (req, res) => {
    const registry = app.get('pluginRegistry');
    const plugins = registry ? registry.getAllPlugins() : [];
    
    const response = { 
      message: 'NewsFlash API',
      version: '1.0.0',
      pluginsLoaded: plugins.length,
      endpoints: [
        'GET /api/plugins - Get all plugins',
        'GET /api/plugins/{name} - Get specific plugin',
        'GET /api/plugins/system/health - System health',
        'POST /api/plugins/{name}/reload - Reload plugin',
        'PUT /api/plugins/{name}/toggle - Enable/Disable plugin'
      ],
      availableRoutes: plugins.map(p => p.route).filter(Boolean)
    };
    
    logger.debug('API root response:', response);
    res.json(response);
  });

  // GET /api/plugins - Liste aller Plugins (sichere Implementierung)
  router.get('/plugins', (req, res) => {
    try {
      logger.debug('Getting plugins...');
      
      // Erst versuchen Registry-Plugins zu holen
      const registry = app.get('pluginRegistry');
      let registryPlugins = [];
      
      if (registry) {
        try {
          registryPlugins = registry.getAllPlugins();
          logger.debug(`Registry plugins: ${registryPlugins.length}`);
        } catch (err) {
          logger.warn('Registry-Fehler:', err);
        }
      }
      
      // Dann Filesystem scannen für alle Plugins
      const allPlugins = getAllPluginsFromFilesystem(registry);
      logger.debug(`Filesystem plugins: ${allPlugins.length}`);
      
      const response = { success: true, data: allPlugins };
      res.json(response);
    } catch (error) {
      logger.error('Fehler beim Laden der Plugin-Liste:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Fehler beim Laden der Plugins',
        data: [] 
      });
    }
  });

  // GET /api/plugins/system/health - System Health (dynamisch)
  router.get('/plugins/system/health', (req, res) => {
    try {
      const registry = app.get('pluginRegistry');
      
      if (!registry) {
        const response = {
          health: {
            status: 'degraded',
            message: 'Plugin Registry nicht verfügbar',
            uptime: Math.floor(process.uptime()),
            activeConnections: 0,
            timestamp: new Date().toISOString()
          }
        };
        logger.warn('Health check - Registry nicht verfügbar');
        return res.json(response);
      }

      const health = registry.getSystemHealth();
      const response = { health };
      
      logger.debug('Health check response:', health);
      res.json(response);
    } catch (error) {
      logger.error('Fehler beim System Health Check:', error);
      res.status(500).json({
        health: {
          status: 'error',
          message: 'Health Check fehlgeschlagen',
          uptime: Math.floor(process.uptime()),
          activeConnections: 0,
          timestamp: new Date().toISOString(),
          error: error.message
        }
      });
    }
  });

  // GET /api/plugins/{name} - Einzelnes Plugin (dynamisch aus Registry)
  router.get('/plugins/:name', (req, res) => {
    try {
      const pluginName = req.params.name;
      const registry = app.get('pluginRegistry');
      
      logger.debug(`Looking for plugin: ${pluginName}`);
      
      if (!registry) {
        return res.status(503).json({ 
          success: false, 
          error: 'Plugin Registry nicht verfügbar' 
        });
      }

      const plugin = registry.getPlugin(pluginName);
      
      if (plugin) {
        logger.debug(`Found plugin ${pluginName}:`, plugin);
        res.json({ success: true, data: plugin });
      } else {
        logger.warn(`Plugin ${pluginName} nicht gefunden`);
        res.status(404).json({ 
          success: false, 
          error: `Plugin '${pluginName}' nicht gefunden` 
        });
      }
    } catch (error) {
      logger.error(`Fehler beim Laden von Plugin ${req.params.name}:`, error);
      res.status(500).json({ 
        success: false, 
        error: 'Interner Serverfehler' 
      });
    }
  });

  // POST /api/plugins/{name}/reload - Plugin neu laden (über Registry)
  router.post('/plugins/:name/reload', (req, res) => {
    try {
      const pluginName = req.params.name;
      const registry = app.get('pluginRegistry');
      
      logger.info(`Reload request for plugin: ${pluginName}`);
      
      if (!registry) {
        return res.status(503).json({ 
          success: false, 
          error: 'Plugin Registry nicht verfügbar' 
        });
      }
      
      const plugin = registry.getPlugin(pluginName);
      
      if (plugin) {
        logger.info(`Plugin ${pluginName} reload initiiert`);
        res.json({ 
          success: true, 
          message: `Plugin '${pluginName}' reload initiiert`,
          note: 'Für ein vollständiges Reload ist ein Server-Neustart erforderlich'
        });
      } else {
        res.status(404).json({ 
          success: false, 
          error: `Plugin '${pluginName}' nicht gefunden oder nicht geladen` 
        });
      }
    } catch (error) {
      logger.error(`Fehler beim Reload von Plugin ${req.params.name}:`, error);
      res.status(500).json({ 
        success: false, 
        error: 'Reload fehlgeschlagen' 
      });
    }
  });

  // PUT /api/plugins/{name}/toggle - Plugin aktivieren/deaktivieren
  router.put('/plugins/:name/toggle', (req, res) => {
    try {
      const pluginName = req.params.name;
      logger.info(`Toggle request for plugin: ${pluginName}`);
      
      // Plugin aus Filesystem suchen (nicht Registry!)
      const pluginInfo = findPluginInFilesystem(pluginName);
      
      if (!pluginInfo) {
        return res.status(404).json({ 
          success: false, 
          error: `Plugin '${pluginName}' nicht gefunden` 
        });
      }

      // Aktuellen Status ermitteln
      const currentlyEnabled = pluginInfo.enabled;
      const newState = !currentlyEnabled;
      
      logger.info(`Plugin ${pluginName}: ${currentlyEnabled ? 'enabled' : 'disabled'} -> ${newState ? 'enabled' : 'disabled'}`);

      // Plugin.json Datei bearbeiten
      const success = togglePluginInManifest(pluginName, newState);
      
      if (success) {
        logger.success(`Plugin ${pluginName} ${newState ? 'aktiviert' : 'deaktiviert'}`);
        res.json({ 
          success: true,
          data: {
            message: `Plugin '${pluginName}' wurde ${newState ? 'aktiviert' : 'deaktiviert'}`,
            newState: newState,
            note: 'Server-Neustart erforderlich für Änderungen'
          }
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: 'Fehler beim Ändern des Plugin-Status' 
        });
      }
    } catch (error) {
      logger.error(`Fehler beim Toggle von Plugin ${req.params.name}:`, error);
      res.status(500).json({ 
        success: false, 
        error: 'Toggle fehlgeschlagen' 
      });
    }
  });

  // GET /api/services - Frontend Service Discovery
  router.get('/services', (req, res) => {
    try {
      const plugins = getAllPluginsFromFilesystem();

      // Filter nur Plugins mit Frontend-Integration
      const services = plugins
        .filter(plugin => plugin.enabled && plugin.frontend)
        .map(plugin => {
          const hasSchema = hasUISchema(plugin.folder);

          // Wenn Plugin UI-Schema hat, nutze /plugin/[name] Route
          const route = hasSchema
            ? `/plugin/${plugin.name}`
            : (plugin.frontend.route || plugin.route);

          return {
            name: plugin.frontend.name || plugin.name,
            description: plugin.frontend.description || plugin.description,
            icon: plugin.frontend.icon || '🔌',
            route: route,
            color: plugin.frontend.color || 'bg-gray-500 hover:bg-gray-600',
            category: plugin.frontend.category || 'general',
            priority: plugin.frontend.priority || 0,
            hasUISchema: hasSchema,
            renderMode: hasSchema ? 'schema-driven' : 'custom'
          };
        });

      // Nach Priorität und Name sortieren
      services.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority; // Höhere Priorität zuerst
        }
        return a.name.localeCompare(b.name);
      });

      const response = {
        success: true,
        data: services,
        totalServices: services.length
      };

      logger.debug(`Frontend services discovered: ${services.length}`);
      res.json(response);

    } catch (error) {
      logger.error('Fehler beim Service Discovery:', error);
      res.status(500).json({
        success: false,
        error: 'Service Discovery fehlgeschlagen',
        data: []
      });
    }
  });

  // GET /api/plugins/:name/ui-schema - Hole UI-Schema eines Plugins
  router.get('/plugins/:name/ui-schema', (req, res) => {
    try {
      const pluginName = req.params.name;
      logger.debug(`Getting UI schema for plugin: ${pluginName}`);

      const pluginInfo = findPluginInFilesystem(pluginName);

      if (!pluginInfo) {
        return res.status(404).json({
          success: false,
          error: `Plugin '${pluginName}' nicht gefunden`
        });
      }

      const schemaPath = path.join(
        path.resolve(__dirname, '../../plugins'),
        pluginInfo.folder,
        'ui-schema.json'
      );

      if (!fs.existsSync(schemaPath)) {
        return res.status(404).json({
          success: false,
          error: `Kein UI-Schema für Plugin '${pluginName}' vorhanden`
        });
      }

      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      const schema = JSON.parse(schemaContent);

      res.json({
        success: true,
        data: {
          pluginName: pluginName,
          schema: schema,
          manifest: pluginInfo.manifest
        }
      });

      logger.debug(`UI schema for ${pluginName} delivered`);
    } catch (error) {
      logger.error(`Fehler beim Laden des UI-Schemas für ${req.params.name}:`, error);
      res.status(500).json({
        success: false,
        error: 'Fehler beim Laden des UI-Schemas'
      });
    }
  });

  // GET /api/discover - Entdecke alle verfügbaren Plugin-Routen
  router.get('/discover', (req, res) => {
    try {
      const registry = app.get('pluginRegistry');
      
      if (!registry) {
        return res.status(503).json({ 
          success: false, 
          error: 'Plugin Registry nicht verfügbar' 
        });
      }

      const plugins = registry.getAllPlugins();
      const discovery = plugins.map(plugin => ({
        name: plugin.name,
        route: plugin.route,
        enabled: plugin.enabled,
        status: plugin.status,
        routes: plugin.routes,
        description: plugin.description
      }));

      const response = { 
        success: true, 
        data: discovery,
        totalPlugins: plugins.length,
        activeRoutes: plugins.filter(p => p.enabled).length
      };
      
      logger.debug('Discovery response:', response);
      res.json(response);
    } catch (error) {
      logger.error('Fehler beim Plugin Discovery:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Discovery fehlgeschlagen' 
      });
    }
  });

  return router;
}

/**
 * Prüft ob ein Plugin ein UI-Schema hat
 */
function hasUISchema(pluginFolder) {
  try {
    const pluginsDir = path.resolve(__dirname, '../../plugins');
    const schemaPath = path.join(pluginsDir, pluginFolder, 'ui-schema.json');
    return fs.existsSync(schemaPath);
  } catch (error) {
    return false;
  }
}

/**
 * Scannt das Filesystem nach allen Plugins (geladen + deaktiviert)
 */
function getAllPluginsFromFilesystem(registry = null) {
  try {
    const pluginsDir = path.resolve(__dirname, '../../plugins');
    logger.debug(`Scanning plugins directory: ${pluginsDir}`);
    
    if (!fs.existsSync(pluginsDir)) {
      logger.warn('Plugins-Verzeichnis nicht gefunden');
      return [];
    }

    const pluginFolders = fs.readdirSync(pluginsDir);
    logger.debug(`Found folders: ${pluginFolders.join(', ')}`);
    const plugins = [];

    pluginFolders.forEach(folder => {
      try {
        const pluginPath = path.join(pluginsDir, folder);
        const manifestPath = path.join(pluginPath, 'plugin.json');
        
        // Prüfe ob es ein Verzeichnis ist
        if (!fs.lstatSync(pluginPath).isDirectory()) {
          logger.debug(`Skipping ${folder} - not a directory`);
          return;
        }
        
        // Prüfe ob plugin.json existiert
        if (!fs.existsSync(manifestPath)) {
          logger.debug(`Skipping ${folder} - no plugin.json`);
          return;
        }

        // Manifest lesen
        const manifestContent = fs.readFileSync(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);
        const pluginName = manifest.name || folder;
        
        logger.debug(`Processing plugin: ${pluginName}`);
        
        // Basis-Plugin-Info aus Manifest
        const pluginInfo = {
          name: pluginName,
          version: manifest.version || '1.0.0',
          description: manifest.description || 'Keine Beschreibung',
          route: manifest.route || `/${folder}`,
          enabled: manifest.enabled !== false,
          env: manifest.env || {},
          folder: folder,
          status: manifest.enabled !== false ? 'enabled' : 'disabled',
          loadedAt: null,
          routes: [],
          frontend: manifest.frontend || null
        };

        // Registry-Info hinzufügen (falls Plugin geladen und Registry verfügbar)
        if (registry && manifest.enabled !== false) {
          try {
            const loadedPlugin = registry.getPlugin(pluginName);
            if (loadedPlugin) {
              pluginInfo.status = 'loaded';
              pluginInfo.loadedAt = loadedPlugin.loadedAt;
              pluginInfo.routes = loadedPlugin.routes || [];
              logger.debug(`Plugin ${pluginName} is loaded`);
            } else {
              pluginInfo.status = 'not_loaded';
              logger.debug(`Plugin ${pluginName} enabled but not loaded`);
            }
          } catch (err) {
            logger.debug(`Error getting registry info for ${pluginName}:`, err);
            pluginInfo.status = 'error';
          }
        }

        plugins.push(pluginInfo);
        logger.debug(`Added plugin: ${pluginName} (${pluginInfo.status})`);
      } catch (err) {
        logger.error(`Fehler beim Verarbeiten von Plugin ${folder}:`, err);
      }
    });

    logger.debug(`Returning ${plugins.length} plugins total`);
    return plugins;
  } catch (error) {
    logger.error('Fehler beim Scannen der Plugins:', error);
    return [];
  }
}

/**
 * Findet Plugin-Info direkt im Filesystem (unabhängig von Registry)
 */
function findPluginInFilesystem(pluginName) {
  try {
    const pluginsDir = path.resolve(__dirname, '../../plugins');
    
    if (!fs.existsSync(pluginsDir)) {
      return null;
    }

    const pluginFolders = fs.readdirSync(pluginsDir);
    
    for (const folder of pluginFolders) {
      const pluginPath = path.join(pluginsDir, folder);
      const manifestPath = path.join(pluginPath, 'plugin.json');
      
      if (!fs.lstatSync(pluginPath).isDirectory()) continue;
      if (!fs.existsSync(manifestPath)) continue;

      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const name = manifest.name || folder;
        
        if (name === pluginName) {
          return {
            name: name,
            folder: folder,
            manifest: manifest,
            enabled: manifest.enabled !== false,
            manifestPath: manifestPath
          };
        }
      } catch (err) {
        logger.error(`Fehler beim Lesen der Manifest für ${folder}:`, err);
        continue;
      }
    }
    
    return null;
  } catch (error) {
    logger.error(`Fehler beim Suchen von Plugin ${pluginName}:`, error);
    return null;
  }
}

/**
 * Hilfsfunktion zum Ändern des enabled-Status in der plugin.json
 */
function togglePluginInManifest(pluginName, newEnabledState) {
  try {
    const pluginsDir = path.resolve(__dirname, '../../plugins');
    const pluginFolders = fs.readdirSync(pluginsDir);

    logger.debug(`Searching for plugin ${pluginName} to toggle to ${newEnabledState}`);

    for (const folder of pluginFolders) {
      const manifestPath = path.join(pluginsDir, folder, 'plugin.json');
      
      if (fs.existsSync(manifestPath)) {
        try {
          const manifestContent = fs.readFileSync(manifestPath, 'utf8');
          const manifest = JSON.parse(manifestContent);
          
          if ((manifest.name || folder) === pluginName) {
            logger.debug(`Found plugin ${pluginName} in folder ${folder}`);
            logger.debug(`Current enabled state: ${manifest.enabled}, setting to: ${newEnabledState}`);
            
            manifest.enabled = newEnabledState;
            const newContent = JSON.stringify(manifest, null, 2);
            
            fs.writeFileSync(manifestPath, newContent, 'utf8');
            logger.success(`Plugin ${pluginName} manifest updated: enabled = ${newEnabledState}`);
            
            // Verify the write
            const verifyContent = fs.readFileSync(manifestPath, 'utf8');
            const verifyManifest = JSON.parse(verifyContent);
            logger.debug(`Verification: enabled = ${verifyManifest.enabled}`);
            
            return true;
          }
        } catch (err) {
          logger.error(`Error processing manifest in folder ${folder}:`, err);
        }
      }
    }
    
    logger.warn(`Plugin manifest für ${pluginName} nicht gefunden`);
    return false;
  } catch (error) {
    logger.error(`Fehler beim Bearbeiten der Plugin-Manifest für ${pluginName}:`, error);
    return false;
  }
}

// Optional: Plugin kann eigene Routen-Informationen bereitstellen
function getRoutes() {
  return [
    { method: 'GET', path: '/', description: 'API Info' },
    { method: 'GET', path: '/plugins', description: 'Liste aller Plugins' },
    { method: 'GET', path: '/plugins/:name', description: 'Plugin Details' },
    { method: 'GET', path: '/plugins/system/health', description: 'System Health' },
    { method: 'POST', path: '/plugins/:name/reload', description: 'Plugin Reload' },
    { method: 'PUT', path: '/plugins/:name/toggle', description: 'Plugin aktivieren/deaktivieren' },
    { method: 'GET', path: '/discover', description: 'Plugin Discovery' }
  ];
}

module.exports.register = function register({ express, mount, manifest, app, registry }) {
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

// Export der verfügbaren Routen für die Registry
module.exports.getRoutes = getRoutes;