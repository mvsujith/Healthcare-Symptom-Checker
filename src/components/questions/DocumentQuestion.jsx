import { useState, useRef } from 'react';
import './QuestionStyles.css';

/**
 * Document/Scan Upload Question Component
 * Supports file upload OR text details entry
 */
export default function DocumentQuestion({ question, value, onChange }) {
  const [mode, setMode] = useState(value?.mode || 'upload'); // 'upload' or 'text'
  const [file, setFile] = useState(value?.file || null);
  const [textDetails, setTextDetails] = useState(value?.text || '');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const textDetailsRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  const ACCEPTED_EXTENSIONS = '.pdf,.png,.jpg,.jpeg';

  const validateFile = (file) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }

    // Check file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only PDF, PNG, and JPG files are accepted';
    }

    return null;
  };

  const handleFileChange = (selectedFile) => {
    setError('');

    if (!selectedFile) return;

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);
    onChange(question.id, { mode: 'upload', file: selectedFile, text: null });
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    handleFileChange(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setTextDetails(text);
    onChange(question.id, { mode: 'text', file: null, text });
    
    // Auto-grow textarea
    if (textDetailsRef.current) {
      const textarea = textDetailsRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
    }
  };

  const switchToText = () => {
    setMode('text');
    setFile(null);
    onChange(question.id, { mode: 'text', file: null, text: textDetails });
  };

  const switchToUpload = () => {
    setMode('upload');
    setTextDetails('');
    onChange(question.id, { mode: 'upload', file, text: null });
  };

  const removeFile = () => {
    setFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange(question.id, { mode: 'upload', file: null, text: null });
  };

  return (
    <div className="dynamic-question dynamic-document">
      <label className="question-label">
        {question.question}
        {question.required && <span className="required-indicator"> *</span>}
      </label>
      
      {question.note && (
        <p className="question-note">{question.note}</p>
      )}

      {/* Mode Toggle */}
      <div className="document-mode-toggle">
        <button
          type="button"
          className={`mode-toggle-btn ${mode === 'upload' ? 'active' : ''}`}
          onClick={switchToUpload}
        >
          📁 Upload File
        </button>
        <button
          type="button"
          className={`mode-toggle-btn ${mode === 'text' ? 'active' : ''}`}
          onClick={switchToText}
        >
          📝 Provide Details
        </button>
      </div>

      {/* Upload Mode */}
      {mode === 'upload' && (
        <div className="upload-container">
          <div
            className={`drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            aria-label="File upload area"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              id={`${question.id}-file`}
              className="file-input-hidden"
              accept={ACCEPTED_EXTENSIONS}
              onChange={handleFileSelect}
              aria-label={`Upload file for ${question.question}`}
            />

            {!file ? (
              <>
                <div className="upload-icon">📤</div>
                <p className="upload-text">
                  Drag and drop file here or{' '}
                  <button
                    type="button"
                    className="upload-btn-link"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    choose file
                  </button>
                </p>
                <p className="upload-hint">
                  Accepts: PDF, PNG, JPG (max 10MB)
                </p>
              </>
            ) : (
              <div className="file-preview">
                <div className="file-icon">📄</div>
                <div className="file-info">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={removeFile}
                  aria-label="Remove file"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {error && (
            <p className="error-message" role="alert">
              ⚠️ {error}
            </p>
          )}
        </div>
      )}

      {/* Text Details Mode */}
      {mode === 'text' && (
        <div className="text-details-container">
          <label htmlFor={`${question.id}-text`} className="text-details-label">
            Please provide details of the report
          </label>
          <textarea
            ref={textDetailsRef}
            id={`${question.id}-text`}
            className="text-details-textarea"
            rows="2"
            placeholder="Enter report details, findings, or relevant information..."
            value={textDetails}
            onChange={handleTextChange}
            aria-label="Report details"
          />
        </div>
      )}
    </div>
  );
}
