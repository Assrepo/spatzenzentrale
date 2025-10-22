const logger = require('../../classes/logger');

function buildRouter({ express, manifest, app }) {
  const router = express.Router();

  /* GET API status. */
  router.get('/', function(req, res, next) {
    res.json({ message: "API is running" });
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
