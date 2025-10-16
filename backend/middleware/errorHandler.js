const logger = require('../utils/logger');

/**
 * Global error handling middleware
 */
const errorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = null;

  // Log the error
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = error.details || error.message;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Not Found';
  } else if (error.message.includes('Rate Limited')) {
    statusCode = 429;
    message = 'Too Many Requests';
  } else if (error.message.includes('API key')) {
    statusCode = 503;
    message = 'Service Unavailable - API Configuration Error';
  } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    statusCode = 503;
    message = 'Service Unavailable - External API Error';
  } else if (error.message) {
    message = error.message;
    // Try to extract status code from error message if available
    const statusMatch = error.message.match(/(\d{3})/);
    if (statusMatch) {
      const extractedStatus = parseInt(statusMatch[1]);
      if (extractedStatus >= 400 && extractedStatus < 600) {
        statusCode = extractedStatus;
      }
    }
  }

  // Don't expose sensitive error details in production
  if (process.env.NODE_ENV === 'production') {
    if (statusCode === 500) {
      message = 'Internal Server Error';
      details = null;
    }
  } else {
    // Include stack trace in development
    details = {
      ...details,
      stack: error.stack
    };
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: message,
      code: error.code || 'UNKNOWN_ERROR',
      statusCode: statusCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      ...(details && { details })
    }
  });
};

/**
 * Handle 404 errors for routes that don't exist
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.name = 'NotFoundError';
  next(error);
};

/**
 * Async error wrapper for route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
