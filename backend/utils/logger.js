const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logFile = process.env.LOG_FILE || 'logs/app.log';
    this.enableConsole = process.env.NODE_ENV !== 'production';
    
    // Ensure log directory exists
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
  }

  writeToFile(message) {
    try {
      fs.appendFileSync(this.logFile, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, meta);

    // Write to console in development
    if (this.enableConsole) {
      const consoleMethod = level === 'error' ? 'error' : 
                           level === 'warn' ? 'warn' : 
                           'log';
      console[consoleMethod](formattedMessage);
    }

    // Always write to file
    this.writeToFile(formattedMessage);
  }

  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  // HTTP request logging helper
  logRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      contentLength: res.get('content-length') || 0
    };

    if (res.statusCode >= 400) {
      this.error('HTTP Request Error', logData);
    } else {
      this.info('HTTP Request', logData);
    }
  }

  // API logging helper
  logAPICall(service, method, params, result, duration) {
    const logData = {
      service,
      method,
      params: typeof params === 'object' ? JSON.stringify(params) : params,
      success: !result.error,
      duration: `${duration}ms`,
      ...(result.error && { error: result.error })
    };

    if (result.error) {
      this.error('API Call Failed', logData);
    } else {
      this.info('API Call Success', logData);
    }
  }
}

module.exports = new Logger();
