"use strict";

const buildRouter = require("./routes");
const { getDatabase } = require("../../classes/utils");

module.exports.register = function register({ express, mount, manifest, app, getConfig, logger }) {
  const mountPath = manifest?.route || `/${manifest?.name || "plugin"}`;
  const enabled = manifest?.enabled !== false;

  if (!enabled) {
    logger.warn(`Plugin ${manifest?.name} ist deaktiviert`);
    return;
  }

  // Get the singleton database instance
  const database = getDatabase(app);

  const config = getConfig();
  const router = buildRouter({ express, manifest, app, config, logger });

  // Plugin-Kontext Middleware (optional)
  router.use((req, _, next) => {
    req.plugin = {
      name: manifest?.name || "unknown",
      version: manifest?.version
    };
    next();
  });

  mount(mountPath, router);
  logger.success(`Plugin ${manifest?.name} gemountet auf "${mountPath}"`);
};

module.exports.onShutdown = async function onShutdown({ manifest, logger }) {
  logger.info(`Plugin ${manifest?.name} wird heruntergefahren`);
  // Browser schließen (BotBucketService hält eine globale Instanz)
  const { getGlobalService } = require("./services/BotBucketService");
  const svc = getGlobalService();
  if (svc) await svc.closeBrowser();
  // ggf. geplante Jobs stoppen …
};
