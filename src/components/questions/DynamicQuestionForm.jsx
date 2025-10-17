import { useState } from 'react';
import { isMultiSelect } from '../../utils/aiParser';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import TextNumberQuestion from './TextNumberQuestion';
import DocumentQuestion from './DocumentQuestion';
import './QuestionStyles.css';

/**
 * Dynamic Question Form Container
 * Renders all questions from AI response in organized sections
 */
export default function DynamicQuestionForm({ questions, onSubmit }) {
  const [answers, setAnswers] = useState({});
  const [otherTexts, setOtherTexts] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle answer changes from child components
  const handleAnswerChange = (questionId, value, otherText = null) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));

    if (otherText !== null) {
      setOtherTexts(prev => ({
        ...prev,
        [`${questionId}_other`]: otherText
      }));
    }
  };

  // Collect all answers in structured format
  const collectAnswers = () => {
    const collected = {};

    // Process all answers
    Object.entries(answers).forEach(([questionId, value]) => {
      // Handle different value types
      if (value && typeof value === 'object') {
        // Document question with file or text
        if (value.mode === 'upload' && value.file) {
          collected[questionId] = {
            type: 'file',
            file: value.file,
            fileName: value.file.name,
            fileSize: value.file.size,
            fileType: value.file.type
          };
        } else if (value.mode === 'text' && value.text) {
          collected[questionId] = value.text;
        }
      } else {
        // Simple text/number or multiple choice
        collected[questionId] = value;
      }

      // Add "Other" text if exists
      const otherKey = `${questionId}_other`;
      if (otherTexts[otherKey]) {
        collected[otherKey] = otherTexts[otherKey];
      }
    });

    return collected;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const collectedAnswers = collectAnswers();
    
    console.log('='.repeat(80));
    console.log('📋 DYNAMIC FORM SUBMISSION');
    console.log('='.repeat(80));
    console.log('Collected Answers:', JSON.stringify(collectedAnswers, null, 2));
    console.log('='.repeat(80));

    onSubmit(collectedAnswers);
    setIsSubmitting(false);
  };

  // Extract questions arrays from the nested structure
  const questionData = questions.questions || questions;
  const { multiple_choice = [], text_and_numbers = [], documents_and_scans = [] } = questionData;

  return (
    <div className="dynamic-form-container">
      {/* Interview Phase Title */}
      {questions.interview_phase && (
        <div className="form-header">
          <h2 className="form-title">{questions.interview_phase}</h2>
          {questions.instructions_for_user && (
            <p className="form-instructions">{questions.instructions_for_user}</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="dynamic-form">
        {/* Multiple Choice Section */}
        {multiple_choice.length > 0 && (
          <section className="question-section">
            <h3 className="section-title">General Questions</h3>
            {multiple_choice.map(question => (
              <MultipleChoiceQuestion
                key={question.id}
                question={question}
                multiSelect={isMultiSelect(question)}
                value={answers[question.id]}
                onChange={handleAnswerChange}
              />
            ))}
          </section>
        )}

        {/* Text and Numbers Section */}
        {text_and_numbers.length > 0 && (
          <section className="question-section">
            <h3 className="section-title">Detailed Information</h3>
            {text_and_numbers.map(question => (
              <TextNumberQuestion
                key={question.id}
                question={question}
                value={answers[question.id]}
                onChange={handleAnswerChange}
              />
            ))}
          </section>
        )}

        {/* Documents and Scans Section */}
        {documents_and_scans.length > 0 && (
          <section className="question-section">
            <h3 className="section-title">Medical Reports & Documents</h3>
            {documents_and_scans.map(question => (
              <DocumentQuestion
                key={question.id}
                question={question}
                value={answers[question.id]}
                onChange={handleAnswerChange}
              />
            ))}
          </section>
        )}

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answers'}
          </button>
        </div>

        {/* Next Steps */}
        {questions.next_steps && (
          <div className="next-steps-info">
            <p className="next-steps-text">
              <strong>Next:</strong> {questions.next_steps}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
