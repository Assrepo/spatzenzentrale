const logger = require('../../classes/logger');

// Das Dashboard-Plugin ist nur ein Platzhalter, da es im Frontend implementiert ist
function buildRouter({ express, manifest }) {
  const router = express.Router();

  // Redirect zum Frontend-Dashboard
  router.get('/', (req, res) => {
    res.redirect('/dashboard');
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

  const router = buildRouter({ express, manifest, app, getConfig, logger });
  
  mount(mountPath, router);
  logger.success(`Plugin ${manifest?.name} gemountet auf "${mountPath}"`);
};

module.exports.onShutdown = async function onShutdown({ manifest, logger }) {
  logger.info(`Plugin ${manifest?.name} wird heruntergefahren`);
};