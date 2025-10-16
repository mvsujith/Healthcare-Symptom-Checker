const express = require('express');
const router = express.Router();
const symptomController = require('../controllers/symptomController');
const { validateSymptomRequest, validateChatRequest } = require('../middleware/validation');

/**
 * @route   POST /api/v1/symptom/analyze
 * @desc    Analyze patient symptoms using DeepSeek AI
 * @access  Public
 */
router.post('/analyze', validateSymptomRequest, symptomController.analyzeSymptoms);

/**
 * @route   POST /api/v1/symptom/chat
 * @desc    General medical chat with DeepSeek AI
 * @access  Public
 */
router.post('/chat', validateChatRequest, symptomController.chat);

/**
 * @route   GET /api/v1/symptom/status
 * @desc    Check DeepSeek API status
 * @access  Public
 */
router.get('/status', symptomController.checkStatus);

module.exports = router;
