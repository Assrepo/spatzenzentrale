/**
 * Boilerplate-Plugin (CommonJS)
 * Erwartet vom Plugin-Loader: register({ express, mount, manifest, app })
 *
 * manifest.route  -> Mount-Pfad (z. B. "/example")
 * manifest.env    -> Optional: Default-ENV-Werte (werden nicht gesetzt, nur Referenz)
 *
 * Export:
 *   - register(ctx): required
 *   - onShutdown?(ctx): optional – Cleanup/Hooks bei App-Stop
 */

const buildRouter = require('./routes/example.routes');
const logger = require('../../classes/logger');

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
  // await cleanup if necessary
};
