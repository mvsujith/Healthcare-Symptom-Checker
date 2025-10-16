import { useState, useRef, useEffect } from 'react';
import './QuestionStyles.css';

/**
 * Text/Number Question Component
 * Renders appropriate input based on detected type
 */
export default function TextNumberQuestion({ question, value, onChange }) {
  const [inputValue, setInputValue] = useState(value || '');
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(question.id, newValue);
    
    // Auto-grow textarea
    if (e.target.tagName === 'TEXTAREA') {
      autoGrowTextarea(e.target);
    }
  };

  const autoGrowTextarea = (textarea) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
  };

  // Auto-grow on initial load if there's existing value
  useEffect(() => {
    if (textareaRef.current && inputValue) {
      autoGrowTextarea(textareaRef.current);
    }
  }, [inputValue]);

  const renderInput = () => {
    const commonProps = {
      id: question.id,
      value: inputValue,
      onChange: handleChange,
      required: question.required,
      'aria-label': question.question,
      className: 'text-number-input'
    };

    switch (question.inputType) {
      case 'date':
        return <input type="date" {...commonProps} />;
      
      case 'time':
        return <input type="time" {...commonProps} />;
      
      case 'number':
        return (
          <input 
            type="number" 
            {...commonProps} 
            min="0"
            step="1"
            placeholder="Enter number"
          />
        );
      
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            ref={textareaRef}
            rows="2"
            placeholder="Enter your answer here..."
            className="text-number-textarea"
          />
        );
      
      case 'text':
      default:
        return (
          <input 
            type="text" 
            {...commonProps} 
            placeholder="Enter your answer"
          />
        );
    }
  };

  return (
    <div className="dynamic-question dynamic-text-number">
      <label htmlFor={question.id} className="question-label">
        {question.question}
        {question.required && <span className="required-indicator"> *</span>}
      </label>
      
      {question.note && (
        <p className="question-note">{question.note}</p>
      )}

      <div className="question-input-wrapper">
        {renderInput()}
      </div>
    </div>
  );
}
