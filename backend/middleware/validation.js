const Joi = require('joi');

/**
 * Validation middleware for symptom analysis requests
 */
const validateSymptomRequest = (req, res, next) => {
  const schema = Joi.object({
    symptoms: Joi.string().required().min(10).max(5000),
    age: Joi.number().optional().min(0).max(150),
    gender: Joi.string().optional().valid('male', 'female', 'other'),
    duration: Joi.string().optional(),
    severity: Joi.string().optional().valid('mild', 'moderate', 'severe', 'critical'),
    context: Joi.object().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    const validationError = new Error('Validation Error');
    validationError.name = 'ValidationError';
    validationError.details = error.details;
    return next(validationError);
  }

  next();
};

/**
 * Validation middleware for chat requests
 */
const validateChatRequest = (req, res, next) => {
  const schema = Joi.object({
    message: Joi.string().required().min(1).max(5000),
    context: Joi.object().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    const validationError = new Error('Validation Error');
    validationError.name = 'ValidationError';
    validationError.details = error.details;
    return next(validationError);
  }

  next();
};

module.exports = {
  validateSymptomRequest,
  validateChatRequest
};
