const chalk = require('chalk');

const prefix = chalk.gray('[NewsFlash]');

const logger = {
  info: (...args) => {
    console.log(prefix, chalk.blue('[INFO]'), ...args);
  },
  warn: (...args) => {
    console.warn(prefix, chalk.yellow('[WARN]'), ...args);
  },
  error: (...args) => {
    console.error(prefix, chalk.red('[ERROR]'), ...args);
  },
  success: (...args) => {
    console.log(prefix, chalk.green('[OK]'), ...args);
  },
  debug: (...args) => {
    if (process.env.DEBUG) {
      console.log(prefix, chalk.magenta('[DEBUG]'), ...args);
    }
  }
};

module.exports = logger;
