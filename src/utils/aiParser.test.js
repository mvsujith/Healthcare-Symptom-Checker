/**
 * Unit tests for AI Parser
 * Run with: npm test aiParser.test.js
 */

import { parseAIAnalysis, detectInputType, isMultiSelect, isOtherOption } from './aiParser';

describe('parseAIAnalysis', () => {
  test('should parse JSON object directly', () => {
    const input = {
      interview_phase: 'initial',
      instructions_for_user: 'Test instructions',
      questions: {
        multiple_choice: [{
          id: 'Q1',
          question: 'Test question?',
          options: ['A', 'B', 'C']
        }],
        text_and_numbers: [],
        documents_and_scans: []
      },
      next_steps: 'Continue'
    };

    const result = parseAIAnalysis(input);
    expect(result).not.toBeNull();
    expect(result.interview_phase).toBe('initial');
    expect(result.questions.multiple_choice).toHaveLength(1);
    expect(result.questions.multiple_choice[0].id).toBe('Q1');
  });

  test('should parse JSON with markdown code fences', () => {
    const input = `\`\`\`json
{
  "interview_phase": "assessment",
  "instructions_for_user": "Answer questions",
  "questions": {
    "multiple_choice": [],
    "text_and_numbers": [{
      "id": "Q2",
      "question": "What is your age?"
    }],
    "documents_and_scans": []
  },
  "next_steps": "Submit"
}
\`\`\``;

    const result = parseAIAnalysis(input);
    expect(result).not.toBeNull();
    expect(result.interview_phase).toBe('assessment');
    expect(result.questions.text_and_numbers).toHaveLength(1);
    expect(result.questions.text_and_numbers[0].inputType).toBe('number'); // 'age' keyword
  });

  test('should return null for invalid JSON', () => {
    const input = 'This is not valid JSON {invalid}';
    const result = parseAIAnalysis(input);
    expect(result).toBeNull();
  });

  test('should throw error if questions structure is missing', () => {
    const input = {
      interview_phase: 'test',
      // missing questions
    };

    expect(() => parseAIAnalysis(input)).toThrow('Missing or invalid questions structure');
  });
});

describe('detectInputType', () => {
  test('should detect date input', () => {
    expect(detectInputType('When did the symptoms start?')).toBe('date');
    expect(detectInputType('What is the date of onset?')).toBe('date');
  });

  test('should detect time input', () => {
    expect(detectInputType('What time did it occur?')).toBe('time');
    expect(detectInputType('At what time?')).toBe('time');
  });

  test('should detect number input', () => {
    expect(detectInputType('How many times per day?')).toBe('number');
    expect(detectInputType('What is your age?')).toBe('number');
    expect(detectInputType('Frequency of occurrence?')).toBe('number');
  });

  test('should detect textarea for long questions', () => {
    const longQuestion = 'Please describe in detail the symptoms you are experiencing including location, intensity, and duration';
    expect(detectInputType(longQuestion)).toBe('textarea');
    expect(detectInputType('Please describe your symptoms')).toBe('textarea');
  });

  test('should default to text input', () => {
    expect(detectInputType('What is your name?')).toBe('text');
  });
});

describe('isMultiSelect', () => {
  test('should detect multi-select keywords', () => {
    const q1 = { question: 'Select all that apply', options: ['A', 'B'] };
    expect(isMultiSelect(q1)).toBe(true);

    const q2 = { question: 'Choose multiple options', options: ['A', 'B'] };
    expect(isMultiSelect(q2)).toBe(true);
  });

  test('should treat questions with >6 options as multi-select', () => {
    const q = {
      question: 'Select symptoms',
      options: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    };
    expect(isMultiSelect(q)).toBe(true);
  });

  test('should return false for regular questions', () => {
    const q = { question: 'What type?', options: ['A', 'B', 'C'] };
    expect(isMultiSelect(q)).toBe(false);
  });
});

describe('isOtherOption', () => {
  test('should detect "Other" option', () => {
    expect(isOtherOption('Other')).toBe(true);
    expect(isOtherOption('other')).toBe(true);
    expect(isOtherOption('OTHER')).toBe(true);
    expect(isOtherOption('Other: Please specify')).toBe(true);
  });

  test('should return false for non-Other options', () => {
    expect(isOtherOption('Something else')).toBe(false);
    expect(isOtherOption('Another option')).toBe(false);
  });
});
