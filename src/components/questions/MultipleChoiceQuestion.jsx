import { useState } from 'react';
import { isOtherOption } from '../../utils/aiParser';
import './QuestionStyles.css';

/**
 * Multiple Choice Question Component
 * Renders radio buttons (single-select) or checkboxes (multi-select)
 */
export default function MultipleChoiceQuestion({ question, multiSelect = false, value, onChange }) {
  const [otherText, setOtherText] = useState('');
  const [selectedOptions, setSelectedOptions] = useState(value || (multiSelect ? [] : ''));

  const handleChange = (option) => {
    if (multiSelect) {
      // Checkbox logic
      const newSelected = selectedOptions.includes(option)
        ? selectedOptions.filter(o => o !== option)
        : [...selectedOptions, option];
      
      setSelectedOptions(newSelected);
      onChange(question.id, newSelected, isOtherOption(option) ? otherText : null);
    } else {
      // Radio button logic
      setSelectedOptions(option);
      onChange(question.id, option, isOtherOption(option) ? otherText : null);
    }
  };

  const handleOtherTextChange = (e) => {
    const text = e.target.value;
    setOtherText(text);
    
    // Find the "Other" option
    const otherOption = question.options.find(opt => isOtherOption(opt));
    if (otherOption) {
      if (multiSelect) {
        onChange(question.id, selectedOptions, text);
      } else {
        onChange(question.id, selectedOptions, text);
      }
    }
  };

  const isSelected = (option) => {
    if (multiSelect) {
      return selectedOptions.includes(option);
    }
    return selectedOptions === option;
  };

  const showOtherInput = question.options.some(opt => 
    isOtherOption(opt) && isSelected(opt)
  );

  return (
    <div className="dynamic-question dynamic-mcq">
      <label className="question-label">
        {question.question}
        {question.required && <span className="required-indicator"> *</span>}
      </label>
      
      {question.note && (
        <p className="question-note">{question.note}</p>
      )}

      <div 
        className="options-container" 
        role={multiSelect ? "group" : "radiogroup"}
        aria-label={question.question}
      >
        {question.options.map((option, index) => {
          const inputId = `${question.id}-option-${index}`;
          const isOther = isOtherOption(option);
          
          return (
            <div key={inputId} className="option-item">
              <label className="option-label">
                <input
                  type={multiSelect ? "checkbox" : "radio"}
                  id={inputId}
                  name={question.id}
                  value={option}
                  checked={isSelected(option)}
                  onChange={() => handleChange(option)}
                  aria-checked={isSelected(option)}
                  className="option-input"
                />
                <span className="option-text">{option}</span>
              </label>
              
              {isOther && isSelected(option) && (
                <div className="other-input-container">
                  <input
                    type="text"
                    className="other-text-input"
                    placeholder="If Other, please specify"
                    value={otherText}
                    onChange={handleOtherTextChange}
                    aria-label={`Specify other option for ${question.question}`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
