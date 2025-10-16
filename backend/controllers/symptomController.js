const deepseekService = require('../services/deepseekService');
const logger = require('../utils/logger');

class SymptomController {
  /**
   * Analyze patient symptoms using DeepSeek AI
   */
  async analyzeSymptoms(req, res, next) {
    try {
      const { symptoms, age, gender, duration, severity } = req.body;

      logger.info('Symptom analysis request received', {
        symptomsLength: symptoms.length,
        age,
        gender,
        duration,
        severity
      });

      if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length < 10) {
        return res.status(400).json({
          success: false,
          error: 'Symptoms description is required (minimum 10 characters)'
        });
      }

      const patientData = {
        symptoms: symptoms.trim(),
        age,
        gender,
        duration,
        severity
      };

      const analysis = await deepseekService.analyzeMedicalSymptoms(patientData);

      res.json({
        success: true,
        data: {
          analysis: analysis.analysis,
          model: analysis.model,
          usage: analysis.usage,
          timestamp: analysis.timestamp,
          patientInfo: {
            age,
            gender,
            duration,
            severity
          }
        }
      });
    } catch (error) {
      logger.error('Symptom analysis error:', error);
      next(error);
    }
  }

  /**
   * General medical chat
   */
  async chat(req, res, next) {
    try {
      const { message, context } = req.body;

      logger.info('Medical chat request received', {
        messageLength: message.length
      });

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Message is required and must be a string'
        });
      }

      const response = await deepseekService.chat(message, context);

      res.json({
        success: true,
        data: {
          response: response.content,
          model: response.model,
          usage: response.usage,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Medical chat error:', error);
      next(error);
    }
  }

  /**
   * Check API status
   */
  async checkStatus(req, res, next) {
    try {
      const status = await deepseekService.checkAPIStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      logger.error('Status check error:', error);
      next(error);
    }
  }
}

module.exports = new SymptomController();
