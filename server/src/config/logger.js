import { config } from './env.js';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  info: '\x1b[36m',
  http: '\x1b[35m',
  debug: '\x1b[32m',
  reset: '\x1b[0m',
};

class Logger {
  constructor() {
    this.level = config.NODE_ENV === 'production' ? 'info' : 'debug';
  }

  log(level, message, ...args) {
    const levelValue = levels[level];
    const currentLevelValue = levels[this.level];
    
    if (levelValue > currentLevelValue) return;

    const timestamp = new Date().toISOString();
    const color = colors[level] || colors.reset;
    const prefix = `[${timestamp}] ${color}${level.toUpperCase()}${colors.reset}`;

    console.log(prefix, message, ...args);
  }

  error(message, ...args) {
    this.log('error', message, ...args);
  }

  warn(message, ...args) {
    this.log('warn', message, ...args);
  }

  info(message, ...args) {
    this.log('info', message, ...args);
  }

  http(message, ...args) {
    this.log('http', message, ...args);
  }

  debug(message, ...args) {
    this.log('debug', message, ...args);
  }
}

export const logger = new Logger();