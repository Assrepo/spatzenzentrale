/**
 * Common utilities for plugins
 */

/**
 * Converts callback-based database calls to promises
 * @param {Function} dbMethod - Database method that takes a callback
 * @param {...any} args - Arguments for the database method
 * @returns {Promise} Promise that resolves with the database result
 */
function promisifyDb(dbMethod, ...args) {
  return new Promise((resolve, reject) => {
    try {
      dbMethod(...args, (result) => {
        resolve(result);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Standard error response formatter
 * @param {Object} res - Express response object
 * @param {Error|string} error - Error object or message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} context - Context for logging (default: 'operation')
 */
function sendError(res, error, statusCode = 500, context = 'operation') {
  const message = error instanceof Error ? error.message : error;
  
  res.status(statusCode).json({
    success: false,
    error: `Fehler beim ${context}`,
    details: process.env.NODE_ENV === 'development' ? message : undefined
  });
}

/**
 * Standard success response formatter
 * @param {Object} res - Express response object
 * @param {any} data - Data to send
 * @param {string} message - Success message (optional)
 */
function sendSuccess(res, data, message = null) {
  const response = {
    success: true
  };
  
  if (message) response.message = message;
  if (data !== undefined) response.data = data;
  
  res.json(response);
}

/**
 * Async wrapper for route handlers to catch errors automatically
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Get database instance from app
 * @param {Object} app - Express app instance
 * @returns {Object} Database instance
 */
function getDatabase(app) {
  const db = app.get('database');
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

module.exports = {
  promisifyDb,
  sendError,
  sendSuccess,
  asyncHandler,
  getDatabase
};