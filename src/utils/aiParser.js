/**
 * AI Response Parser Utility
 * Safely extracts and normalizes JSON from AI responses
 */

/**
 * Clean control characters from JSON string
 * Fixes "Bad control character in string literal" errors
 * by properly escaping unescaped control characters inside string values
 * @param {string} jsonStr - JSON string with potential control characters
 * @returns {string} Cleaned JSON string
 */
function cleanControlCharacters(jsonStr) {
  try {
    // First attempt: Try parsing as-is
    JSON.parse(jsonStr);
    return jsonStr; // If it parses, no cleaning needed
  } catch (e) {
    // Try to clean for any JSON parsing error, not just control characters
    console.log('🧹 Cleaning control characters from JSON... Error:', e.message);
  }

  // Robust strategy: Process character by character with proper escape tracking
  let result = '';
  let inString = false;
  let i = 0;
  
  while (i < jsonStr.length) {
    const char = jsonStr[i];
    const charCode = char.charCodeAt(0);
    
    // Check if this is an escape sequence
    if (char === '\\' && i + 1 < jsonStr.length) {
      const nextChar = jsonStr[i + 1];
      
      // If we're in a string and the next char is a quote or backslash, keep the escape
      if (inString && (nextChar === '"' || nextChar === '\\' || nextChar === '/' || 
                       nextChar === 'b' || nextChar === 'f' || nextChar === 'n' || 
                       nextChar === 'r' || nextChar === 't' || nextChar === 'u')) {
        result += char + nextChar;
        i += 2;
        continue;
      }
    }
    
    // Track if we're inside a string literal (only toggle on unescaped quotes)
    if (char === '"') {
      // Check if this quote is escaped by counting preceding backslashes
      let backslashCount = 0;
      let j = i - 1;
      while (j >= 0 && jsonStr[j] === '\\') {
        backslashCount++;
        j--;
      }
      
      // If even number of backslashes (or zero), the quote is not escaped
      if (backslashCount % 2 === 0) {
        inString = !inString;
      }
      
      result += char;
      i++;
      continue;
    }
    
    // If we're inside a string and hit an unescaped control character, escape it
    if (inString && charCode < 32) {
      switch (char) {
        case '\n': result += '\\n'; break;
        case '\r': result += '\\r'; break;
        case '\t': result += '\\t'; break;
        case '\f': result += '\\f'; break;
        case '\b': result += '\\b'; break;
        default: result += ''; // Remove other control chars
      }
      i++;
    } else {
      result += char;
      i++;
    }
  }

  console.log('✓ Control characters cleaned');
  
  // Final validation: Check if we're still in a string (unterminated)
  if (inString) {
    console.warn('⚠️ Warning: Detected unterminated string after cleaning. Adding closing quote.');
    result += '"';
  }
  
  return result;
}

/**
 * Parse AI analysis response, handling various formats
 * @param {string|object} analysis - Raw AI response (may be JSON string, fenced, or object)
 * @returns {object|null} Parsed questions object or null if parsing fails
 */
export function parseAIAnalysis(analysis) {
  try {
    // If already an object, return it
    if (typeof analysis === 'object' && analysis !== null) {
      // Check if it's medical analysis (has medical_analysis field) or questions
      if (analysis.medical_analysis || analysis.treatment_recommendations) {
        return analysis; // Return medical analysis as-is
      }
      return normalizeQuestions(analysis);
    }

    // If string, try to extract JSON
    if (typeof analysis === 'string') {
      let jsonString = analysis.trim();

      // Remove markdown code fences - multiple strategies
      // Strategy 1: Match full fence blocks
      if (jsonString.includes('```')) {
        const fenceMatch = jsonString.match(/```(?:json)?\s*\n([\s\S]*?)```/);
        if (fenceMatch && fenceMatch[1]) {
          jsonString = fenceMatch[1].trim();
        } else {
          // Strategy 2: Just remove all backticks if regex fails
          jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        }
      }

      // Check if JSON is incomplete (common with truncated responses)
      if (!jsonString.endsWith('}') && !jsonString.endsWith(']')) {
        console.warn('JSON appears to be truncated. Attempting to repair...');
        
        // Remove incomplete last element (could be incomplete string or value)
        // This handles cases like: ["item1", "item2", "incomplete
        jsonString = jsonString.replace(/,\s*"[^"]*$/, '');  // Remove trailing incomplete string after comma
        jsonString = jsonString.replace(/,\s*$/, '');  // Remove trailing comma
        jsonString = jsonString.replace(/:\s*"[^"]*$/, ': ""');  // Fix incomplete property value
        jsonString = jsonString.replace(/:\s*$/, ': ""');  // Fix missing property value
        
        // Count all brackets
        const openBraces = (jsonString.match(/{/g) || []).length;
        const closeBraces = (jsonString.match(/}/g) || []).length;
        const openBrackets = (jsonString.match(/\[/g) || []).length;
        const closeBrackets = (jsonString.match(/]/g) || []).length;
        
        const missingBraces = openBraces - closeBraces;
        const missingBrackets = openBrackets - closeBrackets;
        
        // Close arrays first, then objects
        if (missingBrackets > 0) {
          jsonString += ']'.repeat(missingBrackets);
          console.log('Added', missingBrackets, 'missing closing brackets');
        }
        
        if (missingBraces > 0) {
          jsonString += '\n  }'.repeat(missingBraces);
          console.log('Added', missingBraces, 'missing closing braces');
        }
      }

      // Final cleanup: remove any remaining backticks
      jsonString = jsonString.replace(/^`+|`+$/g, '').trim();

      // **NEW FIX**: Clean control characters from string values
      // This fixes "Bad control character in string literal" errors
      // by escaping unescaped newlines, tabs, and other control chars
      jsonString = cleanControlCharacters(jsonString);

      // Debug logging
      if (jsonString.startsWith('```') || jsonString.includes('```')) {
        console.warn('⚠️ Code fences still present after cleanup!');
        console.log('First 100 chars:', jsonString.substring(0, 100));
      }

      // Try to parse JSON
      const parsed = JSON.parse(jsonString);
      
      console.log('✅ Successfully parsed JSON');
      console.log('📦 Parsed object keys:', Object.keys(parsed));
      
      // Check if it's medical analysis or questions
      if (parsed.medical_analysis || parsed.treatment_recommendations) {
        console.log('📊 Detected medical analysis structure');
        console.log('🏥 Medical analysis keys:', parsed.medical_analysis ? Object.keys(parsed.medical_analysis) : 'N/A');
        console.log('💊 Treatment recommendations keys:', parsed.treatment_recommendations ? Object.keys(parsed.treatment_recommendations) : 'N/A');
        
        // Check for probable_conditions specifically
        if (parsed.medical_analysis?.probable_conditions) {
          console.log('✅ Found probable_conditions:', parsed.medical_analysis.probable_conditions.length, 'conditions');
          console.log('📋 First condition:', parsed.medical_analysis.probable_conditions[0]);
        }
        
        return parsed; // Return medical analysis as-is
      }
      
      console.log('❓ Detected questions structure - normalizing');
      return normalizeQuestions(parsed);
    }

    console.warn('AI analysis is neither object nor string:', typeof analysis);
    return null;
  } catch (error) {
    console.error('❌ Failed to parse AI analysis:', error.message);
    console.error('Error type:', error.name);
    
    // Show a preview of the problematic string
    if (typeof analysis === 'string') {
      console.error('String preview (first 200 chars):', analysis.substring(0, 200));
      console.error('String preview (last 100 chars):', analysis.substring(analysis.length - 100));
    }
    
    return null;
  }
}

/**
 * Normalize and validate the questions structure
 * @param {object} data - Parsed JSON object
 * @returns {object} Normalized questions structure
 */
export function normalizeQuestions(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data structure');
  }

  // Validate required structure
  if (!data.questions || typeof data.questions !== 'object') {
    throw new Error('Missing or invalid questions structure');
  }

  const normalized = {
    interview_phase: data.interview_phase || 'assessment',
    instructions_for_user: data.instructions_for_user || 'Please answer the following questions.',
    questions: {
      multiple_choice: [],
      text_and_numbers: [],
      documents_and_scans: []
    },
    next_steps: data.next_steps || 'Submit your answers to continue.'
  };

  // Normalize multiple choice questions
  if (Array.isArray(data.questions.multiple_choice)) {
    normalized.questions.multiple_choice = data.questions.multiple_choice.map((q, index) => ({
      id: ensureUniqueId(q.id || `MC${index + 1}`, normalized.questions.multiple_choice),
      question: q.question || 'Untitled question',
      options: Array.isArray(q.options) ? q.options : [],
      required: q.required || false,
      note: q.note || null
    }));
  }

  // Normalize text/number questions
  if (Array.isArray(data.questions.text_and_numbers)) {
    normalized.questions.text_and_numbers = data.questions.text_and_numbers.map((q, index) => ({
      id: ensureUniqueId(q.id || `TN${index + 1}`, normalized.questions.text_and_numbers),
      question: q.question || 'Untitled question',
      required: q.required || false,
      note: q.note || null,
      inputType: detectInputType(q.question)
    }));
  }

  // Normalize document questions
  if (Array.isArray(data.questions.documents_and_scans)) {
    normalized.questions.documents_and_scans = data.questions.documents_and_scans.map((q, index) => ({
      id: ensureUniqueId(q.id || `DOC${index + 1}`, normalized.questions.documents_and_scans),
      question: q.question || 'Upload document',
      required: q.required || false,
      note: q.note || null
    }));
  }

  // Check if at least one category has questions
  const hasQuestions = 
    normalized.questions.multiple_choice.length > 0 ||
    normalized.questions.text_and_numbers.length > 0 ||
    normalized.questions.documents_and_scans.length > 0;

  if (!hasQuestions) {
    throw new Error('No structured questions found');
  }

  return normalized;
}

/**
 * Ensure question ID is unique within its category
 * @param {string} id - Original ID
 * @param {array} existingQuestions - Array of questions in the same category
 * @returns {string} Unique ID
 */
function ensureUniqueId(id, existingQuestions) {
  let uniqueId = id;
  let suffix = 1;
  
  while (existingQuestions.some(q => q.id === uniqueId)) {
    uniqueId = `${id}_${suffix}`;
    suffix++;
  }
  
  return uniqueId;
}

/**
 * Detect appropriate input type based on question text
 * @param {string} question - Question text
 * @returns {string} Input type: 'date', 'time', 'number', 'textarea', 'text'
 */
export function detectInputType(question) {
  const lowerQuestion = question.toLowerCase();

  // Date input
  if (lowerQuestion.includes('date') || lowerQuestion.includes('when did')) {
    return 'date';
  }

  // Time input
  if (lowerQuestion.includes('time') || lowerQuestion.includes('what time')) {
    return 'time';
  }

  // Number input
  const numberKeywords = ['how many', 'number of', 'frequency', 'age', 'count', 'rate'];
  if (numberKeywords.some(keyword => lowerQuestion.includes(keyword))) {
    return 'number';
  }

  // Textarea for long questions (likely expecting detailed answers)
  if (question.length > 80 || lowerQuestion.includes('describe') || lowerQuestion.includes('explain')) {
    return 'textarea';
  }

  // Default to text input
  return 'text';
}

/**
 * Check if multiple choice question should allow multiple selections
 * @param {object} question - Question object
 * @returns {boolean} True if multi-select
 */
export function isMultiSelect(question) {
  const questionText = question.question.toLowerCase();
  const hasMultiSelectKeywords = 
    questionText.includes('select all') ||
    questionText.includes('all that apply') ||
    questionText.includes('multiple');

  // Also treat as multi-select if more than 6 options
  const hasManyOptions = question.options && question.options.length > 6;

  return hasMultiSelectKeywords || hasManyOptions;
}

/**
 * Check if option is "Other" type
 * @param {string} option - Option text
 * @returns {boolean} True if "Other" option
 */
export function isOtherOption(option) {
  const lowerOption = option.toLowerCase().trim();
  return lowerOption === 'other' || lowerOption.startsWith('other:');
}
