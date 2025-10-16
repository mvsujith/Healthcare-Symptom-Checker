import { useState } from 'react';
import './Sidebar.css';

export default function Sidebar({ position = 'left', title = 'Panel', children }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    setIsMaximized(false);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    setIsMinimized(false);
  };

  const handleClose = () => {
    setIsClosed(true);
  };

  const handleReopen = () => {
    setIsClosed(false);
    setIsMinimized(false);
  };

  if (isClosed) {
    return (
      <div className={`sidebar-toggle sidebar-toggle-${position}`} onClick={handleReopen}>
        <div className="sidebar-toggle-icon">
          {position === 'left' ? '→' : '←'}
        </div>
        <div className="sidebar-toggle-text">{title}</div>
      </div>
    );
  }

  return (
    <div 
      className={`sidebar sidebar-${position} ${isMinimized ? 'minimized' : ''} ${isMaximized ? 'maximized' : ''}`}
    >
      {/* Window Controls */}
      <div className="sidebar-header">
        <div className="sidebar-title">
          <span className="sidebar-icon">⚡</span>
          {title}
        </div>
        <div className="sidebar-controls">
          <button 
            className="control-btn minimize-btn" 
            onClick={handleMinimize}
            title={isMinimized ? 'Restore' : 'Minimize'}
          >
            {isMinimized ? '□' : '−'}
          </button>
          <button 
            className="control-btn maximize-btn" 
            onClick={handleMaximize}
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? '◱' : '□'}
          </button>
          <button 
            className="control-btn close-btn" 
            onClick={handleClose}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content Area */}
      {!isMinimized && (
        <div className="sidebar-content">
          {children}
        </div>
      )}
    </div>
  );
}
