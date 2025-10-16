# Dynamic Question Form System

## Overview
This dynamic form rendering system intelligently parses AI-generated medical interview questions and renders them with appropriate input types, validation, and user-friendly interfaces.

## Architecture

### Core Components

#### 1. **aiParser.js** - Parsing & Normalization Utility
Located: `src/utils/aiParser.js`

**Functions:**
- `parseAIAnalysis(analysis)` - Parses JSON from AI response (handles markdown fences)
- `normalizeQuestions(data)` - Validates and normalizes question structure
- `detectInputType(question)` - Auto-detects input type from question text
- `isMultiSelect(question)` - Determines if question allows multiple selections
- `isOtherOption(option)` - Identifies "Other" options in choices

**Input Type Detection Heuristics:**
- `date` - Keywords: "date", "when did", "start date"
- `time` - Keywords: "what time", "time of day"
- `number` - Keywords: "how many", "age", "frequency", "number of"
- `textarea` - Long questions (>80 chars) or keywords: "describe", "explain"
- `text` - Default for short text inputs

#### 2. **MultipleChoiceQuestion.jsx** - Radio/Checkbox Component
Located: `src/components/questions/MultipleChoiceQuestion.jsx`

**Features:**
- Automatic radio (single-select) or checkbox (multi-select) rendering
- "Other" option with text input reveal
- Accessible with proper ARIA attributes
- Keyboard navigable

**Props:**
```javascript
{
  question: {
    id: "Q1",
    question: "Question text?",
    options: ["Option 1", "Option 2", "Other"],
    required: true
  },
  multiSelect: false, // Auto-determined by isMultiSelect()
  value: "", // Current selected value(s)
  onChange: (questionId, value, otherText) => {} // Callback
}
```

#### 3. **TextNumberQuestion.jsx** - Dynamic Input Component
Located: `src/components/questions/TextNumberQuestion.jsx`

**Supported Input Types:**
- `text` - Standard text input
- `number` - Numeric input with min/max
- `date` - Date picker
- `time` - Time picker
- `textarea` - Multi-line text area

**Props:**
```javascript
{
  question: {
    id: "Q2",
    question: "When did symptoms start?",
    inputType: "date", // Auto-detected
    required: false
  },
  value: "",
  onChange: (questionId, value) => {}
}
```

#### 4. **DocumentQuestion.jsx** - File Upload Component
Located: `src/components/questions/DocumentQuestion.jsx`

**Features:**
- Drag-and-drop file upload
- File type validation (PDF, PNG, JPG)
- File size validation (max 10MB)
- Alternative text details mode
- Toggle between upload and text entry

**Props:**
```javascript
{
  question: {
    id: "Q3",
    question: "Do you have blood test results?",
    note: "Upload PDF or image of results"
  },
  value: {
    mode: "upload", // or "text"
    file: File,
    text: ""
  },
  onChange: (questionId, value) => {}
}
```

#### 5. **DynamicQuestionForm.jsx** - Main Form Container
Located: `src/components/questions/DynamicQuestionForm.jsx`

**Features:**
- Renders all three question types in organized sections
- Collects answers in structured format
- Handles form submission
- Displays interview phase and instructions
- Shows next steps information

**Props:**
```javascript
{
  questions: {
    interview_phase: "initial_assessment",
    instructions_for_user: "Please answer...",
    questions: {
      multiple_choice: [...],
      text_and_numbers: [...],
      documents_and_scans: [...]
    },
    next_steps: "After submission..."
  },
  onSubmit: (answers) => {} // Callback with collected answers
}
```

**Answer Collection Format:**
```javascript
{
  "Q1": "Option 2",
  "Q1_other": null,
  "Q2": "2024-01-15",
  "Q3": {
    type: "file",
    file: File,
    fileName: "results.pdf",
    fileSize: 1024000,
    fileType: "application/pdf"
  },
  "Q4": "Detailed text response",
  "Q5": ["Option 1", "Option 3", "Other"],
  "Q5_other": "Custom text"
}
```

## Integration in App.jsx

### State Management
```javascript
const [dynamicQuestions, setDynamicQuestions] = useState(null);
const [showInitialForm, setShowInitialForm] = useState(true);
```

### Workflow
1. **Initial Submission**: User fills patient info + symptoms → Submit to AI
2. **Parse Response**: AI returns JSON with questions → Parse with `parseAIAnalysis()`
3. **Render Form**: Set `dynamicQuestions` state → Hides initial form, shows dynamic form
4. **User Answers**: User fills dynamic form → Submit answers
5. **Final Response**: Send answers back to AI → Get diagnosis/recommendations
6. **Display Results**: Show final AI response → Option to start over

### Key Functions
```javascript
// In handleSubmit (initial)
const parsedQuestions = parseAIAnalysis(data.data.analysis);
const normalizedQuestions = normalizeQuestions(parsedQuestions);
setDynamicQuestions(normalizedQuestions);
setShowInitialForm(false);

// Dynamic form submission
const handleDynamicFormSubmit = async (answers) => {
  // Build follow-up prompt with answers
  // Send to API
  // Display final diagnosis
  setDynamicQuestions(null);
  setShowInitialForm(true);
};

// Reset to initial state
const handleReset = () => {
  setDynamicQuestions(null);
  setShowInitialForm(true);
  // Clear all fields
};
```

## AI Response Format

### Expected JSON Structure
```json
{
  "interview_phase": "initial_assessment",
  "instructions_for_user": "Please answer all questions below...",
  "questions": {
    "multiple_choice": [
      {
        "id": "Q1",
        "question": "Have you experienced fever?",
        "options": ["Yes", "No", "Intermittent"],
        "required": true
      }
    ],
    "text_and_numbers": [
      {
        "id": "Q2",
        "question": "What is your current body temperature?",
        "required": false
      }
    ],
    "documents_and_scans": [
      {
        "id": "Q3",
        "question": "Do you have recent lab results?",
        "note": "Upload PDF or provide details"
      }
    ]
  },
  "next_steps": "After reviewing your answers, I will provide probable conditions..."
}
```

### Markdown Fence Handling
Parser automatically strips markdown fences:
```
```json
{...}
```
```

## Styling

### Theme Variables
- **Primary**: `#38bdf8` (cyan)
- **Accent**: `#5eead4` (teal)
- **Background**: `rgba(15, 23, 42, 0.85)` (dark navy)
- **Text**: `#e2e8f0` (light gray)
- **Error**: `#f87171` (red)

### CSS Classes
- `.dynamic-form-container` - Main form wrapper with glassmorphism
- `.question-section` - Section container for each question type
- `.dynamic-question` - Individual question wrapper
- `.dynamic-mcq` - Multiple choice specific styles
- `.dynamic-text-number` - Text/number specific styles
- `.dynamic-document` - Document upload specific styles

### Responsive Breakpoints
- **Desktop**: Default styles
- **Tablet** (≤768px): Form padding reduced, buttons full-width
- **Mobile** (≤480px): Compact spacing, vertical layout

## Testing

### Manual Testing Steps

1. **Start Backend**:
   ```bash
   cd "C:\sujith\With deepseek\Ai Doctor\backend"
   npm install
   node server.js
   ```

2. **Start Frontend**:
   ```bash
   cd "C:\sujith\With deepseek\Ai Doctor"
   npm install
   npm run dev
   ```

3. **Test Initial Form**:
   - Fill patient info (gender, age, duration, severity)
   - Enter symptoms: "I have severe headache and fever for 3 days"
   - Click "Ask Dr. AI"
   - Verify console logs show request payload

4. **Test Dynamic Form**:
   - Wait for AI response with questions
   - Verify questions are categorized into sections
   - Test multiple choice: Select options, try "Other" input
   - Test text inputs: Enter text, numbers, dates
   - Test document upload: Drag file, validate size/type errors
   - Submit form
   - Verify console shows collected answers

5. **Test Reset**:
   - Click "Start Over" button
   - Verify form resets to initial state

### Edge Cases to Test

1. **Parser Robustness**:
   - AI returns plain JSON (no fences)
   - AI returns JSON with ```json``` fence
   - AI returns invalid JSON
   - Missing required fields in JSON

2. **Input Validation**:
   - File upload: Test >10MB file
   - File upload: Test unsupported type (.txt, .docx)
   - Number input: Negative numbers
   - Required fields: Submit without filling

3. **UI/UX**:
   - Long question text wrapping
   - Many options (>10) in multiple choice
   - File upload drag-drop on mobile
   - Form scrolling with many questions

### Unit Tests
Run parser tests:
```bash
npm test aiParser.test.js
```

## Console Debugging

The system logs extensively to help with debugging:

### Initial Submission
```
================================================================================
📤 SENDING TO AI DOCTOR:
================================================================================
Request URL: http://localhost:5000/api/v1/symptom/analyze

📋 Patient Information:
  - Gender: male
  - Age: 35
  - Duration: 1-3-days
  - Severity: moderate

📝 Full Prompt Being Sent:
[Full prompt text]

📦 Complete Request Payload:
[JSON payload]
================================================================================
```

### Response Received
```
================================================================================
📥 RESPONSE FROM AI DOCTOR:
================================================================================
Response Status: 200 OK
✅ SUCCESS - AI Analysis Received:
Model Used: deepseek/deepseek-r1:free
[AI response content]

📋 PARSED QUESTIONS:
[Normalized question structure]
================================================================================
```

### Form Submission
```
================================================================================
📤 SUBMITTING DYNAMIC FORM ANSWERS:
================================================================================
Answers: {...}
================================================================================
```

## Troubleshooting

### Issue: Questions not appearing
- **Check**: Console for parsing errors
- **Solution**: Verify AI response matches expected JSON format

### Issue: File upload not working
- **Check**: File size and type
- **Solution**: Ensure file is <10MB and is PDF/PNG/JPG

### Issue: "Other" text not saving
- **Check**: Console logs for answer collection
- **Solution**: Ensure "Other" option is selected when entering text

### Issue: Form not scrolling properly
- **Check**: Browser console for CSS conflicts
- **Solution**: Verify `.dynamic-form-wrapper` has proper overflow settings

### Issue: Backend not responding
- **Check**: Backend server running on port 5000
- **Solution**: Check `.env` file has correct API key

## Future Enhancements

1. **Form Validation**: Client-side validation before submission
2. **Progress Indicator**: Show completion percentage
3. **Save Draft**: Local storage for incomplete forms
4. **Multi-language**: i18n support
5. **Voice Input**: Speech-to-text for symptom description
6. **Image Analysis**: AI-powered image diagnosis from uploads
7. **Export Results**: Download diagnosis as PDF
8. **Print Support**: Printer-friendly layout

## File Structure
```
Ai Doctor/
├── src/
│   ├── components/
│   │   ├── questions/
│   │   │   ├── MultipleChoiceQuestion.jsx
│   │   │   ├── TextNumberQuestion.jsx
│   │   │   ├── DocumentQuestion.jsx
│   │   │   ├── DynamicQuestionForm.jsx
│   │   │   └── QuestionStyles.css
│   │   └── WorkspacePlane.jsx
│   ├── utils/
│   │   ├── aiParser.js
│   │   └── aiParser.test.js
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
└── backend/
    ├── server.js
    ├── services/deepseekService.js
    ├── controllers/symptomController.js
    └── routes/symptom.js
```

## Dependencies

### Frontend
- `react@^18.3.1`
- `react-dom@^18.3.1`
- `three@^0.160.0`
- `vite@^6.2.2`

### Backend
- `express@^4.18.2`
- `axios@^1.6.2`
- `joi@^17.11.0`
- `cors@^2.8.5`
- `helmet@^7.1.0`

## Environment Variables

Create `.env` in backend folder:
```env
# OpenRouter API Configuration
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api
OPENROUTER_MODEL=deepseek/deepseek-r1:free

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

## License
This project is part of the Ai Doctor application for educational purposes.

## Support
For issues or questions, check console logs first. Most issues are logged with detailed error messages.
