// app.js
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

// Load environment variables from .env if available
try {
  require('dotenv').config(); // load from process.cwd()
  // Ensure loading when CWD differs (e.g., process launched from repo root)
  require('dotenv').config({ path: path.join(__dirname, '.env') });
} catch (e) {
  // dotenv optional; ignore if not installed
}

const { loadPlugins } = require('./classes/pluginLoader');
const Database = require('./classes/database');
const app = express();

// Initialize database singleton
const database = new Database();
app.set('database', database);

// Graceful shutdown handling for database
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing database connection...');
  if (database && database._session) {
    database._session.close();
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing database connection...');
  if (database && database._session) {
    database._session.close();
  }
  process.exit(0);
});


// --- Middleware ---
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Static (z. B. /public)
app.use(express.static(path.join(__dirname, 'public')));

// --- Plugins laden & mounten ---
// Lädt alle plugins/*/plugin.json + main.js und ruft main.register(...) auf
loadPlugins({
  app,
  express,
  pluginsDir: path.join(__dirname, 'plugins'),
  // optional: Konfliktverhalten bei doppelten Routen
  onRouteConflict: (route, pluginA, pluginB) => {
    console.warn(`[plugin-loader] Routen-Konflikt für "${route}" zwischen "${pluginA}" und "${pluginB}". "${pluginA}" bleibt aktiv.`);
  },
});

// --- 404 ---
app.use((req, res, next) => {
  next(createError(404));
});

// --- Fehler-Handler ---
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.json({ error: err.message });
});

module.exports = app;
