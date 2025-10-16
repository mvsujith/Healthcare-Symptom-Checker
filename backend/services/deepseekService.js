const axios = require('axios');
const logger = require('../utils/logger');

class DeepSeekService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || process.env.DEEPSEEK_API_KEY;
    this.baseURL = process.env.DEEPSEEK_BASE_URL || 'https://openrouter.ai/api';
    this.model = process.env.DEEPSEEK_MODEL || 'deepseek/deepseek-r1:free';
    this.maxTokens = process.env.DEEPSEEK_MAX_TOKENS ? parseInt(process.env.DEEPSEEK_MAX_TOKENS) : 16000; // Increased to 16000 to prevent truncation
    this.temperature = parseFloat(process.env.DEEPSEEK_TEMPERATURE) || 0.7;
    this.siteName = process.env.SITE_NAME || 'AI Doctor';
    this.siteUrl = process.env.SITE_URL || 'http://localhost:5173';

    if (!this.apiKey) {
      logger.warn('OpenRouter API key not configured. AI features will be disabled.');
    }

    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': this.siteUrl,
        'X-Title': this.siteName,
      },
      timeout: 60000, // 60 seconds timeout for medical responses
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.info('DeepSeek API request:', {
          method: config.method,
          url: config.url,
          model: config.data?.model
        });
        return config;
      },
      (error) => {
        logger.error('DeepSeek API request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        logger.info('DeepSeek API response received:', {
          status: response.status,
          usage: response.data?.usage
        });
        return response;
      },
      (error) => {
        logger.error('DeepSeek API response error:', {
          status: error.response?.status,
          message: error.response?.data?.error?.message || error.message
        });
        return Promise.reject(this.handleAPIError(error));
      }
    );
  }

  /**
   * Analyze medical symptoms using DeepSeek AI
   */
  async analyzeMedicalSymptoms(patientData) {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const { symptoms, age, gender, duration, severity } = patientData;

    const systemPrompt = `You are a helpful medical assistant. Follow the user's instructions precisely and respond in the exact format requested. Always prioritize user safety and recommend consulting healthcare professionals when appropriate.`;

    // Use the symptoms field directly as it contains the complete structured prompt from frontend
    let userPrompt = symptoms;

    try {
      const requestData = {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        stream: false
      };

      const response = await this.client.post('/v1/chat/completions', requestData);
      
      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from DeepSeek API');
      }

      const finishReason = response.data.choices[0].finish_reason;
      
      // Check if response was truncated due to token limit
      if (finishReason === 'length') {
        logger.warn('⚠️ Response truncated due to max_tokens limit!', {
          maxTokens: this.maxTokens,
          usage: response.data.usage
        });
      }

      return {
        analysis: response.data.choices[0].message.content,
        usage: response.data.usage,
        model: response.data.model,
        finishReason: finishReason,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Medical symptom analysis error:', error);
      throw error;
    }
  }

  /**
   * General chat/question answering for medical queries
   */
  async chat(message, context = {}) {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const systemPrompt = `You are a helpful AI medical assistant. Provide accurate, helpful medical information while always emphasizing the importance of consulting healthcare professionals. Be compassionate and clear.`;

    try {
      const requestData = {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: this.maxTokens,
        stream: false
      };

      const response = await this.client.post('/v1/chat/completions', requestData);
      
      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from DeepSeek API');
      }

      return {
        content: response.data.choices[0].message.content,
        usage: response.data.usage,
        model: response.data.model,
        finishReason: response.data.choices[0].finish_reason
      };

    } catch (error) {
      logger.error('Chat error:', error);
      throw error;
    }
  }

  /**
   * Check API status
   */
  async checkAPIStatus() {
    if (!this.apiKey) {
      return {
        status: 'disabled',
        message: 'API key not configured',
        available: false
      };
    }

    try {
      // Simple test request to check if API is responsive
      await this.client.get('/v1/models');
      
      return {
        status: 'active',
        message: 'API is responsive',
        available: true,
        baseURL: this.baseURL,
        model: this.model
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        available: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Handle API errors
   */
  handleAPIError(error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.response.statusText;
      
      switch (status) {
        case 400:
          return new Error(`Bad Request: ${message}`);
        case 401:
          return new Error('Unauthorized: Invalid API key');
        case 403:
          return new Error('Forbidden: Access denied');
        case 404:
          return new Error('Not Found: Endpoint or model not found');
        case 429:
          return new Error('Rate Limited: Too many requests');
        case 500:
          return new Error('Internal Server Error: DeepSeek API issue');
        default:
          return new Error(`API Error (${status}): ${message}`);
      }
    } else if (error.request) {
      return new Error('Network Error: Unable to reach DeepSeek API');
    } else {
      return new Error(`Request Error: ${error.message}`);
    }
  }
}

module.exports = new DeepSeekService();
