const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Plugin-Loader-Klasse
 */
class PluginLoader {
  constructor() {
    this.loadedPlugins = new Map();
    this.routeRegistry = new Map();
    this.shutdownHooks = [];
  }

  /**
   * Lädt und registriert alle Plugins aus dem angegebenen Verzeichnis
   * 
   * @param {Object} options - Konfigurationsoptionen
   * @param {Express} options.app - Express App Instanz
   * @param {Object} options.express - Express Modul
   * @param {string} options.pluginsDir - Plugin-Verzeichnis Pfad
   * @param {Function} options.onRouteConflict - Callback bei Routen-Konflikten
   */
  async loadPlugins({ app, express, pluginsDir, onRouteConflict }) {
    if (!fs.existsSync(pluginsDir)) {
      logger.warn(`Plugin-Verzeichnis ${pluginsDir} existiert nicht.`);
      return;
    }

    // Plugin-Loader an App anhängen für globalen Zugriff
    app.set('pluginLoader', this);

    const pluginFolders = fs.readdirSync(pluginsDir);
    const loadPromises = [];

    for (const folder of pluginFolders) {
      const pluginPath = path.join(pluginsDir, folder);
      
      if (!fs.lstatSync(pluginPath).isDirectory()) continue;
      
      loadPromises.push(this.loadSinglePlugin({
        app,
        express,
        pluginPath,
        folder,
        onRouteConflict
      }));
    }

    const results = await Promise.allSettled(loadPromises);
    this.reportLoadResults(results);
  }

  /**
   * Lädt ein einzelnes Plugin
   */
  async loadSinglePlugin({ app, express, pluginPath, folder, onRouteConflict }) {
    const manifestPath = path.join(pluginPath, 'plugin.json');
    const mainPath = path.join(pluginPath, 'main.js');

    // Validierung der Plugin-Dateien
    if (!fs.existsSync(manifestPath) || !fs.existsSync(mainPath)) {
      throw new Error(`Plugin ${folder} unvollständig - plugin.json oder main.js fehlt`);
    }

    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      this.validateManifest(manifest);
    } catch (err) {
      throw new Error(`Ungültiges plugin.json in ${folder}: ${err.message}`);
    }

    const pluginName = manifest.name || folder;

    if (!manifest.enabled) {
      logger.info(`Plugin ${pluginName} ist deaktiviert`);
      return;
    }

    // Plugin-Modul laden
    let pluginModule;
    try {
      // Cache leeren für Hot-Reload während Entwicklung
      delete require.cache[require.resolve(mainPath)];
      pluginModule = require(mainPath);
    } catch (err) {
      throw new Error(`Fehler beim Laden des Plugin-Moduls ${pluginName}: ${err.message}`);
    }

    if (typeof pluginModule.register !== 'function') {
      throw new Error(`Plugin ${pluginName} hat keine register() Funktion`);
    }

    // Routen-Konflikt prüfen
    const mountPath = manifest.route || `/${pluginName}`;
    if (this.routeRegistry.has(mountPath)) {
      const conflictingPlugin = this.routeRegistry.get(mountPath);
      if (onRouteConflict) {
        onRouteConflict(mountPath, conflictingPlugin, pluginName);
      }
      throw new Error(`Routen-Konflikt: ${mountPath} bereits von ${conflictingPlugin} verwendet`);
    }

    // Plugin registrieren
    const pluginContext = {
      express,
      manifest,
      app,
      mount: (path, router) => {
        app.use(path, router);
        this.routeRegistry.set(path, pluginName);
      },
      getConfig: () => this.getPluginConfig(pluginName),
      logger: this.createPluginLogger(pluginName)
    };

    await pluginModule.register(pluginContext);

    // Plugin-Informationen speichern
    const pluginInfo = {
      manifest,
      module: pluginModule,
      path: pluginPath,
      mountPath
    };

    this.loadedPlugins.set(pluginName, pluginInfo);

    // Serviere Frontend-Bundle falls vorhanden
    if (manifest.frontend?.type === 'svelte-component') {
      this.serveFrontendBundle(app, pluginName, pluginPath);
    }

    // Shutdown-Hook registrieren
    if (typeof pluginModule.onShutdown === 'function') {
      this.shutdownHooks.push({
        name: pluginName,
        hook: pluginModule.onShutdown,
        context: pluginContext
      });
    }

    logger.success(`Plugin ${pluginName} erfolgreich geladen auf ${mountPath}`);
  }

  /**
   * Validiert das Plugin-Manifest
   */
  validateManifest(manifest) {
    const required = ['name', 'version'];
    const missing = required.filter(field => !manifest[field]);
    
    if (missing.length > 0) {
      throw new Error(`Pflichtfelder fehlen: ${missing.join(', ')}`);
    }

    if (manifest.route && !manifest.route.startsWith('/')) {
      throw new Error('Route muss mit "/" beginnen');
    }
  }

  /**
   * Erstellt einen Plugin-spezifischen Logger
   */
  createPluginLogger(pluginName) {
    return {
      info: (...args) => logger.info(`[${pluginName}]`, ...args),
      warn: (...args) => logger.warn(`[${pluginName}]`, ...args),
      error: (...args) => logger.error(`[${pluginName}]`, ...args),
      success: (...args) => logger.success(`[${pluginName}]`, ...args),
      debug: (...args) => logger.debug(`[${pluginName}]`, ...args)
    };
  }

  /**
   * Lädt Plugin-Konfiguration aus Environment Variables
   */
  getPluginConfig(pluginName) {
    const plugin = this.loadedPlugins.get(pluginName);
    if (!plugin || !plugin.manifest.env) return {};

    const config = {};
    for (const [key, defaultValue] of Object.entries(plugin.manifest.env)) {
      config[key] = process.env[key] || defaultValue;
    }
    return config;
  }

  /**
   * Berichtet über Lade-Ergebnisse
   */
  reportLoadResults(results) {
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected');

    logger.info(`${successful} Plugins erfolgreich geladen`);
    
    if (failed.length > 0) {
      logger.error(`${failed.length} Plugins konnten nicht geladen werden:`);
      failed.forEach(failure => logger.error(failure.reason.message));
    }
  }

  /**
   * Shutdown aller Plugins
   */
  async shutdown() {
    logger.info('Fahre Plugins herunter...');
    
    const shutdownPromises = this.shutdownHooks.map(async ({ name, hook, context }) => {
      try {
        await hook(context);
        logger.info(`Plugin ${name} erfolgreich heruntergefahren`);
      } catch (err) {
        logger.error(`Fehler beim Herunterfahren von Plugin ${name}:`, err);
      }
    });

    await Promise.allSettled(shutdownPromises);
    this.loadedPlugins.clear();
    this.routeRegistry.clear();
    this.shutdownHooks.length = 0;
  }

  /**
   * Plugin-Informationen abrufen
   */
  getLoadedPlugins() {
    return Array.from(this.loadedPlugins.values()).map(plugin => ({
      name: plugin.manifest.name,
      version: plugin.manifest.version || '1.0.0',
      description: plugin.manifest.description || 'Keine Beschreibung',
      route: plugin.mountPath,
      enabled: plugin.manifest.enabled !== false,
      status: 'loaded',
      env: plugin.manifest.env || {}
    }));
  }

  /**
   * Serviert Frontend-Bundle eines Plugins
   */
  serveFrontendBundle(app, pluginName, pluginPath) {
    const express = require('express');
    const bundlePath = path.join(pluginPath, 'frontend', 'dist');

    if (!fs.existsSync(bundlePath)) {
      logger.warn(`Plugin ${pluginName}: Frontend-Bundle nicht gefunden in ${bundlePath}`);
      return;
    }

    // Serviere statische Files
    app.use(`/api/plugins/${pluginName}/frontend`, express.static(bundlePath));
    logger.info(`Plugin ${pluginName}: Frontend-Bundle serviert auf /api/plugins/${pluginName}/frontend`);
  }

  /**
   * Einzelnes Plugin neu laden (Development)
   */
  async reloadPlugin(pluginName, { app, express, pluginsDir }) {
    const plugin = this.loadedPlugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} nicht gefunden`);
    }

    // Plugin entladen
    await this.unloadPlugin(pluginName);

    // Plugin neu laden
    const pluginPath = plugin.path;
    const folder = path.basename(pluginPath);
    
    return this.loadSinglePlugin({
      app,
      express,
      pluginPath,
      folder
    });
  }

  /**
   * Plugin entladen
   */
  async unloadPlugin(pluginName) {
    const plugin = this.loadedPlugins.get(pluginName);
    if (!plugin) return;

    // Shutdown-Hook ausführen
    const shutdownHook = this.shutdownHooks.find(h => h.name === pluginName);
    if (shutdownHook) {
      try {
        await shutdownHook.hook(shutdownHook.context);
      } catch (err) {
        logger.error(`Fehler beim Entladen von Plugin ${pluginName}:`, err);
      }
    }

    // Aus Registern entfernen
    this.loadedPlugins.delete(pluginName);
    this.routeRegistry.delete(plugin.mountPath);
    this.shutdownHooks = this.shutdownHooks.filter(h => h.name !== pluginName);

    logger.info(`Plugin ${pluginName} entladen`);
  }

}

// Legacy-Interface für Rückwärtskompatibilität
function loadPlugins(options) {
  const loader = new PluginLoader();
  return loader.loadPlugins(options);
}

module.exports = { 
  PluginLoader, 
  loadPlugins
};